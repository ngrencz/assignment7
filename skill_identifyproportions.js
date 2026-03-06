/**
 * skill_identifyproportions.js
 * - 7th Grade: Identifying Proportional Relationships
 * - Evaluates tables and text scenarios for (0,0) and a constant multiplier.
 */
console.log("🚀 skill_identifyproportions.js is LIVE");

(function() {
    let ipData = {};
    let ipRound = 1;
    const totalIpRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initIdentifyProportionsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        window.isCurrentQActive = true; ipRound = 1; sessionCorrectFirstTry = 0; errorsThisRound = 0;
        if (!window.userMastery) window.userMastery = {};
        try {
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient.from('assignment7').select('IdentifyProportions').eq('userName', window.currentUser).eq('hour', hour).maybeSingle();
                if (data) window.userMastery.IdentifyProportions = data.IdentifyProportions || 0;
            }
        } catch (e) { console.error(e); }
        startIpRound();
    };

    function startIpRound() {
        errorsThisRound = 0;
        let isTable = Math.random() > 0.5;
        let isProportional = Math.random() > 0.5;

        if (isTable) {
            let m = Math.floor(Math.random() * 5) + 2;
            let b = isProportional ? 0 : Math.floor(Math.random() * 5) + 1;
            let startX = Math.floor(Math.random() * 3) + 1;
            let html = `<table style="width:100%; text-align:center; border-collapse:collapse; margin-bottom:15px;"><tr><th style="border:1px solid #ccc; padding:8px; background:#f1f5f9;">x</th><th style="border:1px solid #ccc; padding:8px; background:#f1f5f9;">y</th></tr>`;
            for(let i=0; i<4; i++) {
                let x = startX + i;
                let y = (x * m) + b;
                html += `<tr><td style="border:1px solid #ccc; padding:8px;">${x}</td><td style="border:1px solid #ccc; padding:8px;">${y}</td></tr>`;
            }
            html += `</table>`;
            ipData = { display: html, isProp: isProportional };
        } else {
            if (isProportional) {
                ipData = { display: `<p style="font-size:18px;">A teacher grades 4 exams every hour.</p>`, isProp: true };
            } else {
                ipData = { display: `<p style="font-size:18px;">For every $10 you save, your bank adds $1.50. You also get a $5 starting bonus when you open the account.</p>`, isProp: false };
            }
        }
        renderIpUI();
    }

    function renderIpUI() {
        document.getElementById('q-title').innerText = `Identify Proportions (Round ${ipRound}/${totalIpRounds})`;
        document.getElementById('q-content').innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                <p style="color:#64748b; margin-bottom:15px; text-align:center;">Analyze the relationship below.</p>
                <div style="background:white; padding:20px; border-radius:8px; border:1px solid #cbd5e1; margin-bottom:20px;">
                    ${ipData.display}
                </div>
                <div style="display:flex; flex-direction:column; gap: 15px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                        <span style="font-weight:bold;">Is it a Proportional Relationship?</span>
                        <select id="ip-ans" style="padding:8px; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;">
                            <option value="">-- Select --</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                </div>
                <button onclick="checkIdentifyProportions()" id="ip-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; font-size:18px; cursor:pointer;">SUBMIT</button>
            </div>
            <div id="ip-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center;"></div>
        `;
    }

    window.checkIdentifyProportions = function() {
        let el = document.getElementById('ip-ans');
        if (!el || el.value === "") return;
        
        let isCorrect = (el.value === "yes" && ipData.isProp) || (el.value === "no" && !ipData.isProp);

        if (isCorrect) {
            el.style.borderColor = "#22c55e"; 
            document.getElementById('ip-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showIpFlash("✅ Correct!", "success");
            ipRound++;
            setTimeout(() => { ipRound > totalIpRounds ? finishIpGame() : startIpRound(); }, 1500);
        } else {
            errorsThisRound++;
            el.style.borderColor = "#ef4444";
            showIpFlash(`❌ Remember: Proportions must have a constant multiplier AND pass through (0,0).`, "error");
        }
    };

    function finishIpGame() {
        window.isCurrentQActive = false; 
        document.getElementById('q-content').innerHTML = `<div style="text-align:center; padding:40px;"><h2>Module Complete!</h2></div>`;
        let adj = sessionCorrectFirstTry >= totalIpRounds ? 1 : (sessionCorrectFirstTry <= 1 ? -1 : 0);
        if (adj !== 0 && window.supabaseClient && window.currentUser) {
            const newMain = Math.max(0, Math.min(10, (window.userMastery.IdentifyProportions || 0) + adj));
            window.supabaseClient.from('assignment7').update({ 'IdentifyProportions': newMain }).eq('userName', window.currentUser).eq('hour', sessionStorage.getItem('target_hour') || "00").then(() => { setTimeout(window.loadNextQuestion, 1500); });
        } else { setTimeout(window.loadNextQuestion, 1500); }
    }

    function showIpFlash(msg, type) {
        const overlay = document.getElementById('ip-flash');
        overlay.innerHTML = msg; overlay.style.display = 'block'; overlay.style.backgroundColor = type === 'success' ? '#22c55e' : '#ef4444';
        setTimeout(() => { overlay.style.display = 'none'; }, 2500);
    }
})();
