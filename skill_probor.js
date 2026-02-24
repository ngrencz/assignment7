/**
 * skill_probor.js
 * - 7th Grade Compound Probability (OR events)
 * - Generates scenarios for Numbers, Dice, Cards, and Spinners.
 * - Tracks specific sub-skills and uses adaptive weighting.
 */

var probOrData = {
    round: 1,
    maxRounds: 4,
    score: 0,
    errors: 0,
    currentType: "",
    qText: "",
    hintText: "",
    n: 0,
    d: 1
};

window.initProbOrGame = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    probOrData.round = 1;
    probOrData.errors = 0;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('ProbOr, por_number, por_dice, por_card, por_spinner')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                probOrData.score = data.ProbOr || 0;
            }
        }
    } catch (e) {
        console.warn("ProbOr DB sync error, falling back to local state.");
    }

    startProbOrRound();
};

function startProbOrRound() {
    // Adaptive Weighting Selection
    const allTypes = ['number', 'dice', 'card', 'spinner'];
    let weightedBag = [];
    
    allTypes.forEach(type => {
        let col = 'por_' + type;
        let score = window.userMastery[col] || 0;
        let weight = score <= 3 ? 4 : (score <= 7 ? 2 : 1);
        for (let i = 0; i < weight; i++) weightedBag.push(type);
    });

    probOrData.currentType = weightedBag[Math.floor(Math.random() * weightedBag.length)];
    
    generateProbOrProblem(probOrData.currentType);
    renderProbOrUI();
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

// --- PROBLEM GENERATORS ---
function generateProbOrProblem(type) {
    let n = 0, d = 1, text = "", hint = "";

    if (type === 'number') {
        let max = [20, 25, 30][Math.floor(Math.random() * 3)];
        d = max;
        
        const numPool = [
            { t: `a multiple of 3 OR a multiple of 7`, fn: (x) => x % 3 === 0 || x % 7 === 0, h: "List the multiples of 3, list the multiples of 7. Count how many unique numbers you have in total!" },
            { t: `an even number OR an odd number`, fn: (x) => x % 2 === 0 || x % 2 !== 0, h: "Every integer is either even or odd. What does that mean for your chances?" },
            { t: `a prime number OR the number 1`, fn: (x) => isPrime(x) || x === 1, h: "List all the primes up to your max number, and don't forget to include the number 1." },
            { t: `a number less than 5 OR greater than 15`, fn: (x) => x < 5 || x > 15, h: "Count the numbers that are 1, 2, 3, or 4. Then count the numbers that are 16, 17, etc." }
        ];
        
        let p = numPool[Math.floor(Math.random() * numPool.length)];
        text = `If you use a random number generator for the numbers from 1 through ${max}, what is the theoretical probability of getting <strong>${p.t}</strong>?`;
        hint = p.h;
        
        for (let i = 1; i <= max; i++) { if (p.fn(i)) n++; }
    } 
    else if (type === 'dice') {
        const dicePool = [
            { t: "rolling a sum of 7 OR a sum of 11 on two 6-sided dice", dice: 2, fn: (s) => s === 7 || s === 11, h: "How many ways can you make a 7? How many ways can you make an 11? Add those outcomes together." },
            { t: "rolling a sum that is EVEN OR greater than 9 on two 6-sided dice", dice: 2, fn: (s) => s % 2 === 0 || s > 9, h: "Be careful! The numbers 10 and 12 fit BOTH conditions. Only count them once!" },
            { t: "rolling doubles (matching numbers) OR a sum of 7 on two 6-sided dice", dice: 2, fn: (s, d1, d2) => d1 === d2 || s === 7, h: "There are 6 ways to roll doubles and 6 ways to roll a 7. Do any of those overlap?" },
            { t: "rolling an EVEN number OR a number greater than 4 on one 6-sided die", dice: 1, fn: (s, d1) => d1 % 2 === 0 || d1 > 4, h: "List the evens: 2, 4, 6. List the numbers > 4: 5, 6. How many UNIQUE numbers did you list?" }
        ];
        
        let p = dicePool[Math.floor(Math.random() * dicePool.length)];
        text = `What is the theoretical probability of <strong>${p.t}</strong>?`;
        hint = p.h;
        
        if (p.dice === 1) {
            d = 6;
            for(let i=1; i<=6; i++) { if (p.fn(i, i)) n++; }
        } else {
            d = 36;
            for(let i=1; i<=6; i++) {
                for(let j=1; j<=6; j++) {
                    if (p.fn(i+j, i, j)) n++;
                }
            }
        }
    } 
    else if (type === 'card') {
        d = 52;
        let deck = [];
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
        for(let s of suits) for(let r of ranks) deck.push({suit: s, rank: r});

        const cardPool = [
            { t: "a Heart OR a Face card (J, Q, K)", fn: (c) => c.suit === 'Hearts' || ['J','Q','K'].includes(c.rank), h: "There are 13 Hearts and 12 Face cards. But wait! Three of those Face cards ARE Hearts. Subtract the overlap." },
            { t: "a Red card OR a 7", fn: (c) => ['Hearts','Diamonds'].includes(c.suit) || c.rank === '7', h: "There are 26 Red cards and four 7s. How many 7s are already counted in the Red cards?" },
            { t: "a Spade OR a Club", fn: (c) => ['Spades','Clubs'].includes(c.suit), h: "Spades and Clubs are mutually exclusive (you can't be both). Just add them together!" },
            { t: "an Ace OR a Red card", fn: (c) => c.rank === 'A' || ['Hearts','Diamonds'].includes(c.suit), h: "There are 26 Red cards and 4 Aces. Since two of the Aces are Red, don't double count them!" }
        ];

        let p = cardPool[Math.floor(Math.random() * cardPool.length)];
        text = `If you draw one card from a standard 52-card deck, what is the probability of drawing <strong>${p.t}</strong>?`;
        hint = p.h;

        for(let c of deck) { if (p.fn(c)) n++; }
    } 
    else if (type === 'spinner') {
        const sectOptions = [
            { total: 6, dist: [3, 1, 1, 1] },
            { total: 8, dist: [3, 2, 2, 1] },
            { total: 10, dist: [4, 3, 2, 1] }
        ];
        let cfg = sectOptions[Math.floor(Math.random() * sectOptions.length)];
        d = cfg.total;
        
        let colors = ["Red", "Blue", "Green", "Yellow"].sort(() => Math.random() - 0.5);
        let spinnerMap = {};
        for(let i=0; i<4; i++) spinnerMap[colors[i]] = cfg.dist[i];

        let c1 = colors[0], c2 = colors[1];
        text = `A spinner has ${d} equal sections. There are ${spinnerMap.Red} Red, ${spinnerMap.Blue} Blue, ${spinnerMap.Green} Green, and ${spinnerMap.Yellow} Yellow sections.<br><br>What is the probability of landing on <strong>${c1} OR ${c2}</strong>?`;
        hint = `A single section can only be one color. This means they are mutually exclusive! Just add the ${c1} sections and the ${c2} sections together.`;
        n = spinnerMap[c1] + spinnerMap[c2];
    }

    probOrData.qText = text;
    probOrData.hintText = hint;
    probOrData.n = n;
    probOrData.d = d;
}

function renderProbOrUI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `Compound Probability (Round ${probOrData.round}/${probOrData.maxRounds})`;

    qContent.innerHTML = `
        <div style="max-width: 650px; margin: 0 auto; animation: fadeIn 0.5s;">
            <div style="background:white; padding:30px; border-radius:12px; border:2px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align:center; margin-bottom:20px;">
                <div style="font-size: 40px; margin-bottom: 15px;">
                    ${probOrData.currentType === 'dice' ? '🎲' : probOrData.currentType === 'card' ? '🃏' : probOrData.currentType === 'spinner' ? '🎡' : '🔢'}
                </div>
                <p style="font-size:18px; color:#1e293b; line-height: 1.5;">
                    ${probOrData.qText}
                </p>
                <div style="font-size: 20px; color:#1e293b; margin-top:25px; display:inline-flex; align-items:center; gap: 15px;">
                    <strong>P(Event) = </strong>
                    <div style="display:inline-flex; flex-direction:column; align-items:center;">
                        <input type="number" id="ans-num" style="width:70px; text-align:center; padding:8px; font-size:20px; border:2px solid #cbd5e1; border-radius:6px; outline:none;">
                        <div style="width:100%; height:3px; background:#1e293b; margin:6px 0;"></div>
                        <input type="number" id="ans-den" style="width:70px; text-align:center; padding:8px; font-size:20px; border:2px solid #cbd5e1; border-radius:6px; outline:none;">
                    </div>
                </div>
                <div style="margin-top:25px;">
                    <button onclick="checkProbOrAnswers()" style="background:#2563eb; color:white; padding:12px 35px; font-size:16px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; transition: 0.2s;">Check Probability</button>
                </div>
                <div id="prob-feedback" style="margin-top:15px; min-height:24px; font-weight:bold; font-size:16px;"></div>
                <div id="prob-hint" style="margin-top: 15px; padding: 15px; background: #fffbeb; border: 1px dashed #f59e0b; border-radius: 8px; display: none; font-size: 14px; color: #92400e; text-align:left; line-height: 1.4;"></div>
            </div>
        </div>
    `;
    
    // Auto-focus the numerator
    setTimeout(() => { document.getElementById('ans-num')?.focus(); }, 100);
}

