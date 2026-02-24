/**
 * skill_prob522.js
 * - 7th Grade Probability Comparisons (Lesson 5.2.2)
 * - UPDATED: Sub-skill tracking & Adaptive Weighted Question Selection
 */

var probData = {
    round: 1,
    maxRounds: 3,
    score: 0,
    errors: 0,
    sessionTypes: [], 
    currentType: "", 
    g1: { text: "", n: 0, d: 1, val: 0 },
    g2: { text: "", n: 0, d: 1, val: 0 },
    winner: "" 
};

window.initProbGame = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    probData.round = 1;
    probData.errors = 0;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('Prob522, prob_number, prob_dice, prob_card, prob_spinner')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                probData.score = data.Prob522 || 0;
            }
        }
    } catch (e) {
        console.warn("Probability DB sync error, falling back to local state.");
    }

    // --- ADAPTIVE WEIGHTED SELECTION ---
    const allTypes = ['number', 'dice', 'card', 'spinner'];
    let weightedBag = [];
    
    allTypes.forEach(type => {
        let col = 'prob_' + type;
        let score = window.userMastery[col] || 0;
        // Low score = 4 tickets, Med = 2 tickets, Mastered = 1 ticket
        let weight = score <= 3 ? 4 : (score <= 7 ? 2 : 1);
        for (let i = 0; i < weight; i++) {
            weightedBag.push(type);
        }
    });

    // Pick 3 unique types for this session
    probData.sessionTypes = [];
    while (probData.sessionTypes.length < 3) {
        let r = Math.floor(Math.random() * weightedBag.length);
        let selected = weightedBag[r];
        if (!probData.sessionTypes.includes(selected)) {
            probData.sessionTypes.push(selected);
        }
    }

    startProbRound();
};

function startProbRound() {
    probData.currentType = probData.sessionTypes[probData.round - 1];
    generateProbProblem(probData.currentType);
    renderProbUI();
}

// --- HELPER MATH FUNCTIONS ---
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function countPrimes(min, max) {
    let count = 0;
    for (let i = min; i <= max; i++) if (isPrime(i)) count++;
    return count;
}

function countMultiples(mult, min, max) {
    let count = 0;
    for (let i = min; i <= max; i++) if (i % mult === 0) count++;
    return count;
}

