/**
 * skill_process5d_sum.js
 * - 7th Grade: The 5-D Process (Summation & Two-Step Rules)
 * - Ties to Lesson 5.3.5
 * - Generates word problems where Group 2 is defined in terms of Group 1 (e.g., 2x + 6).
 * - Forces the student to use a Trial-and-Error table with strict addition validation.
 */

console.log("🚀 skill_process5d_sum.js is LIVE - 5-D Process (Sums)");

(function() {
    let p5sData = {};
    let p5sRound = 1;
    const totalP5sRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initProcess5DSumGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        p5sRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('Process5DSum')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[Process5DSum] Fetch error:", error);
                if (data) window.userMastery.Process5DSum = data.Process5DSum || 0;
            }
        } catch (e) { 
            console.error("[Process5DSum] Init error:", e); 
        }
        
        startP5sRound();
    };

    function startP5sRound() {
        errorsThisRound = 0;
        generateP5sProblem();
        renderP5sUI();
    }

    function generateP5sProblem() {
        const scenarios = [
            { g1: "6th graders", g2: "7th graders", totalName: "middle school students", loc: "at the summer camp" },
            { g1: "children", g2: "adults", totalName: "people", loc: "at the movie theater" },
            { g1: "dimes", g2: "quarters", totalName: "coins", loc: "in the jar" },
            { g1: "cats", g2: "dogs", totalName: "animals", loc: "at the rescue shelter" },
            { g1: "student tickets", g2: "adult tickets", totalName: "total tickets", loc: "sold for the play" }
        ];

        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Generate the underlying math
        let x = Math.floor(Math.random() * 30) + 15; // Group 1 value (15 to 44)
        let m = Math.floor(Math.random() * 2) + 2;   // Multiplier (2 or 3)
        let b = Math.floor(Math.random() * 20) - 5;  // Offset (-5 to 14)
        if (b === 0) b = 4; // Avoid exactly "twice as many" to force the two-step rule
        
        let g2Value = (m * x) + b;
        let targetTotal = x + g2Value;

        // Construct the word problem text
        let multText = m === 2 ? "twice" : "three times";
        let relationshipText = "";
        
        if (b > 0) {
            relationshipText = `${b} more than ${multText} the number of ${s.g1}`;
        } else {
            relationshipText = `${Math.abs(b)} less than ${multText} the number of ${s.g1}`;
        }

        let prompt = `The number of ${s.g2} ${s.loc} was ${relationshipText}. There were a total of <strong>${targetTotal}</strong> ${s.totalName} ${s.loc}. Use the 5-D Process to find the number of ${s.g1} and ${s.g2}.`;

        p5sData = {
            scenario: s,
            x: x,          // Group 1 correct answer
            m: m,          // Multiplier
            b: b,          // Offset
            g2: g2Value,   // Group 2 correct answer
            target: targetTotal,
            prompt: prompt,
            relText: relationshipText
        };
    }

    function renderP5sUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `The 5-D Process: Sums (Round ${p5sRound}/${totalP5sRounds})`;

        let s = p5sData.scenario;

        qContent.innerHTML = `
            <style>
                .t5d { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 15px; }
                .t5d th, .t5d td { border: 2px solid #cbd5e1; padding: 10px; text-align: center; }
                .t5d th { background: #f1f5f9; color: #1e293b; font-weight: bold; }
                .t5d-input { width: 65px; padding: 6px; text-align: center; font-size: 15px; border: 2px solid #94a3b8; border-radius: 4px; outline: none; }
                .t5d-select { padding: 6px; font-size: 14px; border: 2px solid #94a3b8; border-radius: 4px; outline: none; background: white; }
            </style>

            <div style="max-width: 750px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 20px;">
                    ${p5sData.prompt}
                </p>

                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; overflow-x: auto;">
                    <table class="t5d">
                        <tr>
                            <th colspan="2">Define</th>
                            <th>Do</th>
                            <th>Decide</th>
                        </tr>
                        <tr>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">${s.g1.charAt(0).toUpperCase() + s.g1.slice(1)} (Trial)</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">${s.g2.charAt(0).toUpperCase() + s.g2.slice(1)}<br><span style="font-weight:normal;">(${p5sData.relText})</span></th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Total (Sum)</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Target = ${p5sData.target}?</th>
                        </tr>
                        <tr>
                            <td><input type="number" id="t1-g1" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t1-g2" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t1-sum" class="t5d-input" placeholder="?"></td>
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
                            <td><input type="number" id="t2-g1" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t2-g2" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t2-sum" class="t5d-input" placeholder="?"></td>
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
                    <span style="font-size:16px; font-weight:bold; color:#1e293b; margin-bottom:15px;">Declare:</span>
                    <div style="display:flex; flex-wrap: wrap; justify-content:center; gap:15px; font-size:16px;">
                        <div>
                            <input type="number" id="ans-g1" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                            ${s.g1}
                        </div>
                        <span style="color:#94a3b8; font-weight:bold;">AND</span>
                        <div>
                            <input type="number" id="ans-g2" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                            ${s.g2}
                        </div>
                    </div>
                </div>

                <button onclick="checkProcess5DSum()" id="p5s-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>
            <div id="p5s-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('t1-g1')?.focus(); }, 100);
    }

    // Helper to evaluate the relationship rule for Group 2
    function calcG2Rule(guessG1) {
        return (guessG1 * p5sData.m) + p5sData.b;
    }

    window.checkProcess5DSum = function() {
        let hintMsg = "❌ Check your work!<br><br>";
        let allCorrect = true;

        // 1. Check Final Declare Answers (Must be exact and in the right boxes)
        const a1 = parseInt(document.getElementById('ans-g1').value);
        const a2 = parseInt(document.getElementById('ans-g2').value);
        
        let finalCorrect = (!isNaN(a1) && !isNaN(a2) && a1 === p5sData.x && a2 === p5sData.g2);

        document.getElementById('ans-g1').style.borderColor = finalCorrect ? "#22c55e" : "#ef4444";
        document.getElementById('ans-g2').style.borderColor = finalCorrect ? "#22c55e" : "#ef4444";

        if (!finalCorrect) {
            allCorrect = false;
            hintMsg += `• Your final answer does not add up to ${p5sData.target} or follow the rule.<br>`;
        }

        // 2. Validate Table Logic (They must show at least ONE mathematically valid trial row)
        let t1g1 = document.getElementById('t1-g1').value;
        let t2g1 = document.getElementById('t2-g1').value;
        
        if (t1g1 === "" && t2g1 === "") {
            allCorrect = false;
            hintMsg += "• The 5-D Process requires a table! Please fill out at least Trial 1.<br>";
            document.getElementById('t1-g1').style.borderColor = "#f59e0b";
        } else {
            let validTrials = 0;
            
            [1, 2].forEach(rowNum => {
                let g1Str = document.getElementById(`t${rowNum}-g1`).value;
                if (g1Str !== "") {
                    let g1 = parseInt(g1Str);
                    let g2 = parseInt(document.getElementById(`t${rowNum}-g2`).value);
                    let sum = parseInt(document.getElementById(`t${rowNum}-sum`).value);
                    let dec = document.getElementById(`t${rowNum}-dec`).value;
                    
                    let rowGood = true;

                    // Check Group 2 Rule Math
                    if (g2 !== calcG2Rule(g1)) {
                        rowGood = false;
                        hintMsg += `• Trial ${rowNum}: Group 2 does not follow the rule (${p5sData.relText}).<br>`;
                        document.getElementById(`t${rowNum}-g2`).style.borderColor = "#ef4444";
                    } else {
                        document.getElementById(`t${rowNum}-g2`).style.borderColor = "#22c55e";
                    }

                    // Check Sum Math (Do column)
                    if (sum !== g1 + g2) {
                        rowGood = false;
                        hintMsg += `• Trial ${rowNum}: The Total should be the sum of Group 1 + Group 2.<br>`;
                        document.getElementById(`t${rowNum}-sum`).style.borderColor = "#ef4444";
                    } else {
                        document.getElementById(`t${rowNum}-sum`).style.borderColor = "#22c55e";
                    }

                    // Check Decide Logic
                    let actualSum = g1 + g2; 
                    let expectedDec = "";
                    if (!isNaN(actualSum)) {
                        if (actualSum < p5sData.target) expectedDec = "low";
                        else if (actualSum > p5sData.target) expectedDec = "high";
                        else expectedDec = "correct";
                        
                        if (dec !== expectedDec) {
                            rowGood = false;
                            hintMsg += `• Trial ${rowNum}: Your Decide column is incorrect for a total of ${actualSum}.<br>`;
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
                if (hintMsg.indexOf("Trial") === -1) {
                    hintMsg += "• Your Trial rows contain math errors. Fix them to match the rules!<br>";
                }
            }
        }

        if (allCorrect) {
            document.getElementById('p5s-check-btn').disabled = true;
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showP5sFlash("✅ Flawless 5-D Logic!", "success");

            p5sRound++;
            setTimeout(() => {
                if (p5sRound > totalP5sRounds) finishP5sGame();
                else startP5sRound();
            }, 1800);

        } else {
            errorsThisRound++;
            showP5sFlash(hintMsg, "error");
        }
    };

    function finishP5sGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">➕</div>
                <h2 style="color:#1e293b; margin:10px 0;">Summation Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalP5sRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['Process5DSum'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['Process5DSum'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'Process5DSum': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[Process5DSum] Update Error:", error); });
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

    function showP5sFlash(msg, type) {
        const overlay = document.getElementById('p5s-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 4000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
