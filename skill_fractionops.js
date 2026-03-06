/**
 * skill_fractionops.js
 * - 7th Grade: Fraction Operations (CL 5-155)
 * - Generates mixed number and negative fraction arithmetic (+, -, *)
 * - Requires fully simplified answers (accepts mixed numbers or improper fractions)
 */

console.log("🚀 skill_fractionops.js is LIVE - Fraction Operations");

(function() {
    let foData = {};
    let foRound = 1;
    const totalFoRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initFractionOpsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        foRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('FractionOps')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[FractionOps] Fetch error:", error);
                if (data) window.userMastery.FractionOps = data.FractionOps || 0;
            }
        } catch (e) { 
            console.error("[FractionOps] Init error:", e); 
        }
        
        startFoRound();
    };

    function startFoRound() {
        errorsThisRound = 0;
        generateFoProblem();
        renderFoUI();
    }

    // Utility: Greatest Common Divisor
    function getGCD(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { let temp = b; b = a % b; a = temp; }
        return a;
    }

    function generateFoProblem() {
        // Randomly choose an operation type matching CL 5-155
        const types = ['addSubMixed', 'multFractions', 'subNegatives', 'multMixedNeg'];
        let type = types[Math.floor(Math.random() * types.length)];
        
        let displayHTML = "";
        let targetDecimal = 0;

        if (type === 'addSubMixed') {
            // e.g., 2 3/10 - 1 2/5 or 3/4 + 5 7/8
            let isAdd = Math.random() > 0.5;
            let w1 = Math.floor(Math.random() * 4) + 1; // 1 to 4
            let n1 = Math.floor(Math.random() * 4) + 1;
            let d1 = Math.floor(Math.random() * 3) + n1 + 1; 
            
            let w2 = Math.floor(Math.random() * 3) + 1;
            let n2 = Math.floor(Math.random() * 4) + 1;
            let d2 = Math.floor(Math.random() * 3) + n2 + 1;

            let val1 = w1 + (n1/d1);
            let val2 = w2 + (n2/d2);
            targetDecimal = isAdd ? val1 + val2 : val1 - val2;

            let opSign = isAdd ? "+" : "−";
            displayHTML = `${w1}<span class="frac"><sup>${n1}</sup>/<sub>${d1}</sub></span> &nbsp;${opSign}&nbsp; ${w2}<span class="frac"><sup>${n2}</sup>/<sub>${d2}</sub></span>`;
            
        } else if (type === 'multFractions') {
            // e.g., 9/3 * 4/5 
            let n1 = Math.floor(Math.random() * 8) + 2;
            let d1 = Math.floor(Math.random() * 5) + 2;
            let n2 = Math.floor(Math.random() * 8) + 2;
            let d2 = Math.floor(Math.random() * 5) + 2;
            
            targetDecimal = (n1/d1) * (n2/d2);
            displayHTML = `<span class="frac"><sup>${n1}</sup>/<sub>${d1}</sub></span> &nbsp;&middot;&nbsp; <span class="frac"><sup>${n2}</sup>/<sub>${d2}</sub></span>`;

        } else if (type === 'subNegatives') {
            // e.g., -9/15 - (-26/45)
            let n1 = Math.floor(Math.random() * 10) + 1;
            let d1 = Math.floor(Math.random() * 5) + 3;
            let n2 = Math.floor(Math.random() * 15) + 5;
            let d2 = d1 * (Math.floor(Math.random() * 3) + 2); // Common multiple
            
            targetDecimal = -(n1/d1) - (-(n2/d2));
            displayHTML = `&minus;<span class="frac"><sup>${n1}</sup>/<sub>${d1}</sub></span> &nbsp;&minus;&nbsp; (&minus;<span class="frac"><sup>${n2}</sup>/<sub>${d2}</sub></span>)`;

        } else {
            // multMixedNeg: e.g., 5 1/6 * (-7/9)
            let w1 = Math.floor(Math.random() * 3) + 2;
            let n1 = Math.floor(Math.random() * 4) + 1;
            let d1 = Math.floor(Math.random() * 3) + n1 + 1;
            
            let n2 = Math.floor(Math.random() * 7) + 1;
            let d2 = Math.floor(Math.random() * 5) + n2 + 1;

            let val1 = w1 + (n1/d1);
            let val2 = -(n2/d2);
            targetDecimal = val1 * val2;

            displayHTML = `${w1}<span class="frac"><sup>${n1}</sup>/<sub>${d1}</sub></span> &nbsp;&middot;&nbsp; (&minus;<span class="frac"><sup>${n2}</sup>/<sub>${d2}</sub></span>)`;
        }

        foData = {
            display: displayHTML,
            ansDecimal: targetDecimal
        };
    }

    function renderFoUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Fraction Operations (Round ${foRound}/${totalFoRounds})`;

        qContent.innerHTML = `
            <style>
                .frac { display: inline-block; position: relative; vertical-align: middle; letter-spacing: 0.01em; text-align: center; font-size: 0.85em; }
                .frac > sup { display: block; padding: 0.1em; }
                .frac > sub { display: block; padding: 0.1em; border-top: 2px solid #1e293b; }
                .fo-input-box { border: 2px solid #94a3b8; border-radius: 6px; outline: none; text-align: center; font-size: 18px; transition: border-color 0.2s; }
            </style>

            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 25px; text-align:center;">
                    Evaluate the expression. <strong>Your final answer must be fully simplified.</strong><br>
                    <span style="font-size: 14px; color: #64748b;">(You can enter a mixed number or an improper fraction)</span>
                </p>

                <div style="display:flex; justify-content:center; align-items:center; font-size: 32px; font-family: 'Times New Roman', serif; color: #1e293b; margin-bottom: 30px; font-weight: bold;">
                    ${foData.display}
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; display:flex; align-items:center; justify-content:center; gap:15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    
                    <span style="font-size: 24px; font-weight: bold; color: #475569;">=</span>
                    
                    <input type="text" id="fo-whole" class="fo-input-box" placeholder="Whole" autocomplete="off" style="width: 70px; height: 50px;">
                    
                    <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                        <input type="text" id="fo-num" class="fo-input-box" placeholder="Num" autocomplete="off" style="width: 60px; height: 35px; font-size: 16px;">
                        <div style="width: 100%; height: 3px; background: #1e293b; border-radius: 2px;"></div>
                        <input type="text" id="fo-den" class="fo-input-box" placeholder="Den" autocomplete="off" style="width: 60px; height: 35px; font-size: 16px;">
                    </div>
                </div>

                <button onclick="checkFractionOps()" id="fo-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">SUBMIT ANSWER</button>
            </div>
            <div id="fo-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('fo-whole')?.focus(); }, 100);
    }

    window.checkFractionOps = function() {
        let elW = document.getElementById('fo-whole');
        let elN = document.getElementById('fo-num');
        let elD = document.getElementById('fo-den');

        if (!elW || !elN || !elD) return;

        let wStr = elW.value.trim();
        let nStr = elN.value.trim();
        let dStr = elD.value.trim();

        let w = parseInt(wStr) || 0;
        let n = parseInt(nStr) || 0;
        let d = parseInt(dStr) || 1; // Default to 1 to avoid division by zero if blank

        if (dStr === "0" || d === 0) {
            showFoFlash("❌ Denominator cannot be zero!", "error");
            elD.style.borderColor = "#ef4444";
            return;
        }

        // Determine total decimal value of student's input
        // Handles cases where negative is typed in the whole number OR the numerator
        let isNegative = (wStr.includes('-') || nStr.includes('-') || dStr.includes('-'));
        let absTotal = Math.abs(w) + (Math.abs(n) / Math.abs(d));
        let studentDecimal = isNegative ? -absTotal : absTotal;

        // Check Mathematical Accuracy
        let isMathCorrect = Math.abs(studentDecimal - foData.ansDecimal) < 0.001;

        // Check Simplification (Greatest Common Divisor of Numerator and Denominator must be 1)
        let isSimplified = getGCD(n, d) === 1;

        // Visual Feedback Reset
        [elW, elN, elD].forEach(el => {
            el.style.borderColor = "#94a3b8";
            el.style.backgroundColor = "white";
        });

        if (isMathCorrect && isSimplified) {
            document.getElementById('fo-check-btn').disabled = true;
            
            [elW, elN, elD].forEach(el => {
                if(el.value.trim() !== "") {
                    el.style.borderColor = "#22c55e"; 
                    el.style.backgroundColor = "#dcfce7";
                }
            });

            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showFoFlash("✅ Perfectly Evaluated!", "success");

            foRound++;
            setTimeout(() => {
                if (foRound > totalFoRounds) finishFoGame();
                else startFoRound();
            }, 1500);

        } else {
            errorsThisRound++;
            [elW, elN, elD].forEach(el => {
                if(el.value.trim() !== "") {
                    el.style.borderColor = "#ef4444"; 
                    el.style.backgroundColor = "#fee2e2";
                }
            });

            if (isMathCorrect && !isSimplified) {
                showFoFlash("❌ Right value, but your fraction is not fully simplified!", "error");
            } else {
                showFoFlash("❌ Check your math. Don't forget common denominators for + and −!", "error");
            }
        }
    };

    function finishFoGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">➗</div>
                <h2 style="color:#1e293b; margin:10px 0;">Fractions Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalFoRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['FractionOps'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['FractionOps'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'FractionOps': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[FractionOps] Update Error:", error); });
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

    function showFoFlash(msg, type) {
        const overlay = document.getElementById('fo-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 3500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