// --- PROBLEM GENERATORS ---
function generateProbProblem(type) {
    if (type === 'number') {
        const tasks = [
            { t: "prime number", fn: countPrimes },
            { t: "multiple of 5", fn: (min, max) => countMultiples(5, min, max) },
            { t: "multiple of 3", fn: (min, max) => countMultiples(3, min, max) }
        ];
        
        let t1 = tasks[Math.floor(Math.random() * tasks.length)];
        let t2 = tasks[Math.floor(Math.random() * tasks.length)];

        let min1 = 1, max1 = [20, 25, 30][Math.floor(Math.random() * 3)];
        probData.g1.text = `Picking a ${t1.t} from the integers between ${min1} and ${max1}`;
        probData.g1.n = t1.fn(min1, max1);
        probData.g1.d = max1 - min1 + 1;

        let min2 = [1, 21][Math.floor(Math.random() * 2)];
        let max2 = min2 === 1 ? [40, 50][Math.floor(Math.random() * 2)] : 40;
        probData.g2.text = `Picking a ${t2.t} from the integers between ${min2} and ${max2}`;
        probData.g2.n = t2.fn(min2, max2);
        probData.g2.d = max2 - min2 + 1;
    } 
    else if (type === 'dice') {
        const pool = [
            { text: "Rolling an even number on one 6-sided die", n: 3, d: 6 },
            { text: "Rolling a 5 or 6 on one 6-sided die", n: 2, d: 6 },
            { text: "Rolling a sum of 7 on two 6-sided dice", n: 6, d: 36 },
            { text: "Rolling a sum greater than 9 on two 6-sided dice", n: 6, d: 36 }, 
            { text: "Rolling doubles (matching numbers) on two 6-sided dice", n: 6, d: 36 }
        ];
        let p1 = pool[Math.floor(Math.random() * pool.length)];
        let p2;
        do { p2 = pool[Math.floor(Math.random() * pool.length)]; } while (p1.text === p2.text);
        
        probData.g1.text = p1.text; probData.g1.n = p1.n; probData.g1.d = p1.d;
        probData.g2.text = p2.text; probData.g2.n = p2.n; probData.g2.d = p2.d;
    } 
    else if (type === 'card') {
        const pool = [
            { text: "Drawing a Heart from a standard 52-card deck", n: 13, d: 52 },
            { text: "Drawing a Face card (J, Q, K) from a standard 52-card deck", n: 12, d: 52 },
            { text: "Drawing an Ace from a standard 52-card deck", n: 4, d: 52 },
            { text: "Drawing a Red card from a standard 52-card deck", n: 26, d: 52 },
            { text: "Drawing a number card less than 5 (Aces excluded) from a 52-card deck", n: 12, d: 52 } 
        ];
        let p1 = pool[Math.floor(Math.random() * pool.length)];
        let p2;
        do { p2 = pool[Math.floor(Math.random() * pool.length)]; } while (p1.text === p2.text);
        
        probData.g1.text = p1.text; probData.g1.n = p1.n; probData.g1.d = p1.d;
        probData.g2.text = p2.text; probData.g2.n = p2.n; probData.g2.d = p2.d;
    } 
    else if (type === 'spinner') {
        let sec1 = [5, 6, 8, 10][Math.floor(Math.random() * 4)];
        let win1 = Math.floor(Math.random() * (sec1 - 2)) + 1; 
        
        let sec2 = [5, 6, 8, 10][Math.floor(Math.random() * 4)];
        let win2 = Math.floor(Math.random() * (sec2 - 2)) + 1;

        const colors = ["Red", "Blue", "Green", "Yellow", "Purple"];
        let c1 = colors[Math.floor(Math.random() * colors.length)];
        let c2;
        do { c2 = colors[Math.floor(Math.random() * colors.length)]; } while (c1 === c2);

        probData.g1.text = `Spinning ${c1} on a spinner with ${sec1} equal sections, where ${win1} are ${c1}`;
        probData.g1.n = win1; probData.g1.d = sec1;
        
        probData.g2.text = `Spinning ${c2} on a spinner with ${sec2} equal sections, where ${win2} are ${c2}`;
        probData.g2.n = win2; probData.g2.d = sec2;
    }

    probData.g1.val = probData.g1.n / probData.g1.d;
    probData.g2.val = probData.g2.n / probData.g2.d;

    if (Math.abs(probData.g1.val - probData.g2.val) < 0.001) probData.winner = 'equal';
    else if (probData.g1.val > probData.g2.val) probData.winner = '1';
    else probData.winner = '2';
}

function renderProbUI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `Probability Comparison (Round ${probData.round}/${probData.maxRounds})`;

    qContent.innerHTML = `
        <div style="max-width: 700px; margin: 0 auto; animation: fadeIn 0.5s;">
            <p style="text-align:center; color:#475569; font-size:15px; margin-bottom:20px;">
                Find the theoretical probability of winning each game. Enter your answers as fractions.
            </p>
            
            <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; margin-bottom:25px;">
                <div style="flex:1; min-width:280px; background:white; padding:20px; border-radius:12px; border:2px solid #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align:center;">
                    <h3 style="margin-top:0; color:#1d4ed8;">Game I</h3>
                    <p style="font-size:15px; color:#334155; min-height:60px; display:flex; align-items:center; justify-content:center;">
                        ${probData.g1.text}
                    </p>
                    <div style="display:inline-flex; flex-direction:column; align-items:center; margin-top:10px;">
                        <input type="number" id="g1-num" style="width:60px; text-align:center; padding:5px; font-size:18px; border:1px solid #cbd5e1; border-radius:4px;" placeholder="num">
                        <div style="width:100%; height:2px; background:#1e293b; margin:5px 0;"></div>
                        <input type="number" id="g1-den" style="width:60px; text-align:center; padding:5px; font-size:18px; border:1px solid #cbd5e1; border-radius:4px;" placeholder="den">
                    </div>
                </div>

                <div style="flex:1; min-width:280px; background:white; padding:20px; border-radius:12px; border:2px solid #10b981; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align:center;">
                    <h3 style="margin-top:0; color:#047857;">Game II</h3>
                    <p style="font-size:15px; color:#334155; min-height:60px; display:flex; align-items:center; justify-content:center;">
                        ${probData.g2.text}
                    </p>
                    <div style="display:inline-flex; flex-direction:column; align-items:center; margin-top:10px;">
                        <input type="number" id="g2-num" style="width:60px; text-align:center; padding:5px; font-size:18px; border:1px solid #cbd5e1; border-radius:4px;" placeholder="num">
                        <div style="width:100%; height:2px; background:#1e293b; margin:5px 0;"></div>
                        <input type="number" id="g2-den" style="width:60px; text-align:center; padding:5px; font-size:18px; border:1px solid #cbd5e1; border-radius:4px;" placeholder="den">
                    </div>
                </div>
            </div>

            <div style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; text-align:center;">
                <label style="font-size:16px; font-weight:bold; color:#1e293b; display:block; margin-bottom:10px;">Which game gives you a better chance of winning?</label>
                <select id="winner-select" style="padding:10px; font-size:16px; border-radius:6px; border:1px solid #94a3b8; width:200px; cursor:pointer;">
                    <option value="">-- Select Winner --</option>
                    <option value="1">Game I</option>
                    <option value="2">Game II</option>
                    <option value="equal">They are equal</option>
                </select>
                
                <div style="margin-top:20px;">
                    <button onclick="checkProbAnswers()" style="background:#1e293b; color:white; padding:12px 30px; font-size:16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Submit Analysis</button>
                </div>
                <div id="prob-feedback" style="margin-top:15px; min-height:24px; font-weight:bold; font-size:15px;"></div>
            </div>
        </div>
    `;
}

