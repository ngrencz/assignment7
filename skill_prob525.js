/**
 * skill_prob525.js
 * - 7th Grade: Probability of More Than Two Events (Lesson 5.2.5)
 * - 3 Sequential Events (e.g. 3 people drawing blocks with replacement)
 * - Tracks primary skill (Prob525) and sub-skills (p3_total, p3_match, p3_diff, p3_fair)
 */

console.log("🚀 skill_prob525.js is LIVE");

var p525Data = {
    round: 1,
    maxRounds: 3, 
    score: 0,
    isFirstAttempt: true,
    scenario: {},
    questions: []
};

window.initProb525Game = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    p525Data.round = 1;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('Prob525, p3_total, p3_match, p3_diff, p3_fair')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                p525Data.score = data.Prob525 || 0;
            }
        }
    } catch (e) {
        console.warn("Prob525 DB sync error, falling back to local state.");
    }

    startP525Round();
};

function startP525Round() {
    p525Data.isFirstAttempt = true;
    generateP525Scenario();
    renderP525UI();
}

function generateP525Scenario() {
    // 1. Generate a random 3-event scenario (N options, 3 actors)
    const N = Math.random() > 0.5 ? 3 : 4; // 3 or 4 options to keep math reasonable (27 or 64 total)
    
    const templates = [
        {
            names: ["Marcus", "his brother", "his sister"],
            action: "deciding who does chores. Each of them has their own bag containing",
            items: ["Red", "Blue", "Green", "Yellow"].slice(0, N),
            suffix: "blocks. Each person draws one block from their own bag."
        },
        {
            names: ["Sarah", "Leo", "Maya"],
            action: "playing a board game. On their turn, each of them spins a spinner that is divided into",
            items: ["1", "2", "3", "4"].slice(0, N),
            suffix: "equal sections."
        },
        {
            names: ["Coach A", "Coach B", "Coach C"],
            action: "randomly assigning practice jerseys. Each coach pulls one jersey out of a box containing",
            items: ["White", "Black", "Orange", "Grey"].slice(0, N),
            suffix: "jerseys with replacement."
        }
    ];

    const t = templates[Math.floor(Math.random() * templates.length)];
    const itemList = t.items.slice(0, -1).join(', ') + ", and " + t.items[t.items.length - 1];
    const story = `<strong>${t.names.join(', ')}</strong> are ${t.action} <strong>${N}</strong> ${itemList} ${t.suffix}`;

    // Math Calculations
    const totalOutcomes = Math.pow(N, 3); // N * N * N
    const matchOutcomes = N; // e.g., RRR, BBB, GGG
    const diffOutcomes = N * (N - 1) * (N - 2); // First picks any, second picks remaining, third picks remaining
    const exactlyTwoOutcomes = totalOutcomes - matchOutcomes - diffOutcomes;

    p525Data.scenario = { story, N, totalOutcomes, matchOutcomes, diffOutcomes, exactlyTwoOutcomes };

    // 2. Build Questions
    p525Data.questions = [
        {
            id: 'q-total', type: 'integer', subskill: 'p3_total',
            text: `If you draw a probability tree for all 3 people, how many total possible combinations are there in the sample space?`,
            ans: totalOutcomes,
            hint: `Multiply the number of options for Person 1, by the options for Person 2, by the options for Person 3. (${N} × ${N} × ${N})`,
            attempts: 0, scored: false
        },
        {
            id: 'q-match', type: 'fraction', subskill: 'p3_match',
            text: `What is the theoretical probability that all 3 people get the <strong>exact same</strong> result?`,
            n: matchOutcomes, d: totalOutcomes,
            hint: `How many branches on your tree show the exact same thing 3 times in a row? (e.g., ${t.items[0]}, ${t.items[0]}, ${t.items[0]})`,
            attempts: 0, scored: false
        },
        {
            id: 'q-diff', type: 'fraction', subskill: 'p3_diff',
            text: `What is the probability that all 3 people get completely <strong>different</strong> results?`,
            n: diffOutcomes, d: totalOutcomes,
            hint: `Person 1 has ${N} options. Person 2 only has ${N-1} options left. Person 3 only has ${N-2} options left. Multiply those together for the numerator!`,
            attempts: 0, scored: false
        },
        {
            id: 'q-fair', type: 'integer', subskill: 'p3_fair',
            text: `If a rule states "You win if exactly TWO results match", how many of the combinations result in exactly two matching?`,
            ans: exactlyTwoOutcomes,
            hint: `Total Combinations - (All 3 Match) - (All 3 Different) = Exactly 2 Match.`,
            attempts: 0, scored: false
        }
    ];
}

