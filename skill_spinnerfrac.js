/**
 * skill_spinnerfrac.js
 * - Generates pie chart/spinner problems with missing fractions.
 * - Slices circle proportionally based on randomly generated LCDs.
 * - Part A: Find the missing fraction (All Mastery Levels).
 * - Part B: Compare probabilities (Unlocks at Mastery Level 6+).
 */

console.log("🚀 skill_spinnerfrac.js is LIVE - Multi-Step Spinners");

(function() {
    let sfData = {};
    let sfRound = 1;
    const totalSfRounds = 3;
    let sessionCorrectFirstTry = 0;

    window.initSpinnerFracGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        sfRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('SpinnerFrac')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[SpinnerFrac] Fetch error:", error);
                if (data) window.userMastery.SpinnerFrac = data.SpinnerFrac || 0;
            }
        } catch (e) { 
            console.error("[SpinnerFrac] Init error:", e); 
        }
        
        startSfRound();
    };

    function startSfRound() {
        generateSfProblem();
        renderSfUI();
    }

    // Helper to simplify fractions
    function simplify(n, d) {
        let a = n, b = d, t;
        while (b !== 0) { t = b; b = a % b; a = t; }
        return { n: n/a, d: d/a, str: `${n/a}/${d/a}` };
    }

    function generateSfProblem() {
        const denominators = [24, 30, 36, 40, 60];
        const lcd = denominators[Math.floor(Math.random() * denominators.length)];
        
        let remaining = lcd;
        let parts = [];
        let numSlices = Math.floor(Math.random() * 2) + 4; // 4 to 5 total slices (gives more room for text)

        for (let i = 0; i < numSlices - 1; i++) {
            let maxLimit = Math.floor(remaining / 1.5); 
            if (maxLimit < 1) maxLimit = 1;
            let p = Math.floor(Math.random() * maxLimit) + 1;
            
            if (parts.length > 0 && p === parts[parts.length - 1] && remaining - p > 0) {
                p = Math.max(1, p - 1);
            }
            
            parts.push(p);
            remaining -= p;
        }
        parts.push(remaining);
        parts.sort(() => 0.5 - Math.random());

        // Assign realistic event names to each slice
        const allEvents = ["Lose Turn", "Spin Again", "Draw Card", "Go Back", "Move 1", "Bonus", "Skip", "Roll Die"];
        allEvents.sort(() => 0.5 - Math.random());

        let slices = parts.map((p, i) => {
            return {
                p: p,
                frac: simplify(p, lcd),
                eventName: allEvents[i]
            };
        });

        let targetIndex = Math.floor(Math.random() * parts.length);
        
        // Pick two events to compare for Part B
        let comp1 = targetIndex; 
        let comp2;
        do { comp2 = Math.floor(Math.random() * slices.length); } while (comp2 === comp1);

        let masteryLvl = window.userMastery.SpinnerFrac || 0;

        sfData = {
            lcd: lcd,
            slices: slices,
            targetIndex: targetIndex,
            comp1: comp1,
            comp2: comp2,
            isExpert: masteryLvl >= 6, // Unlocks Part B
            currentPart: 0,
            perfectRound: true
        };
    }

    function renderSfUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        let expertBadge = sfData.isExpert ? `<div style="color: #8b5cf6; font-weight: bold; font-size: 13px; margin-bottom: 5px;">🌟 Expert Mode Active</div>` : ``;
        document.getElementById('q-title').innerText = `Missing Portions (Round ${sfRound}/${totalSfRounds})`;

        let actionAreaHTML = "";

        if (sfData.currentPart === 0) {
            actionAreaHTML = `
                <span style="font-size: 16px; margin-bottom: 10px;"><strong>Part A: Find the Missing Fraction</strong></span>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; margin-bottom:15px;">
                    <input type="number" id="sf-ans-num" placeholder="?" style="width:60px; height:40px; text-align:center; font-size:18px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                    <div style="width: 50px; height: 2px; background: #1e293b;"></div>
                    <input type="number" id="sf-ans-den" placeholder="?" style="width:60px; height:40px; text-align:center; font-size:18px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                </div>
                <button onclick="checkSfPartA()" id="sf-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">SUBMIT PART A</button>
            `;
        } else {
            let ev1 = sfData.slices[sfData.comp1].eventName;
            let ev2 = sfData.slices[sfData.comp2].eventName;
            actionAreaHTML = `
                <span style="font-size: 16px; margin-bottom: 10px; color:#16a34a; animation: fadeIn 0.4s;"><strong>✅ Missing Fraction Found: ${sfData.slices[sfData.targetIndex].frac.str}</strong></span>
                
                <div style="margin-top:15px; border-top: 2px dashed #cbd5e1; padding-top: 15px; width: 100%; animation: fadeIn 0.4s;">
                    <span style="font-size: 16px; margin-bottom: 15px; display:block; color:#1e293b;"><strong>Part B:</strong> Which event is more likely?</span>
                    <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
                        <button onclick="checkSfPartB(0)" class="sf-comp-btn" style="padding:12px; font-size:16px; font-weight:bold; background:white; border:2px solid #cbd5e1; border-radius:8px; cursor:pointer;">${ev1}</button>
                        <button onclick="checkSfPartB(1)" class="sf-comp-btn" style="padding:12px; font-size:16px; font-weight:bold; background:white; border:2px solid #cbd5e1; border-radius:8px; cursor:pointer;">${ev2}</button>
                        <button onclick="checkSfPartB(2)" class="sf-comp-btn" style="padding:12px; font-size:16px; font-weight:bold; background:white; border:2px solid #cbd5e1; border-radius:8px; cursor:pointer;">Equally Likely</button>
                    </div>
                </div>
            `;
        }

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="text-align:center; color:#64748b; margin-bottom:5px; font-weight:bold; text-transform:uppercase; letter-spacing:1px; font-size:13px;">
                ${expertBadge}
            </div>
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                
                <p style="font-size: 15px; color: #475569; line-height: 1.5; margin-bottom: 20px; text-align:center;">
                    Robert found an old game in a closet, but a portion of the spinner was completely worn off. Help him calculate the missing probabilities!
                </p>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; text-align: center;">
                    <canvas id="sfCanvas" width="300" height="300" style="max-width:100%;"></canvas>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; display:flex; flex-direction: column; align-items: center;">
                    ${actionAreaHTML}
                </div>
            </div>
            <div id="sf-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:24px; font-weight:bold; display:none; z-index:100;"></div>
        `;

        setTimeout(drawSpinner, 50);
    }

    function drawSpinner() {
        const canvas = document.getElementById('sfCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = Math.min(cx, cy) - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let startAngle = -Math.PI / 2; 

        sfData.slices.forEach((slice, i) => {
            let sliceAngle = (slice.p / sfData.lcd) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = i === sfData.targetIndex ? '#fef08a' : '#ffffff'; 
            ctx.fill();
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label Positioning
            let midAngle = startAngle + (sliceAngle / 2);
            let textR = r * 0.65; 
            let tx = cx + Math.cos(midAngle) * textR;
            let ty = cy + Math.sin(midAngle) * textR;

            ctx.fillStyle = '#0f172a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Event Name
            ctx.font = 'bold 12px Arial';
            ctx.fillText(slice.eventName, tx, ty - 20);

            // Draw Fraction or "?"
            if (i === sfData.targetIndex && sfData.currentPart === 0) {
                ctx.font = 'bold 28px Arial';
                ctx.fillText('?', tx, ty + 10);
            } else {
                ctx.font = '15px Arial';
                ctx.fillText(slice.frac.n, tx, ty - 2);
                
                ctx.beginPath();
                ctx.moveTo(tx - 10, ty + 7);
                ctx.lineTo(tx + 10, ty + 7);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.fillText(slice.frac.d, tx, ty + 18);
            }

            startAngle += sliceAngle;
        });
    }

    window.checkSfPartA = function() {
        const elNum = document.getElementById('sf-ans-num');
        const elDen = document.getElementById('sf-ans-den');
        if (!elNum || !elDen) return;

        const uNum = parseInt(elNum.value);
        const uDen = parseInt(elDen.value);
        let targetAns = sfData.slices[sfData.targetIndex].frac;

        if (isNaN(uNum) || isNaN(uDen) || uDen === 0) {
            showSfFlash("Enter a valid fraction.", "error");
            return;
        }

        // Cross multiplication to accept unsimplified fractions
        let isCorrect = (uNum * targetAns.d === targetAns.n * uDen);

        if (isCorrect) {
            elNum.style.backgroundColor = "#dcfce7"; elNum.style.borderColor = "#22c55e";
            elDen.style.backgroundColor = "#dcfce7"; elDen.style.borderColor = "#22c55e";
            document.getElementById('sf-check-btn').disabled = true;
            
            showSfFlash("✅ Correct!", "success");

            setTimeout(() => {
                if (sfData.isExpert) {
                    // Move to Part B
                    sfData.currentPart = 1;
                    renderSfUI();
                } else {
                    // Standard finish
                    if (sfData.perfectRound) sessionCorrectFirstTry++;
                    sfRound++;
                    if (sfRound > totalSfRounds) finishSfGame();
                    else startSfRound();
                }
            }, 1000);
        } else {
            sfData.perfectRound = false;
            elNum.style.backgroundColor = "#fee2e2"; elNum.style.borderColor = "#ef4444";
            elDen.style.backgroundColor = "#fee2e2"; elDen.style.borderColor = "#ef4444";
            showSfFlash("❌ Check your math.", "error");
        }
    };

    window.checkSfPartB = function(choice) {
        // Find the actual math answer
        let p1 = sfData.slices[sfData.comp1].p;
        let p2 = sfData.slices[sfData.comp2].p;
        let ans;
        if (p1 > p2) ans = 0;
        else if (p2 > p1) ans = 1;
        else ans = 2;

        if (choice === ans) {
            showSfFlash("✅ Correct!", "success");
            if (sfData.perfectRound) sessionCorrectFirstTry++;

            sfRound++;
            setTimeout(() => {
                if (sfRound > totalSfRounds) finishSfGame();
                else startSfRound();
            }, 1000);
        } else {
            sfData.perfectRound = false;
            showSfFlash("❌ Check the sizes of the fractions.", "error");
        }
    };

    function finishSfGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px;">🎯</div>
                <h2 style="color:#1e293b; margin:10px 0;">Fractions Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results...</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalSfRounds) mainAdjustment = 1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['SpinnerFrac'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['SpinnerFrac'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'SpinnerFrac': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[SpinnerFrac] Update Error:", error); });
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

    function showSfFlash(msg, type) {
        const overlay = document.getElementById('sf-flash');
        if (!overlay) return;
        overlay.innerText = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)';
        setTimeout(() => { overlay.style.display = 'none'; }, 1500);
    }
})();
