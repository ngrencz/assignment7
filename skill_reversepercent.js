/**
 * skill_reversepercent.js
 * - 7th Grade: Finding the Whole from a Percent
 * - Generates scenarios where a part and a percentage are given.
 */
console.log("🚀 skill_reversepercent.js is LIVE");

(function() {
    let rpData = {};
    let rpRound = 1;
    const totalRpRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initReversePercentGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        window.isCurrentQActive = true; rpRound = 1; sessionCorrectFirstTry = 0; errorsThisRound = 0;
        if (!window.userMastery) window.userMastery = {};
        try {
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient.from('assignment7').select('ReversePercent').eq('userName', window.currentUser).eq('hour', hour).maybeSingle();
                if (data) window.userMastery.ReversePercent = data.ReversePercent || 0;
            }
        } catch (e) { console.error(e); }
        startRpRound();
    };

    function startRpRound() {
        errorsThisRound = 0;
        const scenarios = [
            { item: "model airplane", wholeItem: "real airplane", unit: "inches" },
            { item: "toy car", wholeItem: "real car", unit: "inches" },
            { item: "replica statue", wholeItem: "actual monument", unit: "feet" }
        ];
        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Generate clean numbers
        let percent = [2, 4, 5, 10, 20, 25][Math.floor(Math.random() * 6)];
        let whole = Math.floor(Math.random() * 50) * 10 + 500; // 500 to 1000
        let part = whole * (percent / 100);

        rpData = { 
            ans: whole, 
            prompt: `A ${s.item} is exactly ${part} ${s.unit} long. If the model is ${percent}% of the size of the ${s.wholeItem}, how long is the ${s.wholeItem}?` 
        };
        renderRpUI();
    }

    function renderRpUI() {
        document.getElementById('q-title').innerText = `Reverse Percentages (Round ${rpRound}/${totalRpRounds})`;
        document.getElementById('q-content').innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                <p style="font-size: 18px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">${rpData.prompt}</p>
                <div style="display:flex; justify-content:center; align-items:center; gap: 10px; margin-bottom: 20px;">
                    <span style="font-size:18px; font-weight:bold;">Total Length =</span>
                    <input type="number" id="rp-ans" placeholder="?" style="width: 100px; height: 45px; padding: 0 10px; text-align: center; font-size: 18px; border: 2px solid #94a3b8; border-radius: 6px; outline: none;">
                </div>
                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px dashed #3b82f6; margin-bottom: 20px; font-size: 14px; color: #1e3a8a;">
                    <strong>Hint:</strong> If ${rpData.prompt.match(/\d+%/)[0]} of the total is ${rpData.prompt.match(/\d+/)[0]}, you can set up an equation: <em>0.${rpData.prompt.match(/\d+/g)[1].padStart(2, '0')}x = ${rpData.prompt.match(/\d+/)[0]}</em>, or use a percent diagram!
                </div>
                <button onclick="checkReversePercent()" id="rp-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px;">SUBMIT</button>
            </div>
            <div id="rp-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100;"></div>
        `;
    }

    window.checkReversePercent = function() {
        let el = document.getElementById('rp-ans');
        if (!el) return;
        if (parseFloat(el.value) === rpData.ans) {
            el.style.borderColor = "#22c55e"; el.style.backgroundColor = "#dcfce7";
            document.getElementById('rp-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showRpFlash("✅ Correct!", "success");
            rpRound++;
            setTimeout(() => { rpRound > totalRpRounds ? finishRpGame() : startRpRound(); }, 1500);
        } else {
            errorsThisRound++;
            el.style.borderColor = "#ef4444"; el.style.backgroundColor = "#fee2e2";
            showRpFlash("❌ Check your math!", "error");
        }
    };

    function finishRpGame() {
        window.isCurrentQActive = false; 
        document.getElementById('q-content').innerHTML = `<div style="text-align:center; padding:40px;"><h2>Module Complete!</h2><p>Saving mastery...</p></div>`;
        let adj = sessionCorrectFirstTry >= totalRpRounds ? 1 : (sessionCorrectFirstTry <= 1 ? -1 : 0);
        if (adj !== 0 && window.supabaseClient && window.currentUser) {
            const newMain = Math.max(0, Math.min(10, (window.userMastery.ReversePercent || 0) + adj));
            window.supabaseClient.from('assignment7').update({ 'ReversePercent': newMain }).eq('userName', window.currentUser).eq('hour', sessionStorage.getItem('target_hour') || "00").then(() => { setTimeout(window.loadNextQuestion, 1500); });
        } else { setTimeout(window.loadNextQuestion, 1500); }
    }

    function showRpFlash(msg, type) {
        const overlay = document.getElementById('rp-flash');
        overlay.innerHTML = msg; overlay.style.display = 'block'; overlay.style.backgroundColor = type === 'success' ? '#22c55e' : '#ef4444';
        setTimeout(() => { overlay.style.display = 'none'; }, 1500);
    }
})();
