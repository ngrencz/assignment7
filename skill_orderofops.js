/**
 * skill_orderofops.js
 * - 7th Grade: Order of Operations (Checkpoint 5)
 * - Forces step-by-step evaluation of expressions.
 * - Highlights the active chunk according to PEMDAS.
 * - Triggers specific, contextual hints after 2 failed attempts on a step.
 */

console.log("🚀 skill_orderofops.js is LIVE - Step-by-Step Evaluator");

(function() {
    let probA = {};
    let probB = {};
    let stateA = {};
    let stateB = {};
    
    let ooRound = 1;
    const totalOoRounds = 3;
    let sessionCorrectFirstTry = 0; 
    let isPerfectRound = true; // Tracks if they finish the whole round with zero hints

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
        isPerfectRound = true;
        
        probA = generateStepByStepProblem('standard');
        probB = generateStepByStepProblem('complex');
        
        // Randomize which type is A and which is B
        if (Math.random() > 0.5) {
            let temp = probA;
            probA = probB;
            probB = temp;
        }

        stateA = { currentStep: 0, errors: 0, completed: false };
        stateB = { currentStep: 0, errors: 0, completed: false };
        
        renderOoUI();
    }

    function generateStepByStepProblem(type) {
        if (type === 'standard') {
            // e.g., A - B^pow ÷ C + D
            let A = Math.floor(Math.random() * 20) + 10; 
            let B = Math.floor(Math.random() * 3) + 2; 
            let pow = B === 2 ? 3 : 2; 
            let bValue = Math.pow(B, pow);
            
            let validDivisors = [];
            for (let i = 1; i <= bValue; i++) {
                if (bValue % i === 0) validDivisors.push(i);
            }
            let C = validDivisors[Math.floor(Math.random() * validDivisors.length)];
            let D = Math.floor(Math.random() * 10) + 1;
            
            let powStr = pow === 2 ? '²' : '³';

            let steps = [
                {
                    fullExp: `${A} - <span class="oo-hl">${B}${powStr}</span> ÷ ${C} + ${D}`,
                    opName: "Exponents",
                    ans: bValue,
                    hint: `Calculate ${B} to the power of ${pow} (${B} × ${pow === 3 ? B + ' × ' + B : B}).`
                },
                {
                    fullExp: `${A} - <span class="oo-hl">${bValue} ÷ ${C}</span> + ${D}`,
                    opName: "Division",
                    ans: bValue / C,
                    hint: `Divide ${bValue} by ${C}.`
                },
                {
                    fullExp: `<span class="oo-hl">${A} - ${bValue / C}</span> + ${D}`,
                    opName: "Subtraction (L to R)",
                    ans: A - (bValue / C),
                    hint: `Subtract ${bValue / C} from ${A}. Remember to work left to right!`
                },
                {
                    fullExp: `<span class="oo-hl">${A - (bValue / C)} + ${D}</span>`,
                    opName: "Addition",
                    ans: A - (bValue / C) + D,
                    hint: `Add ${A - (bValue / C)} and ${D}.`
                }
            ];

            return { steps: steps };
            
        } else {
            // e.g., (A + B)² - (C/D) · E + F
            let A = Math.floor(Math.random() * 10) - 5; 
            let B = Math.floor(Math.random() * 8) + 2; 
            let sumAB = A + B;
            
            let D = Math.floor(Math.random() * 4) + 2; 
            let C = Math.floor(Math.random() * 5) + 1; 
            let mult = Math.floor(Math.random() * 5) + 2; 
            let E = D * mult; 
            let multAns = (C / D) * E;
            
            let F = Math.floor(Math.random() * 10) + 1;

            let sq = Math.pow(sumAB, 2);

            let steps = [
                {
                    fullExp: `<span class="oo-hl">(${A} + ${B})</span>² - (${C}/${D}) · ${E} + ${F}`,
                    opName: "Parentheses",
                    ans: sumAB,
                    hint: `Calculate the inside of the parentheses first: ${A} + ${B}.`
                },
                {
                    fullExp: `<span class="oo-hl">(${sumAB})²</span> - (${C}/${D}) · ${E} + ${F}`,
                    opName: "Exponents",
                    ans: sq,
                    hint: `Square ${sumAB} (${sumAB} × ${sumAB}).`
                },
                {
                    fullExp: `${sq} - <span class="oo-hl">(${C}/${D}) · ${E}</span> + ${F}`,
                    opName: "Multiplication",
                    ans: multAns,
                    hint: `Multiply the fraction by ${E}. Divide ${E} by ${D} first, then multiply by ${C}.`
                },
                {
                    fullExp: `<span class="oo-hl">${sq} - ${multAns}</span> + ${F}`,
                    opName: "Subtraction (L to R)",
                    ans: sq - multAns,
                    hint: `Subtract ${multAns} from ${sq}.`
                },
                {
                    fullExp: `<span class="oo-hl">${sq - multAns} + ${F}</span>`,
                    opName: "Addition",
                    ans: sq - multAns + F,
                    hint: `Finally, add ${F} to ${sq - multAns}.`
                }
            ];
            
            return { steps: steps };
        }
    }

    function buildProblemHTML(probData, state, letter) {
        let html = `
            <div style="margin-bottom: 25px; background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="font-size: 22px; font-family: 'Times New Roman', serif; margin-bottom: 20px; color: #1e293b; font-weight:bold;">${letter}.</div>
        `;

        for (let i = 0; i <= state.currentStep; i++) {
            if (i >= probData.steps.length) break; 

            let step = probData.steps[i];
            let isCurrent = (i === state.currentStep) && !state.completed;

            let val = isCurrent ? '' : step.ans;
            let disabled = isCurrent ? '' : 'disabled';
            let bg = isCurrent ? '#ffffff' : '#f8fafc';
            let border = isCurrent ? '2px solid #3b82f6' : '1px solid #cbd5e1';
            let color = isCurrent ? '#0f172a' : '#64748b';

            html += `
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-bottom: 12px;">
                    <div style="font-family: 'Courier New', monospace; font-size: 18px; color: #1e293b; flex:1; text-align:right;">${step.fullExp}</div>
                    <div style="font-weight: bold; color: #64748b;">=</div>
                    <input type="number" step="any" id="ans-${letter}-${i}" value="${val}" ${disabled} autocomplete="off"
                        style="width: 70px; padding: 8px; font-size: 16px; text-align: center; border: ${border}; background: ${bg}; color: ${color}; border-radius: 4px; outline: none;">
                    <div style="width: 140px; font-size: 12px; color: #64748b; font-style: italic; text-align: left;">
                        ${isCurrent ? `Next: <strong>${step.opName}</strong>` : '✔️'}
                    </div>
                </div>
            `;

            // Insert specific instruction hint if they have 2 or more errors on this active step
            if (isCurrent && state.errors >= 2) {
                isPerfectRound = false; 
                html += `
                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 8px 12px; margin-bottom: 15px; font-size: 14px; color: #991b1b; display:flex; gap:10px; align-items:center; border-radius: 4px;">
                        <span>💡</span> <span><strong>Hint:</strong> ${step.hint}</span>
                    </div>
                `;
            }
        }

        if (state.completed) {
            html += `<div style="text-align:center; color: #22c55e; font-size: 18px; font-weight: bold; margin-top: 15px; padding: 10px; background: #dcfce7; border-radius: 6px;">Expression Evaluated!</div>`;
        }

        html += `</div>`;
        return html;
    }

    function renderOoUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Order of Operations (Round ${ooRound}/${totalOoRounds})`;

        let htmlA = buildProblemHTML(probA, stateA, 'a');
        let htmlB = buildProblemHTML(probB, stateB, 'b');

        qContent.innerHTML = `
            <style>
                .oo-hl { background-color: #fef08a; padding: 2px 4px; border-radius: 4px; border: 1px dashed #eab308; font-weight:bold; }
            </style>
            <div style="max-width: 700px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                <p style="color: #64748b; font-size: 15px; margin-bottom: 20px; text-align: center;">Evaluate the highlighted portion of the expression.</p>
                
                ${htmlA}
                ${htmlB}

                <button onclick="checkOrderOfOps()" id="oo-check-btn" style="width:100%; height:50px; margin-top: 10px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK STEP</button>
            </div>
            <div id="oo-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center;"></div>
        `;

        setTimeout(() => { 
            // Auto focus the active input for A, or B if A is done
            if (!stateA.completed) document.getElementById(`ans-a-${stateA.currentStep}`)?.focus();
            else if (!stateB.completed) document.getElementById(`ans-b-${stateB.currentStep}`)?.focus();
        }, 100);
    }

    window.checkOrderOfOps = function() {
        let hasErrors = false;

        // Check Prob A
        if (!stateA.completed) {
            let elA = document.getElementById(`ans-a-${stateA.currentStep}`);
            let valA = parseFloat(elA.value);
            let expectedA = probA.steps[stateA.currentStep].ans;

            if (!isNaN(valA) && Math.abs(valA - expectedA) < 0.01) {
                stateA.currentStep++;
                stateA.errors = 0;
                if (stateA.currentStep >= probA.steps.length) stateA.completed = true;
            } else {
                hasErrors = true;
                stateA.errors++;
            }
        }

        // Check Prob B
        if (!stateB.completed) {
            let elB = document.getElementById(`ans-b-${stateB.currentStep}`);
            let valB = parseFloat(elB.value);
            let expectedB = probB.steps[stateB.currentStep].ans;

            if (!isNaN(valB) && Math.abs(valB - expectedB) < 0.01) {
                stateB.currentStep++;
                stateB.errors = 0;
                if (stateB.currentStep >= probB.steps.length) stateB.completed = true;
            } else {
                hasErrors = true;
                stateB.errors++;
            }
        }

        // Re-render UI to either drop down to the next step, or display the Hint block
        renderOoUI();

        if (stateA.completed && stateB.completed) {
            document.getElementById('oo-check-btn').disabled = true;
            
            if (isPerfectRound) sessionCorrectFirstTry++;
            showOoFlash("✅ Excellent Evaluation!", "success");

            ooRound++;
            setTimeout(() => {
                if (ooRound > totalOoRounds) finishOoGame();
                else startOoRound();
            }, 1500);
        } else if (hasErrors) {
            showOoFlash("❌ Check your math on the highlighted steps.", "error");
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
