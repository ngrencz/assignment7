/**
 * skill_treediagrams.js
 * - 7th Grade: The Counting Principle
 */
console.log("🚀 skill_treediagrams.js is LIVE");

(function() {
    let tdData = {};
    let tdRound = 1;
    const totalTdRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initTreeDiagramsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        window.isCurrentQActive = true; tdRound = 1; sessionCorrectFirstTry = 0; errorsThisRound = 0;
        if (!window.userMastery) window.userMastery = {};
        try {
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient.from('assignment7').select('TreeDiagrams').eq('userName', window.currentUser).eq('hour', hour).maybeSingle();
                if (data) window.userMastery.TreeDiagrams = data.TreeDiagrams || 0;
            }
        } catch (e) { console.error(e); }
        startTdRound();
    };

    function startTdRound() {
        errorsThisRound = 0;
        const scenarios = [
            { shop: "Sandwich Shop", cat1: "breads", cat2: "meats", cat3: "cheeses" },
            { shop: "Ice Cream Parlor", cat1: "cone types", cat2: "flavors", cat3: "toppings" },
            { shop: "Car Dealership", cat1: "models", cat2: "exterior colors", cat3: "interior styles" }
        ];
        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        let c1 = Math.floor(Math.random() * 3) + 2;
        let c2 = Math.floor(Math.random() * 4) + 2;
        let c3 = Math.floor(Math.random() * 3) + 2;
        
        tdData = { c1: c1, c2: c2, c3: c3, total: c1 * c2 * c3, s: s };
        renderTdUI();
    }

    function renderTdUI() {
        document.getElementById('q-title').innerText = `Tree Diagrams & Sample Spaces (Round ${tdRound}/${totalTdRounds})`;
        let d = tdData;
        document.getElementById('q-content').innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                <p style="font-size: 16px; margin-bottom: 20px;">A ${d.s.shop} lets you build your own combination. They offer <strong>${d.c1}</strong> ${d.s.cat1}, <strong>${d.c2}</strong> ${d.s.cat2}, and <strong>${d.c3}</strong> ${d.s.cat3}.</p>
                <div style="background:white; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom:20px;">
                    <p style="font-weight:bold; margin-bottom:10px;">If you drew a tree diagram, how many branches would there be in total?</p>
                    <div style="display:flex; justify-content:center; align-items:center; gap: 10px;">
                        <input type="number" id="td-ans" placeholder="Total Combos" style="width: 140px; height: 40px; text-align: center; font-size: 18px; border: 2px solid #94a3b8; border-radius: 6px; outline: none;">
                    </div>
                </div>
                <button onclick="checkTreeDiagrams()" id="td-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; font-size: 18px; cursor:pointer;">SUBMIT</button>
            </div>
            <div id="td-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100;"></div>
        `;
    }

    window.checkTreeDiagrams = function() {
        let el = document.getElementById('td-ans');
        if (!el) return;
        if (parseInt(el.value) === tdData.total) {
            el.style.borderColor = "#22c55e"; el.style.backgroundColor = "#dcfce7";
            document.getElementById('td-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showTdFlash("✅ Correct! Multiply the choices.", "success");
            tdRound++;
            setTimeout(() => { tdRound > totalTdRounds ? finishTdGame() : startTdRound(); }, 1500);
        } else {
            errorsThisRound++;
            el.style.borderColor = "#ef4444"; el.style.backgroundColor = "#fee2e2";
            showTdFlash("❌ Hint: Use the fundamental counting principle (multiply).", "error");
        }
    };

    function finishTdGame() {
        window.isCurrentQActive = false; 
        document.getElementById('q-content').innerHTML = `<div style="text-align:center; padding:40px;"><h2>Module Complete!</h2></div>`;
        let adj = sessionCorrectFirstTry >= totalTdRounds ? 1 : (sessionCorrectFirstTry <= 1 ? -1 : 0);
        if (adj !== 0 && window.supabaseClient && window.currentUser) {
            const newMain = Math.max(0, Math.min(10, (window.userMastery.TreeDiagrams || 0) + adj));
            window.supabaseClient.from('assignment7').update({ 'TreeDiagrams': newMain }).eq('userName', window.currentUser).eq('hour', sessionStorage.getItem('target_hour') || "00").then(() => { setTimeout(window.loadNextQuestion, 1500); });
        } else { setTimeout(window.loadNextQuestion, 1500); }
    }

    function showTdFlash(msg, type) {
        const overlay = document.getElementById('td-flash');
        overlay.innerHTML = msg; overlay.style.display = 'block'; overlay.style.backgroundColor = type === 'success' ? '#22c55e' : '#ef4444';
        setTimeout(() => { overlay.style.display = 'none'; }, 2000);
    }
})();
