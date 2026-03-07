/**
 * skill_reversepercent.js
 * - 7th Grade: Finding the Whole from a Percent (Rigorous Setup)
 * - Forces students to set up a Part/Whole = %/100 proportion before solving.
 * - Prevents calculator guessing by requiring accurate translation of the word problem.
 */

console.log("🚀 skill_reversepercent.js is LIVE - Rigorous Setup");

(function() {
    let rpData = {};
    let rpRound = 1;
    const totalRpRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initReversePercentGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        rpRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient
                    .from('assignment7')
                    .select('ReversePercent')
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .maybeSingle();
                
                if (data) window.userMastery.ReversePercent = data.ReversePercent || 0;
            }
        } catch (e) { 
            console.error("[ReversePercent] Init error:", e); 
        }
        
        startRpRound();
    };

    function startRpRound() {
        errorsThisRound = 0;
        
        const scenarios = [
            { item: "model airplane", wholeItem: "real airplane", unit: "inches" },
            { item: "replica statue", wholeItem: "actual monument", unit: "feet" },
            { item: "toy car", wholeItem: "real car", unit: "inches" },
            { item: "scale drawing of a building", wholeItem: "real building", unit: "feet" },
            { item: "replica baseball bat", wholeItem: "giant museum bat", unit: "inches" }
        ];

        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Generate clean numbers that are easy to cross-multiply or scale
        let percents = [2, 4, 5, 10, 20, 25];
        let pct = percents[Math.floor(Math.random() * percents.length)];
        
        let whole = Math.floor(Math.random() * 50) * 10 + 500; // 500 to 1000
        let part = whole * (pct / 100);

        rpData = {
            scenario: s,
            valPart: part,
            valPct: pct,
            valWhole: whole,
            prompt: `A ${s.item} is exactly <strong>${part} ${s.unit}</strong> long. The model is <strong>${pct}%</strong> of the size of the ${s.wholeItem}. How long is the ${s.wholeItem}?`
        };

        renderRpUI();
    }

    function renderRpUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Reverse Percentages (Round ${rpRound}/${totalRpRounds})`;

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 18px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">
                    ${rpData.prompt}
                </p>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <h3 style="margin-top: 0; color: #3b82f6; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">1. Set up the Proportion</h3>
                    
                    <div style="display:flex; justify-content:center; align-items:center; gap: 20px; font-size: 20px; font-weight: bold; color: #1e293b;">
                        
                        <div style="display:flex; flex-direction:column; align-items:center; gap: 8px;">
                            <div style="display:flex; align-items:center; gap: 10px;">
                                <span style="font-size: 14px; color: #64748b; font-weight: normal;">(Part)</span>
                                <input type="number" id="rp-part" placeholder="?" autocomplete="off" style="width: 80px; padding: 6px; text-align: center; font-size: 18px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                            </div>
                            <div style="width: 100%; height: 3px; background: #1e293b; border-radius: 2px;"></div>
                            <div style="display:flex; align-items:center; gap: 10px;">
                                <span style="font-size: 14px; color: #64748b; font-weight: normal;">(Total)</span>
                                <span style="display:inline-block; width: 80px; text-align:center; color: #8b5cf6;"><em>x</em></span>
                            </div>
                        </div>

                        <span>=</span>

                        <div style="display:flex; flex-direction:column; align-items:center; gap: 8px;">
                            <div style="display:flex; align-items:center; gap: 10px;">
                                <input type="number" id="rp-pct" placeholder="%" autocomplete="off" style="width: 80px; padding: 6px; text-align: center; font-size: 18px; border: 2px solid #94a3b8; border-radius: 4px; outline: none;">
                                <span style="font-size: 14px; color: #64748b; font-weight: normal;">(%)</span>
                            </div>
                            <div style="width: 100%; height: 3px; background: #1e293b; border-radius: 2px;"></div>
                            <div style="display:flex; align-items:center; gap: 10px;">
                                <span style="display:inline-block; width: 80px; text-align:center;">100</span>
                                <span style="font-size: 14px; color: white; font-weight: normal;">(%)</span> </div>
                        </div>

                    </div>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <h3 style="margin-top: 0; color: #8b5cf6; font-size: 18px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">2. Solve for the Total</h3>
                    <div style="display:flex; justify-content:center; align-items:center; gap: 15px;">
                        <span style="font-size: 18px; font-weight: bold; color: #1e293b;"><em>x</em> =</span>
                        <input type="number" id="rp-ans" placeholder="Total ${rpData.scenario.unit}" autocomplete="off" style="width: 150px; padding: 10px; text-align: center; font-size: 18px; border: 2px solid #94a3b8; border-radius: 6px; outline: none; font-weight: bold;">
                    </div>
                </div>

                <button onclick="checkReversePercent()" id="rp-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; font-size:18px; cursor:pointer; transition: background 0.2s;">CHECK WORK</button>
            </div>
            <div id="rp-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('rp-part')?.focus(); }, 100);
    }

    window.checkReversePercent = function() {
        let allCorrect = true;
        let hintMsg = "❌ Check your work!<br><br>";

        let elPart = document.getElementById('rp-part');
        let elPct = document.getElementById('rp-pct');
        let elAns = document.getElementById('rp-ans');

        let vPart = parseFloat(elPart.value);
        let vPct = parseFloat(elPct.value);
        let vAns = parseFloat(elAns.value);

        // Reset borders
        [elPart, elPct, elAns].forEach(el => { el.style.borderColor = "#94a3b8"; el.style.backgroundColor = "white"; });

        // Check Setup: Part
        if (vPart === rpData.valPart) {
            elPart.style.borderColor = "#22c55e"; 
        } else {
            allCorrect = false;
            elPart.style.borderColor = "#ef4444"; elPart.style.backgroundColor = "#fee2e2";
            if (vPart === rpData.valPct) {
                hintMsg += "• Careful! You put the percentage in the 'Part' box.<br>";
            } else {
                hintMsg += "• Look at the problem to find the length of the smaller model. That is your 'Part'.<br>";
            }
        }

        // Check Setup: Percent
        if (vPct === rpData.valPct) {
            elPct.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elPct.style.borderColor = "#ef4444"; elPct.style.backgroundColor = "#fee2e2";
            if (vPct === rpData.valPart) {
                hintMsg += "• Careful! You put the model's length in the '%' box.<br>";
            } else {
                hintMsg += "• The percent always goes over 100 in the equivalent proportion.<br>";
            }
        }

        // Check Final Answer
        if (vAns === rpData.valWhole) {
            elAns.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elAns.style.borderColor = "#ef4444"; elAns.style.backgroundColor = "#fee2e2";
            if (vPart === rpData.valPart && vPct === rpData.valPct) {
                hintMsg += "• Your setup is perfect! To solve for x, figure out what you multiply the top percent by to get the Part, then multiply 100 by that same number.<br>";
            }
        }

        if (allCorrect) {
            document.getElementById('rp-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showRpFlash("✅ Great job finding the total!", "success");

            rpRound++;
            setTimeout(() => {
                if (rpRound > totalRpRounds) finishRpGame();
                else startRpRound();
            }, 2000);
        } else {
            errorsThisRound++;
            showRpFlash(hintMsg, "error");
        }
    };

    function finishRpGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">⚾</div>
                <h2 style="color:#1e293b; margin:10px 0;">Reverse Percents Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
            </div>
        `;

        let adj = sessionCorrectFirstTry >= totalRpRounds ? 1 : (sessionCorrectFirstTry <= 1 ? -1 : 0);
        if (adj !== 0 && window.supabaseClient && window.currentUser) {
            const newMain = Math.max(0, Math.min(10, (window.userMastery.ReversePercent || 0) + adj));
            window.supabaseClient.from('assignment7')
                .update({ 'ReversePercent': newMain })
                .eq('userName', window.currentUser)
                .eq('hour', sessionStorage.getItem('target_hour') || "00")
                .then(() => { setTimeout(window.loadNextQuestion, 2000); });
        } else { 
            setTimeout(window.loadNextQuestion, 2000); 
        }
    }

    function showRpFlash(msg, type) {
        const overlay = document.getElementById('rp-flash');
        overlay.innerHTML = msg; 
        overlay.style.display = 'block'; 
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 5000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
