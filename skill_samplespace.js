/**
 * skill_samplespace.js
 * - 7th Grade: Sample Space & Compound Probability
 * - Generates a 2-category scenario and asks 4 progressive questions.
 */

var ssData = {
    round: 1,
    maxRounds: 3, 
    score: 0,
    scenario: {},
    questions: [],
    isFirstAttempt: true
};

window.initSampleSpaceGame = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    ssData.round = 1;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('SampleSpace, ss_total, ss_single, ss_complex, ss_zero')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                ssData.score = data.SampleSpace || 0;
            }
        }
    } catch (e) {
        console.warn("SampleSpace DB sync error, falling back to local state.");
    }

    startSSRound();
};

function startSSRound() {
    ssData.isFirstAttempt = true;
    generateSSScenario();
    renderSSUI();
}

function generateSSScenario() {
    // 1. Define Scenario Templates
    const templates = [
        {
            intro: "[Name] is at an ice cream shop. The container can be a [C1] or a [C2]. The flavor choices are [F1], [F2], or [F3].",
            cat1: ["Waffle Cone", "Sugar Cone", "Sundae Bowl", "Waffle Bowl"],
            cat2: ["Vanilla", "Chocolate", "Strawberry", "Mint", "Apricot", "Blackberry"],
            impossible: ["Orange Sherbet", "Cookie Dough", "Pistachio"]
        },
        {
            intro: "[Name] is ordering a lunch special. They must choose a bread: [C1] or [C2]. Then they must choose a meat: [F1], [F2], or [F3].",
            cat1: ["White", "Wheat", "Rye", "Sourdough"],
            cat2: ["Turkey", "Ham", "Roast Beef", "Chicken", "Salami"],
            impossible: ["Tuna Salad", "Meatball", "Veggie"]
        },
        {
            intro: "[Name] is buying a new car. The model can be a [C1] or a [C2]. The color choices are [F1], [F2], or [F3].",
            cat1: ["Sedan", "SUV", "Truck", "Coupe"],
            cat2: ["Red", "Blue", "Black", "Silver", "White"],
            impossible: ["Green", "Yellow", "Purple"]
        }
    ];

    const names = ["Mario", "Skye", "Jamal", "Sarah", "Leo", "Maya"];
    let t = templates[Math.floor(Math.random() * templates.length)];
    
    // Shuffle and pick options
    let c1Options = [...t.cat1].sort(() => 0.5 - Math.random()).slice(0, 2);
    let c2Options = [...t.cat2].sort(() => 0.5 - Math.random()).slice(0, 3);
    let imp = t.impossible[Math.floor(Math.random() * t.impossible.length)];
    let name = names[Math.floor(Math.random() * names.length)];

    let story = t.intro.replace('[Name]', name)
        .replace('[C1]', c1Options[0].toLowerCase()).replace('[C2]', c1Options[1].toLowerCase())
        .replace('[F1]', c2Options[0].toLowerCase()).replace('[F2]', c2Options[1].toLowerCase()).replace('[F3]', c2Options[2].toLowerCase());

    const totalOutcomes = c1Options.length * c2Options.length;

    ssData.scenario = { story, name, c1: c1Options, c2: c2Options, imp, total: totalOutcomes };

    // 2. Generate the 4 Progressive Questions
    ssData.questions = [];

    // Q1: Total combinations (Input type: integer)
    ssData.questions.push({
        id: 'q-total',
        type: 'total',
        subskill: 'ss_total',
        text: `How many total possible combinations are there?`,
        ans: totalOutcomes,
        hint: "Multiply the number of choices in the first category by the number of choices in the second category.",
        attempts: 0, scored: false
    });

    // Q2: Single attribute (Input type: fraction)
    let q2Choice = Math.random() > 0.5 ? c1Options[0] : c2Options[0];
    let q2Num = q2Choice === c1Options[0] ? c2Options.length : c1Options.length;
    ssData.questions.push({
        id: 'q-single',
        type: 'fraction',
        subskill: 'ss_single',
        text: `What is the probability of getting something with <strong>${q2Choice.toLowerCase()}</strong>?`,
        n: q2Num, d: totalOutcomes,
        hint: `How many of the total combinations include ${q2Choice.toLowerCase()}? Count them up!`,
        attempts: 0, scored: false
    });

    // Q3: Complex OR (Input type: fraction)
    // E.g., P(Option1 OR (Option2 + Option3))
    let targetC2 = c2Options[1]; 
    let targetC1 = c1Options[1]; 
    let targetC2_2 = c2Options[2];
    
    // Number of combos with targetC2 = c1Options.length (which is 2)
    // PLUS the specific combo (targetC1 + targetC2_2) = 1
    // Total numerator = 3
    ssData.questions.push({
        id: 'q-complex',
        type: 'fraction',
        subskill: 'ss_complex',
        text: `What is the probability of getting <strong>${targetC2.toLowerCase()}</strong> OR a <strong>${targetC1.toLowerCase()} with ${targetC2_2.toLowerCase()}</strong>?`,
        n: c1Options.length + 1, d: totalOutcomes,
        hint: `First, count ALL the combinations that have ${targetC2.toLowerCase()}. Then, add the ONE specific combination of ${targetC1.toLowerCase()} with ${targetC2_2.toLowerCase()}.`,
        attempts: 0, scored: false
    });

    // Q4: Impossible (Input type: fraction)
    ssData.questions.push({
        id: 'q-zero',
        type: 'fraction',
        subskill: 'ss_zero',
        text: `What is the probability of getting <strong>${imp.toLowerCase()}</strong>?`,
        n: 0, d: totalOutcomes,
        hint: `Is ${imp.toLowerCase()} even an option in the story above? If it's impossible, what is the numerator?`,
        attempts: 0, scored: false
    });
}

