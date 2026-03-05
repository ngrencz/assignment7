/**
 * skill_orderofops.js
 * - 7th Grade: Order of Operations (Checkpoint 5)
 * - Generates 2 multi-step numerical expressions per round.
 * - Tests Parentheses, Exponents, Fractions, Mult/Div, and Add/Sub.
 * - Math generator guarantees clean integer results.
 */

console.log("🚀 skill_orderofops.js is LIVE - Checkpoint 5");

(function() {
    let currentQuestions = [];
    let ooRound = 1;
    const totalOoRounds = 3;
    let sessionCorrectFirstTry = 0;
    let roundErrors = [0, 0]; 

    window.initOrderOfOpsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        ooRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('OrderOfOps')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[OrderOfOps] Fetch error:", error);
                if (data) window.userMastery.OrderOfOps = data.OrderOfOps || 0;
            }
        } catch (e) { 
            console.error("[OrderOfOps] Init error:", e); 
        }
        
        startOoRound();
    };

    function startOoRound() {
        roundErrors = [0, 0];
        
        // Generate one "Standard" and one "Parentheses/Fraction" problem per round
        let types = ['standard', 'complex'];
        types.sort(() => 0.5 - Math.random()); // Shuffle order
        
        currentQuestions = [generateExpression(types[0]), generateExpression(types[1])];
        renderOoUI();
    }

    function generateExpression(type) {
        if (type === 'standard') {
            // Format: A - B^pow ÷ C + D  (e.g., 16 - 2³ ÷ 8 + 5)
            let A = Math.floor(Math.random() * 20) + 10; 
            let B = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
            let pow = B === 2 ? 3 : 2; // 2^3=8, 3^2=9, 4^2=16
            let bValue = Math.pow(B, pow);
            
            // Find a clean divisor for B^pow
            let validDivisors = [];
            for (let i = 1; i <= bValue; i++) {
                if (bValue % i === 0) validDivisors.push(i);
            }
            let C = validDivisors[Math.floor(Math.random() * validDivisors.length)];
            let D = Math.floor(Math.random() * 10) + 1;
            
            let ans = A - (bValue / C) + D;
            let powStr = pow === 2 ? '²' : '³';
            let display = `${A} - ${B}${powStr} ÷ ${C} + ${D}`;
            
            return { display: display, ans: ans };
            
        } else {
            // Format: (A + B)² - (C/D) · E + F (e.g., (-2 + 6)² - (3/2) · 14 + 1)
            let A = Math.floor(Math.random() * 10) - 5; // -5 to +4
            let B = Math.floor(Math.random() * 8) + 2; 
            let sum = A + B;
            
            let D = Math.floor(Math.random() * 4) + 2; // Denominator: 2, 3, 4, 5
            let C = Math.floor(Math.random() * 5) + 1; // Numerator: 1 to 5
            
            // Ensure E is a clean multiple of denominator D so the fraction cancels cleanly
            let mult = Math.floor(Math.random() * 5) + 2; 
            let E = D * mult; 
            
            let F = Math.floor(Math.random() * 10) + 1;
            
            let ans = Math.pow(sum, 2) - ((C / D) * E) + F;
            let display = `(${A} + ${B})² - (${C}/${D}) · ${E} + ${F}`;
            
            return { display: display, ans: ans };
        }
    }

    function renderOoUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Order of Operations (Round ${ooRound}/${totalOoRounds})`;

        let questionsHTML = '';
        currentQuestions.forEach((q, i) => {
            questionsHTML += `
                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; display:flex; flex-direction:column; align-items:center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="font-size: 22px; font-family: 'Times New Roman', serif; margin-bottom: 15px; color: #1e293b; letter-spacing: 1px;">
                        <strong>${i === 0 ? 'a.' : 'b.'}</strong> &nbsp; ${q.display}
                    </div>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <input type="number" id="oo-ans-${i}" placeholder="Final Value" autocomplete="off" style="width:140px; height:45px; padding: 0 10px; text-align:center; font-size:18px; border:2px solid #94a3b8; border-radius:6px; outline:none; transition: border-color 0.2s;">
                    </div>
                </div>
            `;
        });

        qContent.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                <p style="color: #64748b; font-size: 15px; margin-bottom: 20px; text-align: center;">Evaluate each expression using the correct Order of Operations.</p>
                
                ${questionsHTML}

                <button onclick="checkOrderOfOps()" id="oo-check-btn" style="width:100%; height:50px; margin-top: 10px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ANSWERS</button>
            </div>
            <div id="oo-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center;"></div>
        `;

        setTimeout(() => { document.getElementById('oo-ans-0')?.focus(); }, 100);
    }

    window.checkOrderOfOps = function() {
        let allCorrect = true;

        currentQuestions.forEach((q, i) => {
            const inputEl = document.getElementById(`oo-ans-${i}`);
            if (!inputEl) return;
            if (inputEl.disabled) return; 

            const userAns = parseFloat(inputEl.value);

            if (!isNaN(userAns) && userAns === q.ans) {
                inputEl.style.backgroundColor = "#dcfce7"; 
                inputEl.style.borderColor = "#22c55e";
                inputEl.disabled = true; 
                roundErrors[i] = -1; 
            } else {
                allCorrect = false;
                roundErrors[i]++;
                inputEl.style.backgroundColor = "#fee2e2"; 
                inputEl.style.borderColor = "#ef4444";
            }
        });

        if (allCorrect) {
            document.getElementById('oo-check-btn').disabled = true;
            
            const isPerfectRound = roundErrors.every(err => err === -1);
            if (isPerfectRound) sessionCorrectFirstTry++;
            
            showOoFlash("✅ Correct!", "success");

            ooRound++;
            setTimeout(() => {
                if (ooRound > totalOoRounds) finishOoGame();
                else startOoRound();
            }, 1500);
        } else if (document.getElementById('oo-flash').style.display === 'none') {
            showOoFlash("❌ Check your steps! Remember PEMDAS.", "error");
        }
    };

    function finishOoGame() {
        window.isCurrentQActive = false;
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">✔️</div>
                <h2 style="color:#1e293b; margin:10px 0;">Checkpoint Complete!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry === totalOoRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['OrderOfOps'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['OrderOfOps'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'OrderOfOps': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[OrderOfOps] Update Error:", error); });
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

    function showOoFlash(msg, type) {
        const overlay = document.getElementById('oo-flash');
        if (!overlay) return;
        overlay.innerText = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1200 : 2500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
