/**
 * skill_findmissing.js
 * - 7th Grade: Generalizing Subtraction (Intro to 5.3.4)
 * - Presents real-world complement scenarios one at a time.
 * - Forces students to recognize the pattern and write the algebraic rule (t - p).
 */

console.log("🚀 skill_findmissing.js is LIVE - Generalizing Math");

(function() {
    let fmData = {};
    let fmRound = 1;
    const totalFmRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;
    let currentStep = 0; // Tracks which of the 4 questions they are on

    window.initFindMissingGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        fmRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('FindMissing')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[FindMissing] Fetch error:", error);
                if (data) window.userMastery.FindMissing = data.FindMissing || 0;
            }
        } catch (e) { 
            console.error("[FindMissing] Init error:", e); 
        }
        
        startFmRound();
    };

    function startFmRound() {
        errorsThisRound = 0;
        currentStep = 0;
        generateFmProblem();
        renderFmUI();
    }

    function generateFmProblem() {
        // Dynamic templates based on the textbook examples
        const templates = [
            { 
                t: Math.floor(Math.random() * 50) + 80, 
                p: Math.floor(Math.random() * 30) + 30, 
                item: "students in a room", sub1: "are taller than 5 feet", sub2: "are not taller than 5 feet" 
            },
            { 
                t: Math.floor(Math.random() * 10) + 15, 
                p: Math.floor(Math.random() * 6) + 5, 
                item: "blue and white stripes on a flag", sub1: "are blue", sub2: "are white" 
            },
            { 
                t: (Math.floor(Math.random() * 20) + 15) * 10, 
                p: (Math.floor(Math.random() * 10) + 5) * 10, 
                item: "pennies and dimes in a box", sub1: "are pennies", sub2: "are dimes" 
            },
            { 
                t: Math.floor(Math.random() * 40) + 40, 
                p: Math.floor(Math.random() * 20) + 15, 
                item: "cats and dogs at a shelter", sub1: "are cats", sub2: "are dogs" 
            },
            { 
                t: Math.floor(Math.random() * 60) + 60, 
                p: Math.floor(Math.random() * 30) + 20, 
                item: "red and green apples in a basket", sub1: "are red", sub2: "are green" 
            }
        ];

        // Shuffle and pick 3
        templates.sort(() => 0.5 - Math.random());
        let scenarios = templates.slice(0, 3).map(s => {
            return {
                prompt: `If there are ${s.t} ${s.item} and ${s.p} of them ${s.sub1}, how many ${s.sub2}?`,
                ans: s.t - s.p
            };
        });

        fmData = {
            scenarios: scenarios
        };
    }

    function renderFmUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Finding the Missing Part (Round ${fmRound}/${totalFmRounds})`;

        const letters = ['a', 'b', 'c', 'd'];
        let questionsHTML = '';

        // Render the 3 numeric scenarios
        fmData.scenarios.forEach((q, i) => {
            let isVisible = i <= currentStep;
            let isLocked = i < currentStep;
            
            let displayStyle = isVisible ? 'flex' : 'none';
            let bgStyle = isLocked ? '#f8fafc' : 'white';
            let borderStyle = isLocked ? '1px solid #cbd5e1' : '2px solid #3b82f6';
            let opacity = isLocked ? '0.6' : '1';

            let val = isLocked ? q.ans : '';

            questionsHTML += `
                <div style="display:${displayStyle}; flex-direction:column; margin-bottom: 20px; padding: 15px; background: ${bgStyle}; border-radius: 8px; border: ${borderStyle}; opacity: ${opacity}; animation: fadeIn 0.4s;">
                    <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 12px;">
                        <strong>${letters[i]}.</strong> ${q.prompt}
                    </p>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <input type="number" id="fm-ans-${i}" value="${val}" ${isLocked ? 'disabled' : ''} placeholder="?" autocomplete="off" style="width:100px; height:40px; padding: 0 10px; font-size:18px; text-align:center; border:2px solid #94a3b8; border-radius:6px; outline:none;">
                    </div>
                </div>
            `;
        });

        // Render the Generalization step
        let isGenVisible = currentStep === 3;
        let genStyle = isGenVisible ? 'flex' : 'none';

        questionsHTML += `
            <div style="display:${genStyle}; flex-direction:column; margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px; border: 2px solid #2563eb; animation: fadeIn 0.5s;">
                <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 15px;">
                    <strong>d. Time to generalize!</strong> Look at the math you just did for parts a, b, and c.<br><br>
                    Imagine you know how many items you have in a collection of two types. 
                    Let <strong>t</strong> = the total number of items, and <strong>p</strong> = the number of the first type.<br><br>
                    Write an algebraic expression to find the number of the second type.
                </p>
                <div style="display:flex; align-items:center; gap: 10px;">
                    <span style="font-size:16px; font-weight:bold; color:#1e293b;">Expression:</span>
                    <input type="text" id="fm-ans-3" placeholder="e.g. t + p" autocomplete="off" style="width:150px; height:40px; padding: 0 10px; font-size:18px; text-align:center; border:2px solid #2563eb; border-radius:6px; outline:none;">
                </div>
            </div>
        `;

        let btnText = currentStep === 3 ? "FINISH ROUND" : "CHECK & CONTINUE";

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 15px; margin-bottom: 20px; text-align: center;">Think about the mathematical process you use as you solve these problems.</p>
                
                ${questionsHTML}

                <button onclick="checkFindMissing()" id="fm-check-btn" style="width:100%; height:50px; margin-top: 10px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">${btnText}</button>
            </div>
            <div id="fm-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center;"></div>
        `;

        setTimeout(() => { document.getElementById(`fm-ans-${currentStep}`)?.focus(); }, 100);
    }

    window.checkFindMissing = function() {
        const inputEl = document.getElementById(`fm-ans-${currentStep}`);
        if (!inputEl) return;

        let isCorrect = false;

        if (currentStep < 3) {
            // Numeric check for steps a, b, c
            let userAns = parseInt(inputEl.value);
            let target = fmData.scenarios[currentStep].ans;
            if (!isNaN(userAns) && userAns === target) {
                isCorrect = true;
            }
        } else {
            // Algebraic check for step d
            let userAns = inputEl.value.replace(/\s+/g, '').toLowerCase();
            // Accept standard algebraic forms for t - p
            if (userAns === 't-p' || userAns === '-p+t') {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            inputEl.style.backgroundColor = "#dcfce7"; 
            inputEl.style.borderColor = "#22c55e";
            
            if (currentStep < 3) {
                currentStep++;
                renderFmUI();
            } else {
                // Round Complete
                document.getElementById('fm-check-btn').disabled = true;
                if (errorsThisRound === 0) sessionCorrectFirstTry++;
                
                showFmFlash("✅ Rule Mastered!", "success");

                fmRound++;
                setTimeout(() => {
                    if (fmRound > totalFmRounds) finishFmGame();
                    else startFmRound();
                }, 1500);
            }
        } else {
            errorsThisRound++;
            inputEl.style.backgroundColor = "#fee2e2"; 
            inputEl.style.borderColor = "#ef4444";
            
            if (currentStep < 3) {
                showFmFlash("❌ Check your math.", "error");
            } else {
                showFmFlash("❌ What operation did you use in parts a, b, and c? Use the variables t and p.", "error");
            }
        }
    };

    function finishFmGame() {
        window.isCurrentQActive = false;
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🧩</div>
                <h2 style="color:#1e293b; margin:10px 0;">Logic Generalized!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry === totalFmRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['FindMissing'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['FindMissing'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'FindMissing': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[FindMissing] Update Error:", error); });
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

    function showFmFlash(msg, type) {
        const overlay = document.getElementById('fm-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1200 : 3000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }

})();