function renderSSUI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `Sample Space Analysis (Round ${ssData.round}/${ssData.maxRounds})`;

    let questionsHtml = ssData.questions.map((q, i) => {
        let inputHtml = "";
        if (q.type === 'total') {
            inputHtml = `<input type="number" id="ans-${q.id}" style="width:70px; text-align:center; padding:8px; font-size:18px; border:2px solid #cbd5e1; border-radius:6px;">`;
        } else {
            inputHtml = `
                <div style="display:inline-flex; flex-direction:column; align-items:center;">
                    <input type="number" id="num-${q.id}" style="width:60px; text-align:center; padding:5px; font-size:16px; border:2px solid #cbd5e1; border-radius:4px;">
                    <div style="width:100%; height:2px; background:#1e293b; margin:4px 0;"></div>
                    <input type="number" id="den-${q.id}" style="width:60px; text-align:center; padding:5px; font-size:16px; border:2px solid #cbd5e1; border-radius:4px;">
                </div>
            `;
        }

        return `
            <div id="card-${q.id}" style="background:white; padding:15px; border-radius:8px; border:1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; gap:15px; box-shadow:0 1px 3px rgba(0,0,0,0.05); transition:0.2s;">
                <div style="font-size:15px; color:#1e293b; flex:1;">
                    <strong>${String.fromCharCode(97 + i)}.</strong> ${q.text}
                </div>
                <div>${inputHtml}</div>
            </div>
        `;
    }).join('');

    qContent.innerHTML = `
        <div style="max-width: 750px; margin: 0 auto; animation: fadeIn 0.5s;">
            <div style="background:#f8fafc; padding:20px; border-radius:12px; border:2px solid #e2e8f0; margin-bottom:25px;">
                <h3 style="margin-top:0; color:#0f172a; font-size:16px;">Scenario:</h3>
                <p style="font-size:18px; color:#334155; line-height:1.5; margin-bottom:0;">
                    ${ssData.scenario.story}
                </p>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
                ${questionsHtml}
            </div>

            <div style="text-align:center; background:white; padding:15px; border-radius:12px; border:1px solid #e2e8f0;">
                <button onclick="checkSSAnswers()" style="background:#1e293b; color:white; padding:12px 35px; font-size:16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;">Check Analysis</button>
                <div id="ss-feedback" style="margin-top:15px; min-height:24px; font-weight:bold; font-size:15px;"></div>
                <div id="ss-hint" style="margin-top: 15px; padding: 15px; background: #fffbeb; border: 1px dashed #f59e0b; border-radius: 8px; display: none; font-size: 14px; color: #92400e; text-align:left; line-height: 1.4;"></div>
            </div>
        </div>
    `;
}

