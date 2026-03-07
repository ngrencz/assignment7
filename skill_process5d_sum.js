/**
 * skill_process5d_sum.js
 * - 7th Grade: The 5-D Process (Summation & Multi-Group Rules)
 * - Ties to Lesson 5.3.5 and CL 5-150.
 * - Mastery < 5: Generates 2-group problems.
 * - Mastery >= 5: Unlocks 3-group problems (x, x+a, mx).
 * - Dynamically adjusts the table and validation based on the active scenario.
 */

console.log("🚀 skill_process5d_sum.js is LIVE - Adaptive Multi-Group 5-D");

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
        let mastery = window.userMastery.Process5DSum || 0;
        // Unlock 3-group problems at Level 5 (50% chance if unlocked)
        let isThreeGroups = (mastery >= 5 && Math.random() > 0.5);

        if (isThreeGroups) {
            const scenarios3 = [
                {
                    n1: "youngest child", n2: "oldest child", n3: "parent",
                    getPrompt: (a, m, total) => `A parent has two children. The oldest child is ${a} years older than the youngest child. The parent is ${m} times as old as the youngest child. The sum of their ages is ${total} years. Find all three ages.`
                },
                {
                    n1: "pennies", n2: "nickels", n3: "dimes",
                    getPrompt: (a, m, total) => `Evan has a jar of coins. He has ${a} more nickels than pennies. He has ${m} times as many dimes as pennies. He has ${total} coins in all. How many of each coin does he have?`
                },
                {
                    n1: "small cups", n2: "medium cups", n3: "large cups",
                    getPrompt: (a, m, total) => `A cafe sells three drink sizes. Today they sold ${a} more medium cups than small cups. They sold ${m} times as many large cups as small cups. They sold ${total} cups in total. Find the amounts for each size.`
                }
            ];

            let s = scenarios3[Math.floor(Math.random() * scenarios3.length)];
            
            let x = Math.floor(Math.random() * 8) + 4; // 4 to 11
            let a = Math.floor(Math.random() * 5) + 2; // +2 to +6
            let m3 = Math.floor(Math.random() * 3) + 3; // 3x to 5x
            
            let g2Value = x + a;
            let g3Value = x * m3;
            let targetTotal = x + g2Value + g3Value;

            p5sData = {
                numGroups: 3,
                names: [s.n1, s.n2, s.n3],
                x: x,
                a: a,          // Additive offset for Group 2
                m3: m3,        // Multiplier for Group 3
                g2: g2Value,
                g3: g3Value,
                target: targetTotal,
                prompt: s.getPrompt(a, m3, targetTotal),
                rel2Text: `${a} more than ${s.n1}`,
                rel3Text: `${m3} times as many as ${s.n1}`
            };

        } else {
            // Standard 2-Group logic
            const scenarios2 = [
                { n1: "6th graders", n2: "7th graders", totalName: "middle school students", loc: "at the camp" },
                { n1: "children", n2: "adults", totalName: "people", loc: "at the theater" },
                { n1: "cats", n2: "dogs", totalName: "animals", loc: "at the rescue shelter" }
            ];

            let s = scenarios2[Math.floor(Math.random() * scenarios2.length)];
            
            let x = Math.floor(Math.random() * 20) + 10; 
            let m = Math.floor(Math.random() * 2) + 2;   
            let b = Math.floor(Math.random() * 15) - 5;  
            if (b === 0) b = 4; 
            
            let g2Value = (m * x) + b;
            let targetTotal = x + g2Value;

            let multText = m === 2 ? "twice" : "three times";
            let relText = b > 0 ? `${b} more than ${multText}` : `${Math.abs(b)} less than ${multText}`;

            p5sData = {
                numGroups: 2,
                names: [s.n1, s.n2],
                x: x,
                m: m,          
                b: b,          
                g2: g2Value,   
                target: targetTotal,
                prompt: `The number of ${s.n2} ${s.loc} was ${relText} the number of ${s.n1}. There were a total of <strong>${targetTotal}</strong> ${s.totalName} ${s.loc}. Find the number of ${s.n1} and ${s.n2}.`,
                rel2Text: relText
            };
        }
    }

    function renderP5sUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `The 5-D Process: Sums (Round ${p5sRound}/${totalP5sRounds})`;

        let is3 = p5sData.numGroups === 3;
        let maxWidth = is3 ? "850px" : "750px"; // Expand width for extra column

        let g3Header = is3 ? `<th style="font-size:13px; font-style:italic; background:#f8fafc;">${capitalize(p5sData.names[2])}<br><span style="font-weight:normal;">(${p5sData.rel3Text})</span></th>` : '';
        let t1g3Input = is3 ? `<td><input type="number" id="t1-g3" class="t5d-input" placeholder="?"></td>` : '';
        let t2g3Input = is3 ? `<td><input type="number" id="t2-g3" class="t5d-input" placeholder="?"></td>` : '';
        
        let declareG3 = is3 ? `
            <span style="color:#94a3b8; font-weight:bold;">AND</span>
            <div>
                <input type="number" id="ans-g3" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                ${p5sData.names[2]}
            </div>
        ` : '';

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <style>
                .t5d { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
                .t5d th, .t5d td { border: 2px solid #cbd5e1; padding: 8px; text-align: center; }
                .t5d th { background: #f1f5f9; color: #1e293b; font-weight: bold; }
                .t5d-input { width: 65px; padding: 6px; text-align: center; font-size: 15px; border: 2px solid #94a3b8; border-radius: 4px; outline: none; }
                .t5d-select { padding: 6px; font-size: 14px; border: 2px solid #94a3b8; border-radius: 4px; outline: none; background: white; }
            </style>

            <div style="max-width: ${maxWidth}; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 20px;">
                    ${p5sData.prompt}
                </p>

                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; overflow-x: auto;">
                    <table class="t5d">
                        <tr>
                            <th colspan="${p5sData.numGroups}">Define</th>
                            <th>Do</th>
                            <th>Decide</th>
                        </tr>
                        <tr>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">${capitalize(p5sData.names[0])} (Trial)</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">${capitalize(p5sData.names[1])}<br><span style="font-weight:normal;">(${p5sData.rel2Text})</span></th>
                            ${g3Header}
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Total (Sum)</th>
                            <th style="font-size:13px; font-style:italic; background:#f8fafc;">Target = ${p5sData.target}?</th>
                        </tr>
                        <tr>
                            <td><input type="number" id="t1-g1" class="t5d-input" placeholder="?"></td>
                            <td><input type="number" id="t1-g2" class="t5d-input" placeholder="?"></td>
                            ${t1g3Input}
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
                            ${t2g3Input}
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
                    <div style="display:flex; flex-wrap: wrap; justify-content:center; align-items:center; gap:15px; font-size:16px;">
                        <div>
                            <input type="number" id="ans-g1" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                            ${p5sData.names[0]}
                        </div>
                        <span style="color:#94a3b8; font-weight:bold;">AND</span>
                        <div>
                            <input type="number" id="ans-g2" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                            ${p5sData.names[1]}
                        </div>
                        ${declareG3}
                    </div>
                </div>

                <button onclick="checkProcess5DSum()" id="p5s-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>
            <div id="p5s-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('t1-g1')?.focus(); }, 100);
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function calcG2Rule(g1) {
        if (p5sData.numGroups === 2) return (g1 * p5sData.m) + p5sData.b;
        else return g1 + p5sData.a;
    }

    function calcG3Rule(g1) {
        return g1 * p5sData.m3;
    }

    window.checkProcess5DSum = function() {
        let hintMsg = "❌ Check your work!<br><br>";
        let allCorrect = true;
        let is3 = p5sData.numGroups === 3;

        // 1. Check Final Declare Answers
        const a1 = parseInt(document.getElementById('ans-g1').value);
        const a2 = parseInt(document.getElementById('ans-g2').value);
        let finalCorrect = (!isNaN(a1) && !isNaN(a2) && a1 === p5sData.x && a2 === p5sData.g2);
        
        document.getElementById('ans-g1').style.borderColor = finalCorrect ? "#22c55e" : "#ef4444";
        document.getElementById('ans-g2').style.borderColor = finalCorrect ? "#22c55e" : "#ef4444";

        if (is3) {
            const a3 = parseInt(document.getElementById('ans-g3').value);
            let a3Correct = (!isNaN(a3) && a3 === p5sData.g3);
            document.getElementById('ans-g3').style.borderColor = a3Correct ? "#22c55e" : "#ef4444";
            finalCorrect = finalCorrect && a3Correct;
        }

        if (!finalCorrect) {
            allCorrect = false;
            hintMsg += `• Your final answers do not add up to ${p5sData.target} or follow the rules.<br>`;
        }

        // 2. Validate Table Logic
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
                    
                    let expectedSum = g1 + g2;
                    let rowGood = true;

                    // Group 2 Math
                    if (g2 !== calcG2Rule(g1)) {
                        rowGood = false;
                        hintMsg += `• Trial ${rowNum}: Group 2 does not follow the rule (${p5sData.rel2Text}).<br>`;
                        document.getElementById(`t${rowNum}-g2`).style.borderColor = "#ef4444";
                    } else {
                        document.getElementById(`t${rowNum}-g2`).style.borderColor = "#22c55e";
                    }

                    // Group 3 Math (if active)
                    if (is3) {
                        let g3 = parseInt(document.getElementById(`t${rowNum}-g3`).value);
                        expectedSum += g3;
                        if (g3 !== calcG3Rule(g1)) {
                            rowGood = false;
                            hintMsg += `• Trial ${rowNum}: Group 3 does not follow the rule (${p5sData.rel3Text}).<br>`;
                            document.getElementById(`t${rowNum}-g3`).style.borderColor = "#ef4444";
                        } else {
                            document.getElementById(`t${rowNum}-g3`).style.borderColor = "#22c55e";
                        }
                    }

                    // Sum Math
                    if (sum !== expectedSum) {
                        rowGood = false;
                        hintMsg += `• Trial ${rowNum}: The Total should be the sum of all groups.<br>`;
                        document.getElementById(`t${rowNum}-sum`).style.borderColor = "#ef4444";
                    } else {
                        document.getElementById(`t${rowNum}-sum`).style.borderColor = "#22c55e";
                    }

                    // Decide Logic
                    if (!isNaN(expectedSum)) {
                        let expectedDec = "";
                        if (expectedSum < p5sData.target) expectedDec = "low";
                        else if (expectedSum > p5sData.target) expectedDec = "high";
                        else expectedDec = "correct";
                        
                        if (dec !== expectedDec) {
                            rowGood = false;
                            hintMsg += `• Trial ${rowNum}: Your Decide column is incorrect for a total of ${expectedSum}.<br>`;
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