function renderP525UI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `3-Event Probability (Round ${p525Data.round}/${p525Data.maxRounds})`;

    let questionsHtml = p525Data.questions.map((q, i) => {
        let inputHtml = "";
        if (q.type === 'integer') {
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
            <div style="background:#f0fdf4; padding:20px; border-radius:12px; border:2px solid #bbf7d0; margin-bottom:25px; border-left: 5px solid #22c55e;">
                <p style="font-size:17px; color:#166534; line-height:1.5; margin:0;">
                    ${p525Data.scenario.story}
                </p>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
                ${questionsHtml}
            </div>

            <div style="text-align:center; background:white; padding:15px; border-radius:12px; border:1px solid #e2e8f0;">
                <button onclick="checkP525Answers()" style="background:#1e293b; color:white; padding:12px 35px; font-size:16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;">Submit Analysis</button>
                <div id="p525-feedback" style="margin-top:15px; min-height:24px; font-weight:bold; font-size:15px;"></div>
                <div id="p525-hint" style="margin-top: 15px; padding: 15px; background: #fffbeb; border: 1px dashed #f59e0b; border-radius: 8px; display: none; font-size: 14px; color: #92400e; text-align:left; line-height: 1.4;"></div>
            </div>
        </div>
    `;
}

window.checkP525Answers = function() {
    const feedback = document.getElementById('p525-feedback');
    const hintBox = document.getElementById('p525-hint');
    
    let allCorrect = true;
    let missingInput = false;
    let activeHints = [];
    let updates = {};

    p525Data.questions.forEach(q => {
        const card = document.getElementById(`card-${q.id}`);
        let isCorrect = false;

        if (q.type === 'integer') {
            const val = parseInt(document.getElementById(`ans-${q.id}`).value);
            if (isNaN(val)) missingInput = true;
            else if (val === q.ans) isCorrect = true;
        } 
        else if (q.type === 'fraction') {
            const n = parseInt(document.getElementById(`num-${q.id}`).value);
            const d = parseInt(document.getElementById(`den-${q.id}`).value);
            
            if (isNaN(n) || isNaN(d)) missingInput = true;
            else if (d === 0) isCorrect = false;
            else if (n * q.d === q.n * d) isCorrect = true; // Cross-multiplication accepts unsimplified
        }

        if (missingInput) return;

        if (isCorrect) {
            card.style.borderColor = "#22c55e";
            card.style.background = "#f0fdf4";
            
            // Lock inputs
            if(q.type === 'integer') document.getElementById(`ans-${q.id}`).disabled = true;
            else {
                document.getElementById(`num-${q.id}`).disabled = true;
                document.getElementById(`den-${q.id}`).disabled = true;
            }

            // Award Sub-skill Point
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
        
        // Award Main Skill Point if perfect round
        if (p525Data.isFirstAttempt) {
            let curMain = window.userMastery.Prob525 || 0;
            updates.Prob525 = Math.min(10, curMain + 1);
            window.userMastery.Prob525 = updates.Prob525;
        }

        // Fire & Forget DB Update
        if (Object.keys(updates).length > 0 && window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            window.supabaseClient.from('assignment7')
                .update(updates)
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .then(({error}) => { if (error) console.error("DB update failed:", error); });
        }

        p525Data.round++;
        setTimeout(() => {
            if (p525Data.round > p525Data.maxRounds) finishP525Game();
            else startP525Round();
        }, 1500);

    } else {
        p525Data.isFirstAttempt = false;
        feedback.style.color = "#dc2626";
        feedback.innerText = "❌ Some answers are incorrect. Check the red boxes!";
        
        hintBox.style.display = "block";
        hintBox.innerHTML = `<strong>Need a hint?</strong><br>${activeHints.join("<br>")}`;
    }
};

function finishP525Game() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">🧊</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">3-Event Mastered!</h2>
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
