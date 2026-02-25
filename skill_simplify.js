/**
 * skill_simplify.js
 * - Generates 4 simplification problems per round (a, b, c, d).
 * - Levels 0-2: Positive x and constants.
 * - Levels 3-5: Introduces subtraction.
 * - Levels 6-7: Introduces x^2.
 * - Levels 8+: Introduces y variables.
 * - Uses a polynomial parser to verify both accuracy AND simplification.
 */

console.log("🚀 skill_simplify.js is LIVE - 4-Question Format");

(function() {
    let currentQuestions = [];
    let simplifyRound = 1;
    const totalSimplifyRounds = 3;
    let roundErrors = [0, 0, 0, 0]; // Tracks errors for a, b, c, d
    let sessionCorrectFirstTry = 0; // Tracks perfect rounds

    window.initSimplifyGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        simplifyRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('SimplifyExpr')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[SimplifyExpr] Supabase fetch error:", error);
                if (data) window.userMastery = { ...window.userMastery, ...data };
            }
        } catch (e) { 
            console.error("[SimplifyExpr] Init error:", e); 
        }
        
        startSimplifyRound();
    };

    function startSimplifyRound() {
        roundErrors = [0, 0, 0, 0];
        currentQuestions = [];
        const lvl = Number(window.userMastery.SimplifyExpr) || 0;

        for (let i = 0; i < 4; i++) {
            currentQuestions.push(generateExpression(lvl));
        }
        renderSimplifyUI();
    }

    function generateExpression(level) {
        // Determine number of terms to start with (4 or 5)
        let numTerms = 4 + Math.floor(Math.random() * 2); 
        let terms = [];
        
        // Determine variable pool based on level progression
        let pool = ['c', 'x'];
        if (level >= 6 && level < 8) pool.push('x^2');
        if (level >= 8) pool = ['c', 'x', 'y']; 
        
        for(let i=0; i<numTerms; i++) {
            let v = pool[Math.floor(Math.random() * pool.length)];
            let c = Math.floor(Math.random() * 9) + 1; // Coefficients 1 to 9
            
            // Introduce subtraction after level 2
            let sign = (level >= 3 && Math.random() < 0.4) ? -1 : 1;
            if (i === 0) sign = 1; // Keep the first term positive for 7th graders
            
            terms.push({ coef: c * sign, var: v });
        }
        
        // Build the raw string for the student to look at
        let rawStr = "";
        terms.forEach((t, i) => {
            let cStr = Math.abs(t.coef);
            if (cStr === 1 && t.var !== 'c') cStr = ""; // Render 'x' instead of '1x'
            let vStr = t.var === 'c' ? "" : t.var;
            let termStr = cStr + vStr;
            
            if (i === 0) {
                rawStr += (t.coef < 0 ? "-" : "") + termStr;
            } else {
                rawStr += (t.coef < 0 ? " - " : " + ") + termStr;
            }
        });
        
        // Parse the raw string internally to get the 'answer key' map
        const correctMap = parsePolynomial(rawStr).map;

        return {
            display: rawStr,
            correctMap: correctMap
        };
    }

    function renderSimplifyUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Simplify Expressions (Round ${simplifyRound}/${totalSimplifyRounds})`;

        const letters = ['a', 'b', 'c', 'd'];
        let questionsHTML = '';

        currentQuestions.forEach((q, i) => {
            questionsHTML += `
                <div style="display:flex; flex-direction:column; margin-bottom: 25px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="font-size: 20px; font-family: 'Times New Roman', serif; margin-bottom: 12px; color: #1e293b;">
                        <strong>${letters[i]}.</strong> &nbsp; ${q.display}
                    </div>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <input type="text" id="simp-ans-${i}" placeholder="Simplified expression..." autocomplete="off" style="flex:1; height:45px; padding: 0 15px; font-size:18px; border:2px solid #94a3b8; border-radius:6px; outline:none; transition: border-color 0.2s;">
                    </div>
                </div>
            `;
        });

        qContent.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 15px; margin-bottom: 20px; text-align: center;">Combine like terms. Write your final simplified expression below.</p>
                
                ${questionsHTML}

                <button onclick="checkSimplifyGame()" id="simp-check-btn" style="width:100%; height:50px; margin-top: 10px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>
            <div id="simp-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:24px; font-weight:bold; display:none; z-index:100;"></div>
        `;
    }

    /**
     * Parses an algebraic string into a map of coefficients.
     * e.g., "3x^2 - x + 5" -> { 'x^2': 3, 'x': -1, 'c': 5 }
     * Also returns 'termCount' to check if the student actually simplified.
     */
    function parsePolynomial(str) {
        if (!str) return { map: {}, termCount: 0 };
        
        let clean = str.replace(/\s+/g, '').replace(/x²/g, 'x^2').replace(/y²/g, 'y^2');
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

        // Clean up any variables that cancel out to 0 (e.g., 2x - 2x)
        for(let k in map) { 
            if(map[k] === 0) delete map[k]; 
        }
        
        return { map: map, termCount: terms.length };
    }

    /**
     * Compares two coefficient maps for mathematical equality.
     */
    function mapsAreEqual(map1, map2) {
        let keys1 = Object.keys(map1);
        let keys2 = Object.keys(map2);
        if (keys1.length !== keys2.length) return false;
        for (let k of keys1) {
            if (map1[k] !== map2[k]) return false;
        }
        return true;
    }

    window.checkSimplifyGame = function() {
        let allCorrect = true;

        currentQuestions.forEach((q, i) => {
            const inputEl = document.getElementById(`simp-ans-${i}`);
            if (!inputEl) return;

            // Don't re-grade correct answers
            if (inputEl.disabled) return; 

            const studentStr = inputEl.value;
            const parsedStudent = parsePolynomial(studentStr);
            
            const isMathCorrect = mapsAreEqual(parsedStudent.map, q.correctMap);
            const isFullySimplified = parsedStudent.termCount === Object.keys(parsedStudent.map).length;

            if (isMathCorrect && isFullySimplified) {
                inputEl.style.backgroundColor = "#dcfce7"; 
                inputEl.style.borderColor = "#22c55e";
                inputEl.disabled = true; 
                roundErrors[i] = -1; // Flag as complete
            } else {
                allCorrect = false;
                roundErrors[i]++;
                inputEl.style.backgroundColor = "#fee2e2"; 
                inputEl.style.borderColor = "#ef4444";
                
                // Optional: Provide specific hint if they are right but didn't simplify
                if (isMathCorrect && !isFullySimplified) {
                    showSimpFlash("Combine ALL like terms!", "error");
                }
            }
        });

        if (allCorrect) {
            document.getElementById('simp-check-btn').disabled = true;
            showSimpFlash("Round Complete!", "success");
            
            // If they made 0 errors across all 4 questions, credit a perfect round
            const isPerfectRound = roundErrors.every(err => err === -1);
            if (isPerfectRound) {
                sessionCorrectFirstTry++;
            }

            simplifyRound++;
            setTimeout(() => {
                if (simplifyRound > totalSimplifyRounds) finishSimplifyGame();
                else startSimplifyRound();
            }, 1200);
        } else if (!allCorrect && document.getElementById('simp-flash').style.display === 'none') {
            showSimpFlash("Check your math.", "error");
        }
    };

    function finishSimplifyGame() {
        window.isCurrentQActive = false;
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px;">✂️</div>
                <h2 style="color:#1e293b; margin:10px 0;">Expressions Simplified!</h2>
                <p style="color:#64748b; font-size:16px;">Skills updated.</p>
            </div>
        `;

        // Calculate and push mastery bump using the background sync .then() method
        let mainAdjustment = 0;
        if (sessionCorrectFirstTry === totalSimplifyRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['SimplifyExpr'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['SimplifyExpr'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'SimplifyExpr': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[SimplifyExpr] Main Score Error:", error); });
            }
        }

        setTimeout(() => { 
            if (typeof window.loadNextQuestion === 'function') {
                window.loadNextQuestion();
            } else {
                location.reload();
            }
        }, 2000);
    }

    function showSimpFlash(msg, type) {
        const overlay = document.getElementById('simp-flash');
        if (!overlay) return;
        overlay.innerText = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)';
        setTimeout(() => { overlay.style.display = 'none'; }, 1500);
    }

})();
