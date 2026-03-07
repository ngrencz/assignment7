/**
 * skill_percentdiagram.js
 * - 7th Grade: Percent Rulers / Tape Diagrams (CL 5-149)
 * - Generates a visual double number line (0% to 100%).
 * - Forces students to find 10% and 50% benchmarks to solve for a target percentage.
 */

console.log("🚀 skill_percentdiagram.js is LIVE - Percent Diagrams");

(function() {
    let pdData = {};
    let pdRound = 1;
    const totalPdRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initPercentDiagramGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        pdRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('PercentDiagram')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[PercentDiagram] Fetch error:", error);
                if (data) window.userMastery.PercentDiagram = data.PercentDiagram || 0;
            }
        } catch (e) { 
            console.error("[PercentDiagram] Init error:", e); 
        }
        
        startPdRound();
    };

    function startPdRound() {
        errorsThisRound = 0;
        generatePdProblem();
        renderPdUI();
    }

    function generatePdProblem() {
        const names = ["Evan", "Maya", "Leo", "Chloe", "Marcus", "Sarah"];
        const items = ["bike parts", "a new skateboard", "concert tickets", "a video game console", "a smart watch"];
        
        let name = names[Math.floor(Math.random() * names.length)];
        let item = items[Math.floor(Math.random() * items.length)];
        
        // Pick clean totals (multiples of 20) so 10% and 5% are whole numbers or clean .5s
        const totals = [40, 60, 80, 120, 160, 200, 240, 300];
        let total = totals[Math.floor(Math.random() * totals.length)];
        
        // Pick a target percentage (ending in 5 to force using benchmarks)
        const targets = [15, 25, 35, 45, 65, 75, 85, 95];
        let pct = targets[Math.floor(Math.random() * targets.length)];

        let val10 = total * 0.10;
        let val50 = total * 0.50;
        let valTarget = total * (pct / 100);

        pdData = {
            name: name,
            item: item,
            total: total,
            pct: pct,
            val10: val10,
            val50: val50,
            valTarget: valTarget,
            prompt: `${name} is trying to save $${total} to buy ${item}. ${name} has saved ${pct}% of what is needed so far. Fill out the Percent Ruler below to find out how much money ${name} has saved.`
        };
    }

    function renderPdUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Percent Diagrams (Round ${pdRound}/${totalPdRounds})`;

        let d = pdData;

        // Position the target tick mark visually using CSS percentages
        // Adjust slightly if it overlaps with 10% or 50% visually
        let targetLeft = d.pct;
        let targetDisplay = d.pct > 50 ? 'right: 50%; transform: translateX(50%);' : 'left: 50%; transform: translateX(-50%);';

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 750px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 30px;">
                    ${d.prompt}
                </p>

                <div style="background: white; padding: 40px 20px 60px 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; overflow-x: auto;">
                    <div style="position: relative; width: 100%; min-width: 500px; height: 80px; margin: 0 auto;">
                        
                        <div style="position: absolute; top: 40px; left: 5%; right: 5%; height: 4px; background: #334155; border-radius: 2px;"></div>
                        
                        <div style="position: absolute; top: 0; left: 5%; transform: translateX(-50%); text-align: center; width: 60px;">
                            <div style="font-weight: bold; color: #475569; margin-bottom: 4px;">0%</div>
                            <div style="height: 24px; width: 4px; background: #334155; margin: 0 auto;"></div>
                            <div style="margin-top: 8px; font-weight: bold; color: #1e293b;">$0</div>
                        </div>

                        <div style="position: absolute; top: 0; left: 14%; transform: translateX(-50%); text-align: center; width: 70px;">
                            <div style="font-weight: bold; color: #3b82f6; margin-bottom: 4px;">10%</div>
                            <div style="height: 24px; width: 3px; background: #94a3b8; margin: 0 auto;"></div>
                            <div style="margin-top: 8px;">
                                <input type="number" step="0.5" id="pd-val10" placeholder="$ ?" style="width: 55px; padding: 4px; text-align: center; font-size: 14px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                            </div>
                        </div>

                        <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); text-align: center; width: 70px;">
                            <div style="font-weight: bold; color: #3b82f6; margin-bottom: 4px;">50%</div>
                            <div style="height: 24px; width: 3px; background: #94a3b8; margin: 0 auto;"></div>
                            <div style="margin-top: 8px;">
                                <input type="number" step="0.5" id="pd-val50" placeholder="$ ?" style="width: 65px; padding: 4px; text-align: center; font-size: 14px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                            </div>
                        </div>

                        <div style="position: absolute; top: 0; left: ${5 + (d.pct * 0.9)}%; transform: translateX(-50%); text-align: center; width: 80px; z-index: 10;">
                            <div style="font-weight: bold; color: #8b5cf6; margin-bottom: 4px; font-size: 18px;">${d.pct}%</div>
                            <div style="height: 24px; width: 4px; background: #8b5cf6; margin: 0 auto;"></div>
                            <div style="margin-top: 8px;">
                                <input type="number" step="0.5" id="pd-valTarget" placeholder="$ ?" style="width: 75px; padding: 6px; text-align: center; font-size: 16px; border: 2px solid #8b5cf6; border-radius: 4px; outline: none; font-weight: bold;">
                            </div>
                        </div>

                        <div style="position: absolute; top: 0; left: 95%; transform: translateX(-50%); text-align: center; width: 60px;">
                            <div style="font-weight: bold; color: #475569; margin-bottom: 4px;">100%</div>
                            <div style="height: 24px; width: 4px; background: #334155; margin: 0 auto;"></div>
                            <div style="margin-top: 8px; font-weight: bold; color: #1e293b;">$${d.total}</div>
                        </div>

                    </div>
                </div>

                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px dashed #3b82f6; margin-bottom: 20px; font-size: 14px; color: #1e3a8a;">
                    <strong>Hint:</strong> Use the easy benchmarks! Find 10% first. Then find 50%. You can use those values to piece together the target amount.
                </div>

                <button onclick="checkPercentDiagram()" id="pd-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK RULER</button>
            </div>
            <div id="pd-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('pd-val10')?.focus(); }, 100);
    }

    window.checkPercentDiagram = function() {
        let allCorrect = true;
        let hintMsg = "❌ Check your marks!<br><br>";

        let el10 = document.getElementById('pd-val10');
        let el50 = document.getElementById('pd-val50');
        let elT = document.getElementById('pd-valTarget');

        let v10 = parseFloat(el10.value);
        let v50 = parseFloat(el50.value);
        let vT = parseFloat(elT.value);

        // Check 10% Benchmark
        if (!isNaN(v10) && Math.abs(v10 - pdData.val10) < 0.05) {
            el10.style.borderColor = "#22c55e"; el10.style.backgroundColor = "#dcfce7";
        } else {
            allCorrect = false;
            el10.style.borderColor = "#ef4444"; el10.style.backgroundColor = "#fee2e2";
            hintMsg += "• For 10%, move the decimal point of the total one place to the left.<br>";
        }

        // Check 50% Benchmark
        if (!isNaN(v50) && Math.abs(v50 - pdData.val50) < 0.05) {
            el50.style.borderColor = "#22c55e"; el50.style.backgroundColor = "#dcfce7";
        } else {
            allCorrect = false;
            el50.style.borderColor = "#ef4444"; el50.style.backgroundColor = "#fee2e2";
            hintMsg += "• For 50%, find exactly half of the total.<br>";
        }

        // Check Target %
        if (!isNaN(vT) && Math.abs(vT - pdData.valTarget) < 0.05) {
            elT.style.borderColor = "#22c55e"; elT.style.backgroundColor = "#dcfce7";
        } else {
            allCorrect = false;
            elT.style.borderColor = "#ef4444"; elT.style.backgroundColor = "#fee2e2";
            hintMsg += `• The ${pdData.pct}% mark is incorrect. Try combining your 10% and 50% blocks!`;
        }

        if (allCorrect) {
            document.getElementById('pd-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showPdFlash("✅ Perfect Ruler!", "success");

            pdRound++;
            setTimeout(() => {
                if (pdRound > totalPdRounds) finishPdGame();
                else startPdRound();
            }, 1800);
        } else {
            errorsThisRound++;
            showPdFlash(hintMsg, "error");
        }
    };

    function finishPdGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">📏</div>
                <h2 style="color:#1e293b; margin:10px 0;">Diagrams Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalPdRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['PercentDiagram'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['PercentDiagram'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'PercentDiagram': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[PercentDiagram] Update Error:", error); });
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

    function showPdFlash(msg, type) {
        const overlay = document.getElementById('pd-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 4500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
