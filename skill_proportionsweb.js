/**
 * skill_proportionsweb.js
 * - 7th Grade: Proportions Web & Unit Rates
 * - Generates word problems asking for Unit Rate and the Equation (y = kx).
 * - Includes a visual "Help" modal displaying a Proportions Web.
 */

console.log("🚀 skill_proportionsweb.js is LIVE - Proportions Web");

(function() {
    let pwData = {};
    let pwRound = 1;
    const totalPwRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initProportionsWebGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        pwRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('ProportionsWeb')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[ProportionsWeb] Fetch error:", error);
                if (data) window.userMastery.ProportionsWeb = data.ProportionsWeb || 0;
            }
        } catch (e) { 
            console.error("[ProportionsWeb] Init error:", e); 
        }
        
        startPwRound();
    };

    function startPwRound() {
        errorsThisRound = 0;
        generatePwProblem();
        renderPwUI();
    }

    function generatePwProblem() {
        const scenarios = [
            { subject: "A candy-wrapping robot", verb: "wrap", item: "pieces of candy", unit: "minutes" },
            { subject: "A water pump", verb: "move", item: "gallons of water", unit: "minutes" },
            { subject: "A 3D printer", verb: "print", item: "grams of plastic", unit: "hours" },
            { subject: "A commercial baker", verb: "frost", item: "cupcakes", unit: "hours" },
            { subject: "A high-speed train", verb: "travel", item: "miles", unit: "hours" }
        ];
        
        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Generate clean unit rates (e.g., 86.8 or 45)
        let isDecimal = Math.random() > 0.5;
        let unitRate = isDecimal ? (Math.floor(Math.random() * 500) + 105) / 10 : Math.floor(Math.random() * 80) + 12; 
        let time = Math.floor(Math.random() * 8) + 3; // 3 to 10
        
        let total = parseFloat((unitRate * time).toFixed(1)); // To handle JS float weirdness

        pwData = {
            scenario: s,
            total: total,
            time: time,
            unitRate: unitRate,
            prompt: `${s.subject} can ${s.verb} <strong>${total} ${s.item}</strong> in <strong>${time} ${s.unit}</strong>.`
        };
    }

    function renderPwUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Proportions Web (Round ${pwRound}/${totalPwRounds})`;

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
                    <p style="font-size: 17px; color: #1e293b; line-height: 1.6; flex:1; margin-right: 15px;">
                        ${pwData.prompt}
                    </p>
                    <button onclick="togglePwHelp()" style="background:#3b82f6; color:white; border:none; padding:8px 12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px; white-space:nowrap;">
                        💡 Help: Web
                    </button>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px;">
                    <div style="margin-bottom: 20px;">
                        <span style="font-size: 16px; font-weight:bold; color:#1e293b; display:block; margin-bottom:8px;">1. Find the Unit Rate</span>
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <input type="number" step="0.1" id="pw-rate" placeholder="0.0" style="width: 100px; padding:10px; font-size:18px; text-align:center; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off">
                            <span style="font-size:16px; color:#475569;">${pwData.scenario.item} per ${pwData.scenario.unit.slice(0, -1)}</span>
                        </div>
                    </div>

                    <div style="border-top: 1px dashed #cbd5e1; padding-top: 20px;">
                        <span style="font-size: 16px; font-weight:bold; color:#1e293b; display:block; margin-bottom:8px;">2. Write the Equation</span>
                        <span style="font-size:14px; color:#64748b; margin-bottom:10px; display:block;">(Use <strong>x</strong> for ${pwData.scenario.unit} and <strong>y</strong> for ${pwData.scenario.item})</span>
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <span style="font-size:20px; font-weight:bold; font-family:'Courier New', monospace;">y = </span>
                            <input type="text" id="pw-eq" placeholder="e.g. 5.5x" style="width: 150px; padding:10px; font-size:18px; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off">
                        </div>
                    </div>
                </div>

                <button onclick="checkProportionsWeb()" id="pw-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>

            <div id="pw-help-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.8); z-index:200; align-items:center; justify-content:center;">
                <div style="background:white; padding:30px; border-radius:12px; max-width:500px; width:90%; position:relative;">
                    <button onclick="togglePwHelp()" style="position:absolute; top:10px; right:15px; font-size:24px; background:none; border:none; cursor:pointer; color:#64748b;">&times;</button>
                    <h3 style="margin-top:0; color:#1e293b; text-align:center;">The Proportions Web</h3>
                    <p style="color:#475569; font-size:14px; text-align:center; margin-bottom:20px;">All 4 areas represent the <strong>exact same Unit Rate!</strong></p>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; text-align:center;">
                        <div style="background:#f1f5f9; padding:15px; border-radius:8px; border:2px solid #cbd5e1;">
                            <strong style="color:#2563eb;">WORDS</strong><br>
                            <span style="font-size:13px; color:#475569;">"It makes 86.8 pieces per minute."</span>
                        </div>
                        <div style="background:#f1f5f9; padding:15px; border-radius:8px; border:2px solid #cbd5e1;">
                            <strong style="color:#16a34a;">TABLE</strong><br>
                            <span style="font-size:13px; color:#475569;">x gets multiplied by the unit rate to find y.</span>
                        </div>
                        <div style="background:#f1f5f9; padding:15px; border-radius:8px; border:2px solid #cbd5e1;">
                            <strong style="color:#d97706;">GRAPH</strong><br>
                            <span style="font-size:13px; color:#475569;">A straight line starting at (0,0). Steepness = Unit Rate.</span>
                        </div>
                        <div style="background:#f1f5f9; padding:15px; border-radius:8px; border:2px solid #cbd5e1;">
                            <strong style="color:#9333ea;">EQUATION</strong><br>
                            <span style="font-size:13px; color:#475569;"><strong>y = kx</strong><br>(y = 86.8x)</span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="pw-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('pw-rate')?.focus(); }, 100);
    }

    window.togglePwHelp = function() {
        const modal = document.getElementById('pw-help-modal');
        if (modal.style.display === 'none') {
            modal.style.display = 'flex';
        } else {
            modal.style.display = 'none';
        }
    };

    window.checkProportionsWeb = function() {
        const elRate = document.getElementById('pw-rate');
        const elEq = document.getElementById('pw-eq');

        if (!elRate || !elEq) return;

        const uRate = parseFloat(elRate.value);
        let uEq = elEq.value.replace(/\s+/g, '').toLowerCase();

        // Check Unit Rate
        let rateCorrect = (!isNaN(uRate) && Math.abs(uRate - pwData.unitRate) < 0.05);

        // Check Equation (Accepts "86.8x", "x*86.8", "86.8*x", etc. since the "y=" is outside the box)
        let eqCorrect = false;
        let expectedK = pwData.unitRate.toString();
        
        if (uEq === `${expectedK}x` || uEq === `x*${expectedK}` || uEq === `${expectedK}*x`) {
            eqCorrect = true;
        }

        // Visual Feedback
        elRate.style.borderColor = rateCorrect ? "#22c55e" : "#ef4444";
        elRate.style.backgroundColor = rateCorrect ? "#dcfce7" : "#fee2e2";

        elEq.style.borderColor = eqCorrect ? "#22c55e" : "#ef4444";
        elEq.style.backgroundColor = eqCorrect ? "#dcfce7" : "#fee2e2";

        if (rateCorrect && eqCorrect) {
            document.getElementById('pw-check-btn').disabled = true;
            
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showPwFlash("✅ Perfect Translation!", "success");

            pwRound++;
            setTimeout(() => {
                if (pwRound > totalPwRounds) finishPwGame();
                else startPwRound();
            }, 1500);

        } else {
            errorsThisRound++;
            
            let hintMsg = "❌ Check your inputs!<br><br>";
            if (!rateCorrect) hintMsg += "• Find the Unit Rate by dividing total items by time.<br>";
            if (rateCorrect && !eqCorrect) hintMsg += `• The equation format is <strong>y = kx</strong> (where k is your unit rate). You just need to type the <strong>${expectedK}x</strong> part!`;
            
            showPwFlash(hintMsg, "error");
        }
    };

    function finishPwGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🕸️</div>
                <h2 style="color:#1e293b; margin:10px 0;">Proportions Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalPwRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['ProportionsWeb'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['ProportionsWeb'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'ProportionsWeb': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[ProportionsWeb] Update Error:", error); });
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

    function showPwFlash(msg, type) {
        const overlay = document.getElementById('pw-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 3500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
