/**
 * skill_expressionmats.js
 * - 7th Grade: Expression Mats & Zero Pairs
 * - Generates visual Algebra Tiles (x^2, x, 1).
 * - Shaded (Grey) = Positive, Unshaded (White) = Negative.
 * - Forces students to visually cancel zero pairs and type the simplified expression.
 */

console.log("🚀 skill_expressionmats.js is LIVE - Expression Mats");

(function() {
    let atData = {};
    let atRound = 1;
    const totalAtRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initExpressionMatsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        atRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('ExpressionMats')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[ExpressionMats] Fetch error:", error);
                if (data) window.userMastery.ExpressionMats = data.ExpressionMats || 0;
            }
        } catch (e) { 
            console.error("[ExpressionMats] Init error:", e); 
        }
        
        startAtRound();
    };

    function startAtRound() {
        errorsThisRound = 0;
        generateAtProblem();
        renderAtUI();
    }

    function generateAtProblem() {
        let mastery = window.userMastery.ExpressionMats || 0;
        let hasX2 = mastery >= 4; // Introduce x^2 tiles at Level 4

        // Generate random counts for each tile type
        let pX2 = hasX2 ? Math.floor(Math.random() * 3) : 0;
        let nX2 = hasX2 ? Math.floor(Math.random() * 3) : 0;
        
        let pX = Math.floor(Math.random() * 5);
        let nX = Math.floor(Math.random() * 5);
        
        let pC = Math.floor(Math.random() * 6);
        let nC = Math.floor(Math.random() * 6);

        // Guarantee at least one "Zero Pair" exists so they have to simplify
        if (pX === 0 && nX === 0) { pX = 2; nX = 1; }
        if (pC === 0 && nC === 0) { pC = 1; nC = 3; }

        if (pX2 + nX2 + pX + nX + pC + nC === 0) {
            pX = 1; pC = 1;
        }

        let finalX2 = pX2 - nX2;
        let finalX = pX - nX;
        let finalC = pC - nC;

        let ansMap = {};
        if (finalX2 !== 0) ansMap['x^2'] = finalX2;
        if (finalX !== 0) ansMap['x'] = finalX;
        if (finalC !== 0) ansMap['c'] = finalC;

        atData = {
            tiles: { pX2, nX2, pX, nX, pC, nC },
            ansMap: ansMap
        };
    }

    function renderAtUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Expression Mats (Round ${atRound}/${totalAtRounds})`;

        let t = atData.tiles;
        let tileHTMLArray = [];

        for(let i=0; i<t.pX2; i++) tileHTMLArray.push(`<div class="alg-tile t-x2 t-pos">x²</div>`);
        for(let i=0; i<t.nX2; i++) tileHTMLArray.push(`<div class="alg-tile t-x2 t-neg">x²</div>`);
        for(let i=0; i<t.pX; i++) tileHTMLArray.push(`<div class="alg-tile t-x t-pos">x</div>`);
        for(let i=0; i<t.nX; i++) tileHTMLArray.push(`<div class="alg-tile t-x t-neg">x</div>`);
        for(let i=0; i<t.pC; i++) tileHTMLArray.push(`<div class="alg-tile t-c t-pos">1</div>`);
        for(let i=0; i<t.nC; i++) tileHTMLArray.push(`<div class="alg-tile t-c t-neg">1</div>`);

        tileHTMLArray.sort(() => 0.5 - Math.random());
        let matHTML = tileHTMLArray.join('');

        qContent.innerHTML = `
            <style>
                .alg-tile { display: flex; align-items: center; justify-content: center; font-family: 'Times New Roman', serif; font-style: italic; font-weight: bold; border: 2px solid #334155; box-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
                .t-pos { background-color: #94a3b8; color: #0f172a; } 
                .t-neg { background-color: #ffffff; color: #0f172a; } 
                .t-x2 { width: 70px; height: 70px; font-size: 20px; }
                .t-x { width: 25px; height: 70px; font-size: 16px; }
                .t-c { width: 25px; height: 25px; font-size: 14px; font-style: normal; }
            </style>

            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 15px; text-align:center;">
                    Write the expression shown on the Expression Mat.<br>
                    <strong>Simplify by making zeros and combining like terms.</strong>
                </p>

                <div style="display:flex; justify-content:center; gap:20px; margin-bottom: 15px; font-size:14px; color:#475569;">
                    <div style="display:flex; align-items:center; gap:5px;">
                        <div style="width:15px; height:15px; background:#94a3b8; border:1px solid #334155;"></div> = Positive (+)
                    </div>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <div style="width:15px; height:15px; background:#ffffff; border:1px solid #334155;"></div> = Negative (-)
                    </div>
                </div>

                <div style="background: #fdf6e3; padding: 20px; border-radius: 4px; border: 3px solid #1e293b; margin-bottom: 25px; min-height: 150px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: center;">
                    ${matHTML}
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; display:flex; flex-direction: column; align-items: center;">
                    <span style="font-size: 16px; margin-bottom: 10px; color:#1e293b;"><strong>Simplified Expression:</strong></span>
                    <input type="text" id="at-ans" placeholder="e.g. 2x^2 - x + 3" style="width: 250px; padding:12px; font-size:18px; text-align:center; border:2px solid #3b82f6; border-radius:6px; outline:none;" autocomplete="off">
                </div>

                <button onclick="checkExpressionMats()" id="at-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">SUBMIT</button>
            </div>
            <div id="at-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('at-ans')?.focus(); }, 100);
    }

    function parsePolynomial(str) {
        if (!str || str.trim() === "0") return { map: {}, termCount: 0 };
        let clean = str.replace(/\s+/g, '').toLowerCase().replace(/x²/g, 'x^2');
        let terms = clean.match(/[+-]?[^+-]+/g) || [];
        let map = {};
        
        for (let t of terms) {
            let match = t.match(/^([+-]?\d*)([a-z]\^?\d*)?$/);
            if (!match) continue; 
            
            let coefStr = match[1];
            let varPart = match[2] || 'c';
            
            let coef = 1;
            if (coefStr === '-' || coefStr === '+-') coef = -1;
            else if (coefStr === '+' || coefStr === '') coef = 1;
            else coef = parseInt(coefStr);
            
            map[varPart] = (map[varPart] || 0) + coef;
        }
        for(let k in map) { if(map[k] === 0) delete map[k]; }
        return { map: map, termCount: terms.length };
    }

    function mapsAreEqual(map1, map2) {
        let keys1 = Object.keys(map1);
        let keys2 = Object.keys(map2);
        if (keys1.length !== keys2.length) return false;
        for (let k of keys1) {
            if (map1[k] !== map2[k]) return false;
        }
        return true;
    }

    window.checkExpressionMats = function() {
        const elAns = document.getElementById('at-ans');
        if (!elAns) return;

        const pParsed = parsePolynomial(elAns.value);
        let isMathCorrect = mapsAreEqual(pParsed.map, atData.ansMap);
        let isFullySimplified = pParsed.termCount === Object.keys(pParsed.map).length;
        let isCorrect = isMathCorrect && isFullySimplified;

        elAns.style.borderColor = isCorrect ? "#22c55e" : "#ef4444";
        elAns.style.backgroundColor = isCorrect ? "#dcfce7" : "#fee2e2";

        if (isCorrect) {
            document.getElementById('at-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showAtFlash("✅ Perfectly Simplified!", "success");

            atRound++;
            setTimeout(() => {
                if (atRound > totalAtRounds) finishAtGame();
                else startAtRound();
            }, 1500);

        } else {
            errorsThisRound++;
            let hintMsg = "❌ Not quite!<br><br>";
            if (isMathCorrect && !isFullySimplified) {
                hintMsg += "• Your math is right, but you didn't finish simplifying. Make sure you cross out ALL your zero pairs!<br>";
            } else {
                hintMsg += "• Match up a Grey tile and a White tile of the same size to make a zero. Count what is left over.<br>";
            }
            showAtFlash(hintMsg, "error");
        }
    };

    function finishAtGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🟩</div>
                <h2 style="color:#1e293b; margin:10px 0;">Mats Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalAtRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['ExpressionMats'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['ExpressionMats'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'ExpressionMats': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[ExpressionMats] Update Error:", error); });
            }
        }

        setTimeout(() => { 
            if (typeof window.loadNextQuestion === 'function') {
                window.loadNextQuestion(); 
            } else {
                location.reload();
            }
        }, 2500);
    }

    function showAtFlash(msg, type) {
        const overlay = document.getElementById('at-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 3500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
