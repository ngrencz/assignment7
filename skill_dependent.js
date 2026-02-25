/**
 * skill_dependent.js
 * - 7th Grade: Independent vs Dependent Events (Lesson 5.2.3)
 * - Presents 4 scenarios per round.
 * - Tracks subskills: Spinners/Dice, Cards, and Real-World Objects.
 */

var depData = {
    round: 1,
    maxRounds: 2, 
    score: 0,
    questions: [],
    isFirstAttempt: true
};

window.initDependentGame = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    depData.round = 1;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('DependentProb, dep_spinner, dep_card, dep_realworld')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                depData.score = data.DependentProb || 0;
            }
        }
    } catch (e) {
        console.warn("Dependent DB sync error, falling back to local state.");
    }

    startDepRound();
};

function startDepRound() {
    depData.isFirstAttempt = true;
    generateDepScenarios();
    renderDepUI();
}

function generateDepScenarios() {
    depData.questions = [];
    
    // Weighted selection logic to prioritize weak subskills
    const allTypes = ['spinner', 'card', 'realworld'];
    let weightedBag = [];
    
    allTypes.forEach(type => {
        let col = 'dep_' + type;
        let score = window.userMastery[col] || 0;
        let weight = score <= 3 ? 4 : (score <= 7 ? 2 : 1);
        for (let i = 0; i < weight; i++) weightedBag.push(type);
    });

    for (let i = 0; i < 4; i++) {
        let type = weightedBag[Math.floor(Math.random() * weightedBag.length)];
        let text = "";
        let isDependent = false;

        if (type === 'spinner') {
            const pool = [
                "Spinning a 3 on a spinner after having just spun a 2.",
                "Rolling an even number on a die after rolling a 6.",
                "Flipping a coin and getting Heads, then flipping it again and getting Tails.",
                "Spinning 'Red' on a color spinner, then spinning 'Red' again."
            ];
            text = pool[Math.floor(Math.random() * pool.length)];
            isDependent = false; // Spinners/Dice/Coins are ALWAYS independent
        } 
        else if (type === 'card') {
            const pool = [
                { t: "Drawing a red 6 from a deck of cards after the 3 of spades was just drawn and not returned to the deck.", dep: true },
                { t: "Drawing a face card from a deck after a Jack was drawn, replaced, and the deck was shuffled.", dep: false },
                { t: "Pulling an Ace from a deck, keeping it in your hand, and then pulling another Ace.", dep: true },
                { t: "Drawing a Heart from a deck, putting it back, and drawing another Heart.", dep: false }
            ];
            let p = pool[Math.floor(Math.random() * pool.length)];
            text = p.t;
            isDependent = p.dep;
        } 
        else if (type === 'realworld') {
            const pool = [
                { t: "Selecting a lemon-lime soda if the person before you reaches into a cooler, removes one, and drinks it.", dep: true },
                { t: "Pulling a blue marble from a bag, looking at it, putting it back, and then pulling a red marble.", dep: false },
                { t: "Choosing a pair of black socks from a drawer, putting them on, and then your brother choosing socks from the same drawer.", dep: true },
                { t: "Picking a strawberry candy from a jar, eating it, and then picking a cherry candy.", dep: true }
            ];
            let p = pool[Math.floor(Math.random() * pool.length)];
            text = p.t;
            isDependent = p.dep;
        }

        depData.questions.push({
            id: `dep-ans-${i}`,
            text: text,
            type: type,
            isDependent: isDependent,
            userSelection: null,
            scored: false,
            attempts: 0
        });
    }
}

function renderDepUI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `Classifying Events (Round ${depData.round}/${depData.maxRounds})`;

    let rowsHtml = depData.questions.map((q, i) => `
        <div id="row-${q.id}" style="background:white; padding:15px 20px; border-radius:8px; border:1px solid #cbd5e1; margin-bottom:12px; display:flex; flex-direction:column; gap:10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: 0.2s;">
            <div style="font-size:16px; color:#1e293b; line-height: 1.4;">
                <strong>${String.fromCharCode(97 + i)}.</strong> P(${q.text.replace(/\.$/, '')})
            </div>
            <div style="display:flex; gap:10px;">
                <button id="btn-ind-${q.id}" onclick="selectDepOption('${q.id}', false)" style="flex:1; padding:10px; background:#f1f5f9; color:#475569; border:2px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;">Independent</button>
                <button id="btn-dep-${q.id}" onclick="selectDepOption('${q.id}', true)" style="flex:1; padding:10px; background:#f1f5f9; color:#475569; border:2px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:bold; transition:0.2s;">Dependent</button>
            </div>
        </div>
    `).join('');

    qContent.innerHTML = `
        <div style="max-width: 700px; margin: 0 auto; animation: fadeIn 0.5s;">
            <div style="background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0; text-align:center; margin-bottom:20px;">
                <p style="font-size:15px; color:#475569; margin:0;">
                    Does the outcome of the second event depend on the first event? 
                    <br>Select <strong>Dependent</strong> or <strong>Independent</strong> for each scenario.
                </p>
            </div>
            
            ${rowsHtml}

            <div style="text-align:center; margin-top:20px;">
                <button onclick="checkDepAnswers()" style="background:#1e293b; color:white; padding:12px 35px; font-size:16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; box-shadow: 0 2px 0 #0f172a;">Submit Classifications</button>
                <div id="dep-feedback" style="margin-top:15px; min-height:24px; font-weight:bold; font-size:16px;"></div>
                <div id="dep-hint" style="margin-top: 15px; padding: 15px; background: #fffbeb; border: 1px dashed #f59e0b; border-radius: 8px; display: none; font-size: 14px; color: #92400e; text-align:left; line-height: 1.4;"></div>
            </div>
        </div>
    `;

    // Restore selections if UI re-renders
    depData.questions.forEach(q => {
        if (q.userSelection !== null) {
            selectDepOption(q.id, q.userSelection);
        }
    });
}

