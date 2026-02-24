/**
 * skill_substitution.js
 * - 7th/8th Grade Evaluating Expressions
 * - Generates an expression (quadratic or linear) and 4 values for x.
 * - Tracks sub-skills based on positive, negative, or zero substitution.
 */

var subData = {
    round: 1,
    maxRounds: 3, 
    score: 0,
    expr: { a: 0, b: 0, c: 0, html: "" },
    questions: [],
    isFirstAttempt: true
};

window.initSubstitutionGame = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    subData.round = 1;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('Substitution, sub_pos, sub_neg, sub_zero')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                subData.score = data.Substitution || 0;
            }
        }
    } catch (e) {
        console.warn("Substitution DB sync error, falling back to local state.");
    }

    startSubRound();
};

function startSubRound() {
    subData.isFirstAttempt = true;
    generateSubProblem();
    renderSubUI();
}

function generateSubProblem() {
    // 1. Generate the Expression coefficients
    let a = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
    let b = Math.floor(Math.random() * 11) - 5; // -5 to 5
    let c = Math.floor(Math.random() * 21) - 10; // -10 to 10

    // Prevent purely constant expressions
    if (a === 0 && b === 0) b = 2; 

    subData.expr = { a, b, c, html: formatExpression(a, b, c) };

    // 2. Generate 4 unique values for x
    let xVals = new Set();
    
    // Guarantee at least one negative and one zero for varied practice
    xVals.add(0);
    xVals.add(Math.floor(Math.random() * -5) - 1); 
    
    while(xVals.size < 4) {
        let x = Math.floor(Math.random() * 13) - 6; // -6 to 6
        xVals.add(x);
    }

    let xArr = Array.from(xVals).sort(() => 0.5 - Math.random()); // Shuffle order
    let labels = ['a', 'b', 'c', 'd'];

    subData.questions = xArr.map((x, i) => {
        let type = x > 0 ? 'pos' : (x < 0 ? 'neg' : 'zero');
        let ans = (a * Math.pow(x, 2)) + (b * x) + c;
        
        return { 
            id: `sub-ans-${i}`, 
            label: labels[i], 
            x: x, 
            ans: ans, 
            type: type,
            attempts: 0,
            scored: false
        };
    });
}

function formatExpression(a, b, c) {
    let str = "";
    
    if (a !== 0) {
        if (a === 1) str += "x<sup>2</sup>";
        else if (a === -1) str += "-x<sup>2</sup>";
        else str += a + "x<sup>2</sup>";
    }

    if (b !== 0) {
        if (str.length > 0) {
            if (b > 0) str += (b === 1) ? " + x" : ` + ${b}x`;
            else str += (b === -1) ? " - x" : ` - ${Math.abs(b)}x`;
        } else {
            if (b === 1) str += "x";
            else if (b === -1) str += "-x";
            else str += b + "x";
        }
    }

    if (c !== 0) {
        if (str.length > 0) {
            str += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
        } else {
            str += c;
        }
    }
    return str;
}

function renderSubUI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `Evaluating Expressions (Round ${subData.round}/${subData.maxRounds})`;

    let gridHtml = subData.questions.map(q => `
        <div style="background:white; padding:15px; border-radius:8px; border:1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; align-items:center;">
            <div style="font-size:18px; color:#334155; margin-bottom:10px; font-weight:bold;">
                ${q.label}. &nbsp; x = ${q.x}
            </div>
            <input type="number" id="${q.id}" class="math-input" placeholder="?" style="width:80px; padding:8px; font-size:18px; border:2px solid #94a3b8; border-radius:6px; text-align:center;">
        </div>
    `).join('');

    qContent.innerHTML = `
        <div style="max-width: 650px; margin: 0 auto; animation: fadeIn 0.5s;">
            <div style="background:#f8fafc; padding:20px; border-radius:12px; border:2px solid #e2e8f0; text-align:center; margin-bottom:25px;">
                <p style="font-size:16px; color:#475569; margin-top:0;">Evaluate the expression for the given values of <em>x</em> below.</p>
                <div style="font-size:32px; font-weight:bold; color:#1d4ed8; font-family:'Courier New', monospace; letter-spacing:2px;">
                    ${subData.expr.html}
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:15px; margin-bottom:20px;">
                ${gridHtml}
            </div>

            <div style="text-align:center; background:white; padding:15px; border-radius:12px; border:1px solid #e2e8f0;">
                <button onclick="checkSubAnswers()" style="background:#1e293b; color:white; padding:12px 30px; font-size:16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;">Check Answers</button>
                <div id="sub-feedback" style="margin-top:15px; min-height:24px; font-weight:bold; font-size:15px;"></div>
            </div>
        </div>
    `;
    
    // Auto-focus the first input
    setTimeout(() => { document.getElementById(subData.questions[0].id)?.focus(); }, 100);
}

window.checkSubAnswers = function() {
    const feedback = document.getElementById('sub-feedback');
    let allCorrect = true;
    let missingInput = false;
    let updates = {};

    // Check all 4 inputs
    subData.questions.forEach(q => {
        const input = document.getElementById(q.id);
        const userVal = parseFloat(input.value);

        if (isNaN(userVal)) {
            missingInput = true;
            return;
        }

        if (userVal === q.ans) {
            input.style.backgroundColor = "#dcfce7";
            input.style.borderColor = "#22c55e";
            input.disabled = true;

            // Give sub-skill credit ONLY if they got it on their first try
            if (!q.scored && q.attempts === 0) {
                let col = 'sub_' + q.type;
                let current = window.userMastery[col] || 0;
                updates[col] = Math.min(10, current + 1);
                window.userMastery[col] = updates[col];
                q.scored = true;
            }
        } else {
            allCorrect = false;
            q.attempts++;
            input.style.backgroundColor = "#fee2e2";
            input.style.borderColor = "#ef4444";
        }
    });

    if (missingInput) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Please fill in all four boxes!";
        return;
    }

    if (allCorrect) {
        feedback.style.color = "#16a34a";
        feedback.innerText = "✅ All correct!";
        
        // Update the main score if the whole board was flawless on the first try
        if (subData.isFirstAttempt) {
            let curMain = window.userMastery.Substitution || 0;
            updates.Substitution = Math.min(10, curMain + 1);
            window.userMastery.Substitution = updates.Substitution;
        }

        // Fire and forget DB sync if there are any updates
        if (Object.keys(updates).length > 0 && window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            window.supabaseClient.from('assignment7')
                .update(updates)
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .then(({error}) => { if (error) console.error("DB update failed:", error); });
        }

        subData.round++;
        setTimeout(() => {
            if (subData.round > subData.maxRounds) finishSubGame();
            else startSubRound();
        }, 1500);

    } else {
        subData.isFirstAttempt = false;
        feedback.style.color = "#dc2626";
        
        // Contextual Hint Logic based on what they missed
        let missedNeg = subData.questions.some(q => q.attempts > 0 && q.type === 'neg' && q.scored === false);
        let missedZero = subData.questions.some(q => q.attempts > 0 && q.type === 'zero' && q.scored === false);
        
        if (missedNeg) {
            feedback.innerHTML = "❌ Not quite. <strong>Hint:</strong> Be very careful when squaring negative numbers! e.g., (-3)<sup>2</sup> = +9.";
        } else if (missedZero) {
            feedback.innerHTML = "❌ Not quite. <strong>Hint:</strong> Remember that anything multiplied by zero is zero!";
        } else {
            feedback.innerText = "❌ Some answers are incorrect. Try again!";
        }
    }
};

function finishSubGame() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">🔢</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">Substitution Complete!</h2>
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
