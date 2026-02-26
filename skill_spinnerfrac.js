/**
 * skill_spinnerfrac.js
 * - Generates pie chart/spinner problems with missing fractions.
 * - Slices circle proportionally based on randomly generated LCDs.
 * - Checks for mathematical equivalence (accepts unsimplified or simplified answers).
 * - Integrated with assignment_hub.js and Supabase assignment7.
 */

console.log("🚀 skill_spinnerfrac.js is LIVE - Missing Fraction Spinners");

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
        // Use clean common denominators suitable for 7th grade
        const denominators = [24, 30, 36, 40, 60];
        const lcd = denominators[Math.floor(Math.random() * denominators.length)];
        
        let remaining = lcd;
        let parts = [];
        let numSlices = Math.floor(Math.random() * 2) + 5; // 5 to 6 total slices

        // Generate random integer slices that sum to LCD
        for (let i = 0; i < numSlices - 1; i++) {
            let maxLimit = Math.floor(remaining / 1.5); 
            if (maxLimit < 1) maxLimit = 1;
            let p = Math.floor(Math.random() * maxLimit) + 1;
            
            // Prevent duplicate adjacent slices to make the chart look better
            if (parts.length > 0 && p === parts[parts.length - 1] && remaining - p > 0) {
                p = Math.max(1, p - 1);
            }
            
            parts.push(p);
            remaining -= p;
        }
        parts.push(remaining);

        // Shuffle parts array
        parts.sort(() => 0.5 - Math.random());

        let fracs = parts.map(p => simplify(p, lcd));
        let targetIndex = Math.floor(Math.random() * parts.length);
        let targetAns = fracs[targetIndex];

        sfData = {
            lcd: lcd,
            parts: parts,
            fracs: fracs,
            targetIndex: targetIndex,
            targetAns: targetAns
        };
    }

    function renderSfUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Missing Portions (Round ${sfRound}/${totalSfRounds})`;

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 20px;">
                    Robert found an old game in a closet and wanted to play it. However, a portion of the spinner shown below could not be read. Find the missing portion of the spinner for Robert.
                </p>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; text-align: center;">
                    <canvas id="sfCanvas" width="250" height="250" style="max-width:100%;"></canvas>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; display:flex; flex-direction: column; align-items: center;">
                    <span style="font-size: 16px; margin-bottom: 10px;"><strong>Missing Fraction:</strong></span>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                        <input type="number" id="sf-ans-num" placeholder="?" style="width:60px; height:40px; text-align:center; font-size:18px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        <div style="width: 50px; height: 2px; background: #1e293b;"></div>
                        <input type="number" id="sf-ans-den" placeholder="?" style="width:60px; height:40px; text-align:center; font-size:18px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                    </div>
                </div>

                <button onclick="checkSpinnerFrac()" id="sf-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ANSWER</button>
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
        const r = Math.min(cx, cy) - 5;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let startAngle = -Math.PI / 2; // Start at 12 o'clock

        sfData.parts.forEach((p, i) => {
            let sliceAngle = (p / sfData.lcd) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            ctx.fillStyle = i === sfData.targetIndex ? '#fef08a' : '#ffffff'; // Highlight target slice
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
            
            if (i === sfData.targetIndex) {
                ctx.font = 'bold 28px Arial';
                ctx.fillText('?', tx, ty);
            } else {
                ctx.font = '16px Arial';
                let fraction = sfData.fracs[i];
                ctx.fillText(fraction.n, tx, ty - 10);
                
                // Draw fraction line
                ctx.beginPath();
                ctx.moveTo(tx - 8, ty);
                ctx.lineTo(tx + 8, ty);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                
                ctx.fillText(fraction.d, tx, ty + 12);
            }

            startAngle += sliceAngle;
        });
    }

    window.checkSpinnerFrac = function() {
        const elNum = document.getElementById('sf-ans-num');
        const elDen = document.getElementById('sf-ans-den');

        if (!elNum || !elDen) return;

        const uNum = parseInt(elNum.value);
        const uDen = parseInt(elDen.value);

        let isCorrect = false;

        // Use cross multiplication to accept unsimplified equivalent fractions
        if (!isNaN(uNum) && !isNaN(uDen) && uDen !== 0 && (uNum * sfData.targetAns.d === sfData.targetAns.n * uDen)) {
            isCorrect = true;
        }

        if (isCorrect) {
            elNum.style.backgroundColor = "#dcfce7"; elNum.style.borderColor = "#22c55e";
            elDen.style.backgroundColor = "#dcfce7"; elDen.style.borderColor = "#22c55e";
            
            document.getElementById('sf-check-btn').disabled = true;
            showSfFlash("Correct!", "success");
            sessionCorrectFirstTry++;

            sfRound++;
            setTimeout(() => {
                if (sfRound > totalSfRounds) finishSfGame();
                else startSfRound();
            }, 1200);
        } else {
            elNum.style.backgroundColor = "#fee2e2"; elNum.style.borderColor = "#ef4444";
            elDen.style.backgroundColor = "#fee2e2"; elDen.style.borderColor = "#ef4444";
            showSfFlash("Check your math.", "error");
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
                <p style="color:#64748b; font-size:16px;">Skills updated.</p>
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
