/**
 * skill_treediagrams.js
 * - 7th Grade: The Counting Principle & Tree Diagrams
 * - Forces students to mentally construct the tree diagram step-by-step.
 * - Requires calculating branches per node and total outcomes.
 * - Requires building a valid sample space outcome path.
 */

console.log("🚀 skill_treediagrams.js is LIVE - Rigorous Tree Diagrams");

(function() {
    let tdData = {};
    let tdRound = 1;
    const totalTdRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initTreeDiagramsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        tdRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient
                    .from('assignment7')
                    .select('TreeDiagrams')
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .maybeSingle();
                
                if (data) window.userMastery.TreeDiagrams = data.TreeDiagrams || 0;
            }
        } catch (e) { 
            console.error("[TreeDiagrams] Init error:", e); 
        }
        
        startTdRound();
    };

    function startTdRound() {
        errorsThisRound = 0;
        
        // Scenarios modeled after the Mongolian Bar-B-Que test question
        const scenarios = [
            {
                shop: "Mongolian Bar-B-Que",
                cat1: "Base", choices1: ["Rice", "Noodles"],
                cat2: "Meat", choices2: ["Beef", "Chicken", "Pork"],
                cat3: "Sauce", choices3: ["Garlic", "Teriyaki"]
            },
            {
                shop: "Neighborhood Deli",
                cat1: "Bread", choices1: ["White", "Wheat", "Sourdough"],
                cat2: "Meat", choices2: ["Turkey", "Ham"],
                cat3: "Cheese", choices3: ["Swiss", "Cheddar", "Provolone"]
            },
            {
                shop: "Ice Cream Parlor",
                cat1: "Size", choices1: ["Small", "Large"],
                cat2: "Flavor", choices2: ["Vanilla", "Chocolate", "Strawberry"],
                cat3: "Topping", choices3: ["Sprinkles", "Nuts"]
            }
        ];

        // Pick a random scenario
        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        tdData = {
            scenario: s,
            ans1: s.choices1.length,
            ans2: s.choices2.length,
            ans3: s.choices3.length,
            totalOutcomes: s.choices1.length * s.choices2.length * s.choices3.length
        };

        renderTdUI();
    }

    function renderTdUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Tree Diagrams (Round ${tdRound}/${totalTdRounds})`;

        let s = tdData.scenario;

        // Build dropdown options for the sample space path
        let opt1 = `<option value="">-- ${s.cat1} --</option>` + s.choices1.map(c => `<option value="${c}">${c}</option>`).join('');
        let opt2 = `<option value="">-- ${s.cat2} --</option>` + s.choices2.map(c => `<option value="${c}">${c}</option>`).join('');
        let opt3 = `<option value="">-- ${s.cat3} --</option>` + s.choices3.map(c => `<option value="${c}">${c}</option>`).join('');

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 700px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px; line-height: 1.5;">
                    Welcome to the <strong>${s.shop}</strong>! You need to draw a tree diagram showing all the possible combinations for a meal. 
                    Customers must choose a <strong>${s.cat1}</strong> (${s.choices1.join(", ")}), 
                    then a <strong>${s.cat2}</strong> (${s.choices2.join(", ")}), 
                    and finally a <strong>${s.cat3}</strong> (${s.choices3.join(", ")}).
                </p>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <h3 style="margin-top: 0; color: #3b82f6; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">1. Construct the Tree</h3>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                        <span style="font-weight:bold; color:#1e293b;">How many starting branches do you need for the ${s.cat1}?</span>
                        <input type="number" id="td-b1" placeholder="?" style="width: 60px; padding: 6px; text-align: center; font-size: 16px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                        <span style="font-weight:bold; color:#1e293b;">From the end of EACH ${s.cat1} branch, how many branches for the ${s.cat2}?</span>
                        <input type="number" id="td-b2" placeholder="?" style="width: 60px; padding: 6px; text-align: center; font-size: 16px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                        <span style="font-weight:bold; color:#1e293b;">From the end of EACH ${s.cat2} branch, how many branches for the ${s.cat3}?</span>
                        <input type="number" id="td-b3" placeholder="?" style="width: 60px; padding: 6px; text-align: center; font-size: 16px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <span style="font-weight:bold; color:#0f172a; font-size: 18px;">How many total combinations (endpoints) will there be?</span>
                        <input type="number" id="td-total" placeholder="Total" style="width: 80px; padding: 8px; text-align: center; font-size: 18px; border: 2px solid #0f172a; border-radius: 4px; outline: none; font-weight:bold;">
                    </div>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <h3 style="margin-top: 0; color: #8b5cf6; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">2. List an Outcome</h3>
                    <p style="font-size: 14px; color: #64748b; margin-bottom: 15px;">To prove your tree works, build exactly one valid combination from your sample space.</p>
                    
                    <div style="display:flex; justify-content:center; gap: 10px; flex-wrap: wrap;">
                        <select id="td-path1" style="padding: 8px; font-size: 16px; border: 2px solid #94a3b8; border-radius: 6px; outline: none; background: white;">
                            ${opt1}
                        </select>
                        <select id="td-path2" style="padding: 8px; font-size: 16px; border: 2px solid #94a3b8; border-radius: 6px; outline: none; background: white;">
                            ${opt2}
                        </select>
                        <select id="td-path3" style="padding: 8px; font-size: 16px; border: 2px solid #94a3b8; border-radius: 6px; outline: none; background: white;">
                            ${opt3}
                        </select>
                    </div>
                </div>

                <button onclick="checkTreeDiagrams()" id="td-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; font-size:18px; cursor:pointer; transition: background 0.2s;">CHECK DIAGRAM</button>
            </div>
            <div id="td-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('td-b1')?.focus(); }, 100);
    }

    window.checkTreeDiagrams = function() {
        let allCorrect = true;
        let hintMsg = "❌ Check your tree structure!<br><br>";

        let b1 = document.getElementById('td-b1');
        let b2 = document.getElementById('td-b2');
        let b3 = document.getElementById('td-b3');
        let tot = document.getElementById('td-total');
        
        let p1 = document.getElementById('td-path1');
        let p2 = document.getElementById('td-path2');
        let p3 = document.getElementById('td-path3');

        // Reset visual feedback
        [b1, b2, b3, tot, p1, p2, p3].forEach(el => {
            el.style.borderColor = "#94a3b8"; el.style.backgroundColor = "white";
        });

        // 1. Check Branches
        if (parseInt(b1.value) !== tdData.ans1) { allCorrect = false; b1.style.borderColor = "#ef4444"; b1.style.backgroundColor = "#fee2e2"; } else { b1.style.borderColor = "#22c55e"; }
        if (parseInt(b2.value) !== tdData.ans2) { allCorrect = false; b2.style.borderColor = "#ef4444"; b2.style.backgroundColor = "#fee2e2"; } else { b2.style.borderColor = "#22c55e"; }
        if (parseInt(b3.value) !== tdData.ans3) { allCorrect = false; b3.style.borderColor = "#ef4444"; b3.style.backgroundColor = "#fee2e2"; } else { b3.style.borderColor = "#22c55e"; }

        if (!allCorrect && hintMsg.indexOf("branches") === -1) {
            hintMsg += "• <strong>Branches:</strong> The number of branches at each step matches the number of options available in that category.<br>";
        }

        // 2. Check Total Outcomes (Fundamental Counting Principle)
        if (parseInt(tot.value) !== tdData.totalOutcomes) {
            allCorrect = false;
            tot.style.borderColor = "#ef4444"; tot.style.backgroundColor = "#fee2e2";
            hintMsg += "• <strong>Total Combinations:</strong> Use the Counting Principle. Multiply the branches together (Base × Meat × Sauce).<br>";
        } else {
            tot.style.borderColor = "#22c55e";
        }

        // 3. Check Sample Space Path
        let pathCorrect = p1.value !== "" && p2.value !== "" && p3.value !== "";
        if (!pathCorrect) {
            allCorrect = false;
            if (p1.value === "") p1.style.borderColor = "#ef4444";
            if (p2.value === "") p2.style.borderColor = "#ef4444";
            if (p3.value === "") p3.style.borderColor = "#ef4444";
            hintMsg += "• <strong>Sample Space:</strong> You must select one valid option from every dropdown menu to create a full meal.<br>";
        } else {
            p1.style.borderColor = "#22c55e"; p2.style.borderColor = "#22c55e"; p3.style.borderColor = "#22c55e";
        }

        if (allCorrect) {
            document.getElementById('td-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showTdFlash("✅ Perfect Tree Logic!", "success");

            tdRound++;
            setTimeout(() => {
                if (tdRound > totalTdRounds) finishTdGame();
                else startTdRound();
            }, 2000);
        } else {
            errorsThisRound++;
            showTdFlash(hintMsg, "error");
        }
    };

    function finishTdGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🌳</div>
                <h2 style="color:#1e293b; margin:10px 0;">Trees Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
            </div>
        `;

        let adj = sessionCorrectFirstTry >= totalTdRounds ? 1 : (sessionCorrectFirstTry <= 1 ? -1 : 0);
        if (adj !== 0 && window.supabaseClient && window.currentUser) {
            const newMain = Math.max(0, Math.min(10, (window.userMastery.TreeDiagrams || 0) + adj));
            window.supabaseClient.from('assignment7')
                .update({ 'TreeDiagrams': newMain })
                .eq('userName', window.currentUser)
                .eq('hour', sessionStorage.getItem('target_hour') || "00")
                .then(() => { setTimeout(window.loadNextQuestion, 2000); });
        } else { 
            setTimeout(window.loadNextQuestion, 2000); 
        }
    }

    function showTdFlash(msg, type) {
        const overlay = document.getElementById('td-flash');
        overlay.innerHTML = msg; 
        overlay.style.display = 'block'; 
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 5000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