window.selectDepOption = function(id, isDependent) {
    const q = depData.questions.find(x => x.id === id);
    if (!q || q.disabled) return;

    q.userSelection = isDependent;

    const btnInd = document.getElementById(`btn-ind-${id}`);
    const btnDep = document.getElementById(`btn-dep-${id}`);

    // Reset styles
    btnInd.style.background = "#f1f5f9"; btnInd.style.borderColor = "#cbd5e1"; btnInd.style.color = "#475569";
    btnDep.style.background = "#f1f5f9"; btnDep.style.borderColor = "#cbd5e1"; btnDep.style.color = "#475569";

    // Apply active style
    if (isDependent) {
        btnDep.style.background = "#dbeafe"; btnDep.style.borderColor = "#3b82f6"; btnDep.style.color = "#1d4ed8";
    } else {
        btnInd.style.background = "#dbeafe"; btnInd.style.borderColor = "#3b82f6"; btnInd.style.color = "#1d4ed8";
    }
};

window.checkDepAnswers = function() {
    const feedback = document.getElementById('dep-feedback');
    const hintBox = document.getElementById('dep-hint');
    
    let allAnswered = depData.questions.every(q => q.userSelection !== null);
    if (!allAnswered) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Please classify all four events!";
        return;
    }

    let allCorrect = true;
    let missedSpinner = false;
    let missedReplacement = false;
    let updates = {};

    depData.questions.forEach(q => {
        const row = document.getElementById(`row-${q.id}`);
        const btnInd = document.getElementById(`btn-ind-${q.id}`);
        const btnDep = document.getElementById(`btn-dep-${q.id}`);

        if (q.userSelection === q.isDependent) {
            row.style.borderColor = "#22c55e";
            row.style.background = "#f0fdf4";
            q.disabled = true;
            btnInd.disabled = true; btnDep.disabled = true;
            btnInd.style.cursor = "default"; btnDep.style.cursor = "default";

            if (!q.scored && q.attempts === 0) {
                let col = 'dep_' + q.type;
                let current = window.userMastery[col] || 0;
                updates[col] = Math.min(10, current + 1);
                window.userMastery[col] = updates[col];
                q.scored = true;
            }
        } else {
            allCorrect = false;
            q.attempts++;
            row.style.borderColor = "#ef4444";
            row.style.background = "#fef2f2";
            
            if (q.type === 'spinner') missedSpinner = true;
            else missedReplacement = true;
        }
    });

    if (allCorrect) {
        feedback.style.color = "#16a34a";
        feedback.innerText = "✅ All Classifications Correct!";
        hintBox.style.display = "none";
        
        if (depData.isFirstAttempt) {
            let curMain = window.userMastery.DependentProb || 0;
            updates.DependentProb = Math.min(10, curMain + 1);
            window.userMastery.DependentProb = updates.DependentProb;
        }

        if (Object.keys(updates).length > 0 && window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            window.supabaseClient.from('assignment7')
                .update(updates)
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .then(({error}) => { if (error) console.error("DB update failed:", error); });
        }

        depData.round++;
        setTimeout(() => {
            if (depData.round > depData.maxRounds) finishDepGame();
            else startDepRound();
        }, 1500);

    } else {
        depData.isFirstAttempt = false;
        feedback.style.color = "#dc2626";
        feedback.innerText = "❌ Some are incorrect. Check the red boxes!";
        
        hintBox.style.display = "block";
        let hints = [];
        if (missedSpinner) hints.push("<strong>Spinners, Coins, and Dice</strong> have no memory! Previous results never affect the next one, making them <strong>Independent</strong>.");
        if (missedReplacement) hints.push("<strong>Cards & Objects:</strong> Look for keywords. If the object is 'replaced' or 'put back', it is Independent. If it is 'kept', 'eaten', or 'not returned', the total changes, making it <strong>Dependent</strong>!");
        hintBox.innerHTML = hints.join("<br><br>");
    }
};

function finishDepGame() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">🔗</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">Classifications Complete!</h2>
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