window.checkProbOrAnswers = function() {
    const feedback = document.getElementById('prob-feedback');
    const hintBox = document.getElementById('prob-hint');
    
    const un = parseInt(document.getElementById('ans-num').value);
    const ud = parseInt(document.getElementById('ans-den').value);

    if (isNaN(un) || isNaN(ud)) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Please enter both numbers.";
        return;
    }
    if (ud === 0) {
        feedback.style.color = "#dc2626";
        feedback.innerText = "Denominator cannot be zero.";
        return;
    }

    // Cross-multiplication check to allow simplified or unsimplified fractions
    const isCorrect = (un * probOrData.d === probOrData.n * ud);

    if (isCorrect) {
        feedback.style.color = "#16a34a";
        feedback.innerText = "✅ Correct!";
        hintBox.style.display = "none";
        
        let adjustment = probOrData.errors === 0 ? 1 : 0;
        updateProbOrScore('por_' + probOrData.currentType, adjustment);

        probOrData.round++;
        probOrData.errors = 0;

        setTimeout(() => {
            if (probOrData.round > probOrData.maxRounds) finishProbOrGame();
            else startProbOrRound();
        }, 1200);

    } else {
        probOrData.errors++;
        feedback.style.color = "#dc2626";
        feedback.innerText = "❌ Incorrect.";
        
        hintBox.style.display = "block";
        hintBox.innerHTML = `<strong>Need a hint?</strong><br>${probOrData.hintText}`;
    }
};

function updateProbOrScore(subCol, amt) {
    if (!window.userMastery) window.userMastery = {};
    
    let curSub = window.userMastery[subCol] || 0;
    let nextSub = Math.max(0, Math.min(10, curSub + amt));
    window.userMastery[subCol] = nextSub;

    let curMain = window.userMastery.ProbOr || 0;
    let nextMain = Math.max(0, Math.min(10, curMain + amt));
    window.userMastery.ProbOr = nextMain;

    if (window.supabaseClient && window.currentUser) {
        const h = sessionStorage.getItem('target_hour') || "00";
        window.supabaseClient.from('assignment7')
            .update({ [subCol]: nextSub, ProbOr: nextMain }) 
            .eq('userName', window.currentUser)
            .eq('hour', h)
            .then(({error}) => { if (error) console.error("Score update fail:", error); });
    }
}

function finishProbOrGame() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">🌟</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">Compound Events Mastered!</h2>
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
