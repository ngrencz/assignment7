/**
 * skill_process5d.js
 * - 7th Grade: The 5-D Process (Area of a Rectangle)
 * - Generates a rectangle with an algebraic relationship (x and x+c, or x and cx).
 * - Forces the student to use a Trial-and-Error table with strict math validation.
 */

console.log("🚀 skill_process5d.js is LIVE - 5-D Process Table");

(function() {
    let p5Data = {};
    let p5Round = 1;
    const totalP5Rounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initProcess5DGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        p5Round = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('Process5D')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[Process5D] Fetch error:", error);
                if (data) window.userMastery.Process5D = data.Process5D || 0;
            }
        } catch (e) { 
            console.error("[Process5D] Init error:", e); 
        }
        
        startP5Round();
    };

    function startP5Round() {
        errorsThisRound = 0;
        generateP5Problem();
        renderP5UI();
    }

    function generateP5Problem() {
        let mastery = window.userMastery.Process5D || 0;
        
        // Progression: 
        // Levels 0-4: Just addition (x and x + c)
        // Levels 5+: Mix of addition and multiplication (x and 3x)
        let type = 'add';
        if (mastery >= 5 && Math.random() > 0.5) {
            type = 'mult';
        }

        let x = Math.floor(Math.random() * 8) + 4; // x is between 4 and 11
        let c, y, exprText;

        if (type === 'add') {
            c = Math.floor(Math.random() * 8) + 2; // 2 to 9
            y = x + c;
            exprText = `x + ${c}`;
        } else {
            c = Math.floor(Math.random() * 3) + 2; // 2 or 3
            y = x * c;
            exprText = `${c}x`;
        }

        let targetArea = x * y;

        p5Data = {
            type: type,
            x: x,
            c: c,
            y: y,
            exprText: exprText,
            targetArea: targetArea
        };
    }

    function renderP5UI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `The 5-D Process (Round ${p5Round}/${totalP5Rounds})`;

        qContent.innerHTML = `
            <style>
                .t5d { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 15px; }
                .t5d th, .t5d td { border: 2px solid #cbd5e1; padding: 10px; text-align: center; }
                .t5d th { background: #f1f5f9; color: #1e293b; font-weight: bold; }
                .t5d-input { width: 60px; padding: 6px; text-align: center; font-size: 15px; border: 2px solid #94a3b8; border-radius: 4px; outline: none; }
                .t5d-select { padding: 6px; font-size: 14px; border: 2px solid #94a3b8; border-radius: 4px; outline: none; background: white; }
            </style>

            <div style="max-width: 700px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 20px;">
                    If the total area of the rectangle below is <strong>${p5Data.targetArea} square units</strong>, how long is each side? Use the 5-D Process table to guess and check your way to the answer.
                </p>

                <div style="display:flex; justify-content:center; align-items:center; margin-bottom:25px;">
                    <div style="position:relative; width:160px; height:100px; background:#94a3b8; border:3px solid #334155;">
                        <div style="position:absolute; top:-25px; left:50%; transform:translateX(-50%); font-weight:bold; font-style:italic;">${p5Data.exprText}</div>
                        <div style="position:absolute; left:-20px; top:50%; transform:translateY(-50%); font-weight:bold; font-style:italic;">x</div>
                    </div>
                </div>

                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; overflow-x: auto;">
                    <table class="t5d">
                        <tr>
                            <th colspan="2">Define</th>
                            <th>Do</th>
                            <th>Decide</th>
                        </tr>
                        <tr>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Side 1 (x)</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Side 2 (${p5Data.exprText})</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Area (S1 &middot; S2)</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Target = ${p5Data.targetArea}?</th>
                        </tr>
                        <tr>
                            <td><input type="number" id="t1-s1" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t1-s2" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t1-a" class="t5d-input" placeholder="?"></td>
                            <td>
                                <select id="t1-dec" class="t5d-select">
                                    <option value="">-- Select --</option>
                                    <option value="low">Too Low</option>
                                    <option value="high">Too High</option>
                                    <option value="correct">Correct!</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><input type="number" id="t2-s1" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t2-s2" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t2-a" class="t5d-input" placeholder="?"></td>
                            <td>
                                <select id="t2-dec" class="t5d-select">
                                    <option value="">-- Select --</option>
                                    <option value="low">Too Low</option>
                                    <option value="high">Too High</option>
                                    <option value="correct">Correct!</option>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; display:flex; flex-direction:column; align-items:center;">
                    <span style="font-size:16px; font-weight:bold; color:#1e293b; margin-bottom:10px;">Declare:</span>
                    <div style="display:flex; gap:10px; align-items:center; font-size:16px;">
                        The sides of the rectangle are 
                        <input type="number" id="ans-1" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        and
                        <input type="number" id="ans-2" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                    </div>
                </div>

                <button onclick="checkProcess5D()" id="p5-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>
            <div id="p5-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('t1-s1')?.focus(); }, 100);
    }

    // Helper to evaluate the relationship rule
    function calcRule(xGuess) {
        if (p5Data.type === 'add') return xGuess + p5Data.c;
        return xGuess * p5Data.c;
    }

    window.checkProcess5D = function() {
        let hintMsg = "❌ Check your work!<br><br>";
        let allCorrect = true;

        // 1. Check Final Declare Answers (Must be exact)
        const a1 = parseInt(document.getElementById('ans-1').value);
        const a2 = parseInt(document.getElementById('ans-2').value);
        
        let finalCorrect = false;
        if (!isNaN(a1) && !isNaN(a2)) {
            if ((a1 === p5Data.x && a2 === p5Data.y) || (a1 === p5Data.y && a2 === p5Data.x)) {
                finalCorrect = true;
            }
        }

        document.getElementById('ans-1').style.borderColor = finalCorrect ? "#22c55e" : "#ef4444";
        document.getElementById('ans-2').style.borderColor = finalCorrect ? "#22c55e" : "#ef4444";

        if (!finalCorrect) {
            allCorrect = false;
            hintMsg += "• Your final side lengths do not create the correct area.<br>";
        }

        // 2. Validate Table Logic (They must show at least ONE mathematically valid trial row)
        let t1s1 = document.getElementById('t1-s1').value;
        let t2s1 = document.getElementById('t2-s1').value;
        
        if (t1s1 === "" && t2s1 === "") {
            allCorrect = false;
            hintMsg += "• The 5-D Process requires a table! Please fill out at least Trial 1.<br>";
            document.getElementById('t1-s1').style.borderColor = "#f59e0b";
        } else {
            // Validate whichever rows they filled out
            let validTrials = 0;
            
            [1, 2].forEach(rowNum => {
                let s1Str = document.getElementById(`t${rowNum}-s1`).value;
                if (s1Str !== "") {
                    let s1 = parseInt(s1Str);
                    let s2 = parseInt(document.getElementById(`t${rowNum}-s2`).value);
                    let a = parseInt(document.getElementById(`t${rowNum}-a`).value);
                    let dec = document.getElementById(`t${rowNum}-dec`).value;
                    
                    let rowGood = true;

                    // Check Side 2 Rule
                    if (s2 !== calcRule(s1)) {
                        rowGood = false;
                        hintMsg += `• Trial ${rowNum}: Side 2 doesn't follow the rule (${p5Data.exprText}).<br>`;
                        document.getElementById(`t${rowNum}-s2`).style.borderColor = "#ef4444";
                    } else {
                        document.getElementById(`t${rowNum}-s2`).style.borderColor = "#22c55e";
                    }

                    // Check Area Math
                    if (a !== s1 * s2) {
                        rowGood = false;
                        hintMsg += `• Trial ${rowNum}: Area must be Side 1 × Side 2.<br>`;
                        document.getElementById(`t${rowNum}-a`).style.borderColor = "#ef4444";
                    } else {
                        document.getElementById(`t${rowNum}-a`).style.borderColor = "#22c55e";
                    }

                    // Check Decide Logic
                    let actualArea = s1 * s2; // Calculate what it should be based on their inputs
                    let expectedDec = "";
                    if (!isNaN(actualArea)) {
                        if (actualArea < p5Data.targetArea) expectedDec = "low";
                        else if (actualArea > p5Data.targetArea) expectedDec = "high";
                        else expectedDec = "correct";
                        
                        if (dec !== expectedDec) {
                            rowGood = false;
                            hintMsg += `• Trial ${rowNum}: Your Decide column is incorrect for that Area.<br>`;
                            document.getElementById(`t${rowNum}-dec`).style.borderColor = "#ef4444";
                        } else {
                            document.getElementById(`t${rowNum}-dec`).style.borderColor = "#22c55e";
                        }
                    }

                    if (rowGood) validTrials++;
                }
            });

            if (validTrials === 0) {
                allCorrect = false;
                // Only show this specific message if they didn't already trigger a math error message
                if (hintMsg.indexOf("Trial") === -1) {
                    hintMsg += "• Your Trial rows contain math errors. Fix them to match the rules!<br>";
                }
            }
        }

        if (allCorrect) {
            document.getElementById('p5-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showP5Flash("✅ Excellent 5-D Logic!", "success");

            p5Round++;
            setTimeout(() => {
                if (p5Round > totalP5Rounds) finishP5Game();
                else startP5Round();
            }, 1800);

        } else {
            errorsThisRound++;
            showP5Flash(hintMsg, "error");
        }
    };

    function finishP5Game() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">📊</div>
                <h2 style="color:#1e293b; margin:10px 0;">5-D Process Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalP5Rounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['Process5D'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['Process5D'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'Process5D': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[Process5D] Update Error:", error); });
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

    function showP5Flash(msg, type) {
        const overlay = document.getElementById('p5-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 4000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