window.checkProbAnswers = function() {
    const feedback = document.getElementById('prob-feedback');
    
    const n1 = parseInt(document.getElementById('g1-num').value);
    const d1 = parseInt(document.getElementById('g1-den').value);
    const n2 = parseInt(document.getElementById('g2-num').value);
    const d2 = parseInt(document.getElementById('g2-den').value);
    const wSelection = document.getElementById('winner-select').value;

    if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2) || !wSelection) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Please complete all fractions and select a winner.";
        return;
    }

    if (d1 === 0 || d2 === 0) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Denominators cannot be zero!";
        return;
    }

    const game1Correct = (n1 * probData.g1.d === probData.g1.n * d1);
    const game2Correct = (n2 * probData.g2.d === probData.g2.n * d2);
    const winnerCorrect = (wSelection === probData.winner);

    if (game1Correct && game2Correct && winnerCorrect) {
        feedback.style.color = "#16a34a";
        feedback.innerText = "✅ Correct Analysis!";
        
        let adjustment = probData.errors === 0 ? 1 : 0;
        
        // Pass the sub-skill name to be tracked
        updateProbScore('prob_' + probData.currentType, adjustment);

        probData.round++;
        probData.errors = 0;

        setTimeout(() => {
            if (probData.round > probData.maxRounds) finishProbGame();
            else startProbRound();
        }, 1200);

    } else {
        probData.errors++;
        feedback.style.color = "#dc2626";
        let msg = "Not quite. ";
        if (!game1Correct) msg += "Check Game I math. ";
        if (!game2Correct) msg += "Check Game II math. ";
        if (game1Correct && game2Correct && !winnerCorrect) msg += "Fractions are correct, but check your comparison!";
        feedback.innerText = msg;
    }
};

function updateProbScore(subCol, amt) {
    if (!window.userMastery) window.userMastery = {};
    
    // 1. Update the specific sub-skill (e.g. prob_dice)
    let curSub = window.userMastery[subCol] || 0;
    let nextSub = Math.max(0, Math.min(10, curSub + amt));
    window.userMastery[subCol] = nextSub;

    // 2. Update the main aggregated mastery score
    let curMain = window.userMastery.Prob522 || 0;
    let nextMain = Math.max(0, Math.min(10, curMain + amt));
    window.userMastery.Prob522 = nextMain;

    if (window.supabaseClient && window.currentUser) {
        const h = sessionStorage.getItem('target_hour') || "00";
        window.supabaseClient.from('assignment7')
            // Send both updates to the database simultaneously
            .update({ [subCol]: nextSub, Prob522: nextMain }) 
            .eq('userName', window.currentUser)
            .eq('hour', h)
            .then(({error}) => { if (error) console.error("Score update fail:", error); });
    }
}

function finishProbGame() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">🎲</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">Probability Analysis Complete!</h2>
            <p style="color:#64748b; font-size:16px;">Great logic. Loading next skill...</p>
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
