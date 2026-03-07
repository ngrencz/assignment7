/**
 * skill_identifyproportions.js
 * - 7th Grade: Identifying Proportional Relationships (Table Analyzer)
 * - Forces students to calculate y/x for every row.
 * - Forces students to explicitly check for a constant multiplier and (0,0).
 * - Provides targeted hints based on exactly where the student made a mistake.
 */

console.log("🚀 skill_identifyproportions.js is LIVE - Rigorous Table Analyzer");

(function() {
    let ipData = {};
    let ipRound = 1;
    const totalIpRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initIdentifyProportionsGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        ipRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient
                    .from('assignment7')
                    .select('IdentifyProportions')
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .maybeSingle();
                
                if (data) window.userMastery.IdentifyProportions = data.IdentifyProportions || 0;
            }
        } catch (e) { 
            console.error("[IdentifyProportions] Init error:", e); 
        }
        
        startIpRound();
    };

    function startIpRound() {
        errorsThisRound = 0;
        
        // 50% chance of being proportional
        let isProportional = Math.random() > 0.5;
        let m = Math.floor(Math.random() * 5) + 2; // Multiplier: 2 to 6
        let b = isProportional ? 0 : Math.floor(Math.random() * 5) + 1; // Additive offset
        let startX = Math.floor(Math.random() * 2) + 1; // Start x at 1 or 2

        let rows = [];
        for (let i = 0; i < 3; i++) {
            let x = startX + i;
            let y = (x * m) + b;
            
            // Calculate what the student should type for y/x (rounded to 2 decimals if messy)
            let rawRate = y / x;
            let roundedRate = Math.round(rawRate * 100) / 100;
            
            rows.push({ x: x, y: y, rate: roundedRate });
        }

        ipData = {
            isProp: isProportional,
            m: m,
            b: b,
            rows: rows,
            ansConstant: isProportional ? "yes" : "no",
            ansOrigin: isProportional ? "yes" : "no"
        };

        renderIpUI();
    }

    function renderIpUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Identify Proportions (Round ${ipRound}/${totalIpRounds})`;

        let rowsHTML = "";
        ipData.rows.forEach((row, i) => {
            rowsHTML += `
                <tr>
                    <td style="border:1px solid #cbd5e1; padding:12px; font-size:18px;">${row.x}</td>
                    <td style="border:1px solid #cbd5e1; padding:12px; font-size:18px;">${row.y}</td>
                    <td style="border:1px solid #cbd5e1; padding:8px; background:#f8fafc;">
                        <input type="number" step="0.01" id="ip-rate-${i}" placeholder="y ÷ x" autocomplete="off" style="width: 80px; padding: 6px; text-align: center; font-size: 16px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                    </td>
                </tr>
            `;
        });
        
        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 20px; text-align: center;">
                    To prove if a table is proportional, you must analyze its data! Fill out the multiplier column first. <br>
                    <span style="font-size:13px; color:#64748b;">(Round to two decimal places if needed)</span>
                </p>

                <table style="width:100%; text-align:center; border-collapse:collapse; background:white; margin-bottom:25px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <tr>
                        <th style="border:1px solid #cbd5e1; padding:12px; background:#f1f5f9; width:30%;">x</th>
                        <th style="border:1px solid #cbd5e1; padding:12px; background:#f1f5f9; width:30%;">y</th>
                        <th style="border:1px solid #cbd5e1; padding:12px; background:#e0f2fe; color:#0369a1; width:40%;">Multiplier (y ÷ x)</th>
                    </tr>
                    ${rowsHTML}
                </table>

                <div style="display:flex; flex-direction:column; gap: 15px; margin-bottom:25px;">
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                        <span style="font-weight:bold; color:#1e293b;">1. Is there a constant multiplier?</span>
                        <select id="ip-ans-constant" style="padding:8px; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none; background:white;">
                            <option value="">-- Select --</option>
                            <option value="yes">Yes, they are all the same</option>
                            <option value="no">No, they are different</option>
                        </select>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:15px; border-radius:8px; border:1px solid #e2e8f0;">
                        <span style="font-weight:bold; color:#1e293b;">2. If you work backward, does it pass through (0,0)?</span>
                        <select id="ip-ans-origin" style="padding:8px; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none; background:white;">
                            <option value="">-- Select --</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:#eff6ff; padding:15px; border-radius:8px; border:2px solid #3b82f6;">
                        <span style="font-weight:bold; color:#1e3a8a; font-size:18px;">Conclusion: Is it Proportional?</span>
                        <select id="ip-ans-final" style="padding:8px; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none; background:white; font-weight:bold;">
                            <option value="">-- Select --</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>

                </div>

                <button onclick="checkIdentifyProportions()" id="ip-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; font-size:18px; cursor:pointer; transition: background 0.2s;">SUBMIT ANALYSIS</button>
            </div>
            <div id="ip-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('ip-rate-0')?.focus(); }, 100);
    }

    window.checkIdentifyProportions = function() {
        let allCorrect = true;
        let hintMsg = "❌ Let's check your work!<br><br>";
        let ratesCorrect = true;

        // 1. Check Multiplier Math
        ipData.rows.forEach((row, i) => {
            let el = document.getElementById(`ip-rate-${i}`);
            let val = parseFloat(el.value);
            if (!isNaN(val) && Math.abs(val - row.rate) < 0.05) {
                el.style.borderColor = "#22c55e"; el.style.backgroundColor = "#dcfce7";
            } else {
                allCorrect = false; ratesCorrect = false;
                el.style.borderColor = "#ef4444"; el.style.backgroundColor = "#fee2e2";
            }
        });

        if (!ratesCorrect) {
            hintMsg += "• <strong>Math Error:</strong> To find the multiplier, divide the <em>y</em> value by the <em>x</em> value for each row.<br>";
        }

        // 2. Check Constant Multiplier Question
        let elConst = document.getElementById('ip-ans-constant');
        if (elConst.value === ipData.ansConstant) {
            elConst.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elConst.style.borderColor = "#ef4444";
            if (ratesCorrect && elConst.value !== "") {
                hintMsg += "• <strong>Logic Error:</strong> Look at the multiplier column you just calculated. Are the numbers exactly the same in every box?<br>";
            } else if (elConst.value === "") {
                hintMsg += "• Don't forget to answer Question 1!<br>";
            }
        }

        // 3. Check Origin (0,0) Question
        let elOrig = document.getElementById('ip-ans-origin');
        if (elOrig.value === ipData.ansOrigin) {
            elOrig.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elOrig.style.borderColor = "#ef4444";
            if (elOrig.value !== "") {
                hintMsg += "• <strong>Logic Error:</strong> If you step backward in the table's pattern to x = 0, does y = 0? (Hint: If it has a constant multiplier, it will!).<br>";
            } else {
                hintMsg += "• Don't forget to answer Question 2!<br>";
            }
        }

        // 4. Check Final Conclusion
        let elFinal = document.getElementById('ip-ans-final');
        let expectedFinal = ipData.isProp ? "yes" : "no";
        
        if (elFinal.value === expectedFinal) {
            elFinal.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elFinal.style.borderColor = "#ef4444";
            if (elFinal.value !== "") {
                hintMsg += "• <strong>Conclusion Error:</strong> A relationship is ONLY proportional if it has a constant multiplier AND passes through (0,0).<br>";
            } else {
                hintMsg += "• Don't forget to make your final conclusion!<br>";
            }
        }

        if (allCorrect) {
            document.getElementById('ip-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showIpFlash("✅ Perfect Analysis!", "success");

            ipRound++;
            setTimeout(() => {
                if (ipRound > totalIpRounds) finishIpGame();
                else startIpRound();
            }, 2000);
        } else {
            errorsThisRound++;
            showIpFlash(hintMsg, "error");
        }
    };

    function finishIpGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">📈</div>
                <h2 style="color:#1e293b; margin:10px 0;">Proportions Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
            </div>
        `;

        let adj = sessionCorrectFirstTry >= totalIpRounds ? 1 : (sessionCorrectFirstTry <= 1 ? -1 : 0);
        if (adj !== 0 && window.supabaseClient && window.currentUser) {
            const newMain = Math.max(0, Math.min(10, (window.userMastery.IdentifyProportions || 0) + adj));
            window.supabaseClient.from('assignment7')
                .update({ 'IdentifyProportions': newMain })
                .eq('userName', window.currentUser)
                .eq('hour', sessionStorage.getItem('target_hour') || "00")
                .then(() => { setTimeout(window.loadNextQuestion, 2000); });
        } else { 
            setTimeout(window.loadNextQuestion, 2000); 
        }
    }

    function showIpFlash(msg, type) {
        const overlay = document.getElementById('ip-flash');
        overlay.innerHTML = msg; 
        overlay.style.display = 'block'; 
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 5000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