window.checkSSAnswers = function() {
    const feedback = document.getElementById('ss-feedback');
    const hintBox = document.getElementById('ss-hint');
    
    let allCorrect = true;
    let missingInput = false;
    let activeHints = [];
    let updates = {};

    ssData.questions.forEach(q => {
        const card = document.getElementById(`card-${q.id}`);
        let isCorrect = false;

        if (q.type === 'total') {
            const val = parseInt(document.getElementById(`ans-${q.id}`).value);
            if (isNaN(val)) missingInput = true;
            else if (val === q.ans) isCorrect = true;
        } 
        else if (q.type === 'fraction') {
            const n = parseInt(document.getElementById(`num-${q.id}`).value);
            const d = parseInt(document.getElementById(`den-${q.id}`).value);
            
            if (isNaN(n) || isNaN(d)) missingInput = true;
            else if (d === 0) { isCorrect = false; }
            else if (q.n === 0 && n === 0) { isCorrect = true; } // Special case for 0 numerator
            else if (n * q.d === q.n * d) { isCorrect = true; } // Cross-multiplication for unsimplified
        }

        if (missingInput) return;

        if (isCorrect) {
            card.style.borderColor = "#22c55e";
            card.style.background = "#f0fdf4";
            
            // Disable inputs if correct
            if(q.type === 'total') document.getElementById(`ans-${q.id}`).disabled = true;
            else {
                document.getElementById(`num-${q.id}`).disabled = true;
                document.getElementById(`den-${q.id}`).disabled = true;
            }

            if (!q.scored && q.attempts === 0) {
                let current = window.userMastery[q.subskill] || 0;
                updates[q.subskill] = Math.min(10, current + 1);
                window.userMastery[q.subskill] = updates[q.subskill];
                q.scored = true;
            }
        } else {
            allCorrect = false;
            q.attempts++;
            card.style.borderColor = "#ef4444";
            card.style.background = "#fef2f2";
            if (!activeHints.includes(q.hint)) activeHints.push(`• ${q.hint}`);
        }
    });

    if (missingInput) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Please fill in all boxes!";
        return;
    }

    if (allCorrect) {
        feedback.style.color = "#16a34a";
        feedback.innerText = "✅ Excellent Analysis!";
        hintBox.style.display = "none";
        
        if (ssData.isFirstAttempt) {
            let curMain = window.userMastery.SampleSpace || 0;
            updates.SampleSpace = Math.min(10, curMain + 1);
            window.userMastery.SampleSpace = updates.SampleSpace;
        }

        if (Object.keys(updates).length > 0 && window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            window.supabaseClient.from('assignment7')
                .update(updates)
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .then(({error}) => { if (error) console.error("DB update failed:", error); });
        }

        ssData.round++;
        setTimeout(() => {
            if (ssData.round > ssData.maxRounds) finishSSGame();
            else startSSRound();
        }, 1500);

    } else {
        ssData.isFirstAttempt = false;
        feedback.style.color = "#dc2626";
        feedback.innerText = "❌ Some answers are incorrect. Check the red boxes!";
        
        hintBox.style.display = "block";
        hintBox.innerHTML = `<strong>Need a hint?</strong><br>${activeHints.join("<br>")}`;
    }
};

function finishSSGame() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">🍦</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">Sample Space Mastered!</h2>
            <p style="color:#64748b; font-size:16px;">Loading next skill...</p>
        </div>
    `;

    setTimeout(() => { 
        if (typeof window.loadNextQuestion === 'function') {
            window.loadNextQuestion(); 
        } else {
            location.reload(); 
        }
    }, 2500);
}
