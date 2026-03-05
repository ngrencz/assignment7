/**
 * skill_compareprob.js
 * - 7th Grade: Comparing Probabilities from Word Problems
 * - Generates two-group scenarios (e.g., two schools, two crowds).
 * - Requires students to extract the probability for each group and compare them.
 * - Accepts both unsimplified and simplified equivalent fractions.
 */

console.log("🚀 skill_compareprob.js is LIVE - Comparing Probabilities");

(function() {
    let cpData = {};
    let cpRound = 1;
    const totalCpRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initCompareProbGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        cpRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('CompareProb')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[CompareProb] Fetch error:", error);
                if (data) window.userMastery.CompareProb = data.CompareProb || 0;
            }
        } catch (e) { 
            console.error("[CompareProb] Init error:", e); 
        }
        
        startCpRound();
    };

    function startCpRound() {
        errorsThisRound = 0;
        generateCpProblem();
        renderCpUI();
    }

    function generateCpProblem() {
        const scenarios = [
            {
                intro: "A radio station is giving away free t-shirts to students in local schools.",
                groupA: "Big Sky Middle School",
                groupB: "High Peaks High School",
                item: "shirts",
                member: "student"
            },
            {
                intro: "A local sports team is randomly selecting fans to win backstage passes.",
                groupA: "the East Bleachers",
                groupB: "the West Bleachers",
                item: "passes",
                member: "fan"
            },
            {
                intro: "A bakery is holding a raffle to give away free giant cookies.",
                groupA: "the morning crowd",
                groupB: "the afternoon crowd",
                item: "winning tickets",
                member: "customer"
            },
            {
                intro: "A tech company is giving away free tablets at two different conventions.",
                groupA: "the Gaming Expo",
                groupB: "the Coding Summit",
                item: "tablets",
                member: "attendee"
            }
        ];
        
        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        // Generate realistic numbers that don't result in the exact same probability
        let winA, totalA, winB, totalB, probA, probB;
        do {
            totalA = (Math.floor(Math.random() * 40) + 15) * 10; // 150 to 540
            winA = Math.floor(Math.random() * 40) + 10; // 10 to 49
            
            totalB = (Math.floor(Math.random() * 50) + 30) * 10; // 300 to 790
            winB = Math.floor(Math.random() * 60) + 20; // 20 to 79
            
            probA = winA / totalA;
            probB = winB / totalB;
        } while (probA === probB); // Ensure there is a clear "more likely" answer

        let moreLikely = probA > probB ? "A" : "B";

        cpData = {
            scenario: s,
            winA: winA,
            totalA: totalA,
            winB: winB,
            totalB: totalB,
            probA: probA,
            probB: probB,
            moreLikely: moreLikely,
            prompt: `${s.intro} They plan to give away <strong>${winA} ${s.item}</strong> to ${s.groupA} and <strong>${winB} ${s.item}</strong> to ${s.groupB}. There are <strong>${totalA}</strong> people at ${s.groupA}, and <strong>${totalB}</strong> people at ${s.groupB}.`
        };
    }

    function renderCpUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Comparing Probabilities (Round ${cpRound}/${totalCpRounds})`;

        let s = cpData.scenario;

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">
                    ${cpData.prompt}
                </p>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px;">
                    
                    <div style="margin-bottom: 25px;">
                        <span style="font-size: 15px; font-weight:bold; color:#1e293b; display:block; margin-bottom:10px;">
                            a. What is the probability of getting a ${s.item.replace(/s$/, '')} if you are a ${s.member} at ${s.groupA}?
                        </span>
                        <div style="display:flex; align-items:center; gap: 10px; margin-left: 15px;">
                            <span style="font-size:16px; color:#475569; font-style:italic;">P(${s.groupA}) = </span>
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                <input type="number" id="cp-numA" placeholder="?" style="width:70px; padding:6px; text-align:center; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;">
                                <div style="width:100%; height:2px; background:#1e293b;"></div>
                                <input type="number" id="cp-denA" placeholder="?" style="width:70px; padding:6px; text-align:center; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;">
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <span style="font-size: 15px; font-weight:bold; color:#1e293b; display:block; margin-bottom:10px;">
                            b. What is the probability of getting a ${s.item.replace(/s$/, '')} if you are a ${s.member} at ${s.groupB}?
                        </span>
                        <div style="display:flex; align-items:center; gap: 10px; margin-left: 15px;">
                            <span style="font-size:16px; color:#475569; font-style:italic;">P(${s.groupB}) = </span>
                            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                                <input type="number" id="cp-numB" placeholder="?" style="width:70px; padding:6px; text-align:center; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;">
                                <div style="width:100%; height:2px; background:#1e293b;"></div>
                                <input type="number" id="cp-denB" placeholder="?" style="width:70px; padding:6px; text-align:center; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;">
                            </div>
                        </div>
                    </div>

                    <div style="padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <span style="font-size: 15px; font-weight:bold; color:#1e293b; display:block; margin-bottom:10px;">
                            c. Are you more likely to win if you are a ${s.member} at ${s.groupA} or ${s.groupB}?
                        </span>
                        <select id="cp-decision" style="width:100%; padding:10px; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none; background:white; cursor:pointer;">
                            <option value="">-- Select the more likely group --</option>
                            <option value="A">${s.groupA}</option>
                            <option value="B">${s.groupB}</option>
                        </select>
                    </div>

                </div>

                <button onclick="checkCompareProb()" id="cp-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>
            <div id="cp-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:18px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('cp-numA')?.focus(); }, 100);
    }

    window.checkCompareProb = function() {
        let allCorrect = true;
        let hintMsg = "❌ Check your work!<br><br>";

        // Fetch inputs
        const elNumA = document.getElementById('cp-numA');
        const elDenA = document.getElementById('cp-denA');
        const elNumB = document.getElementById('cp-numB');
        const elDenB = document.getElementById('cp-denB');
        const elDec = document.getElementById('cp-decision');

        const nA = parseInt(elNumA.value);
        const dA = parseInt(elDenA.value);
        const nB = parseInt(elNumB.value);
        const dB = parseInt(elDenB.value);
        const dec = elDec.value;

        // 1. Check Prob A (Cross multiply to accept unsimplified fractions)
        let probACorrect = (!isNaN(nA) && !isNaN(dA) && dA !== 0 && (nA * cpData.totalA === cpData.winA * dA));
        elNumA.style.borderColor = probACorrect ? "#22c55e" : "#ef4444";
        elDenA.style.borderColor = probACorrect ? "#22c55e" : "#ef4444";
        if (!probACorrect) {
            allCorrect = false;
            hintMsg += `• Check part A. Probability is (Winners) / (Total People).<br>`;
        }

        // 2. Check Prob B
        let probBCorrect = (!isNaN(nB) && !isNaN(dB) && dB !== 0 && (nB * cpData.totalB === cpData.winB * dB));
        elNumB.style.borderColor = probBCorrect ? "#22c55e" : "#ef4444";
        elDenB.style.borderColor = probBCorrect ? "#22c55e" : "#ef4444";
        if (!probBCorrect) {
            allCorrect = false;
            hintMsg += `• Check part B. Double check the numbers for the second group.<br>`;
        }

        // 3. Check Decision
        let decCorrect = (dec === cpData.moreLikely);
        elDec.style.borderColor = decCorrect ? "#22c55e" : "#ef4444";
        if (!decCorrect) {
            allCorrect = false;
            if (dec === "") {
                hintMsg += `• Don't forget to select which group is more likely in part C!<br>`;
            } else if (probACorrect && probBCorrect) {
                // If they got the fractions right but guessed the wrong one, hint at how to compare
                hintMsg += `• Check part C. Hint: Try converting your two correct fractions into decimals or percentages to compare them!<br>`;
            } else {
                hintMsg += `• Your conclusion in part C is incorrect.<br>`;
            }
        }

        if (allCorrect) {
            document.getElementById('cp-check-btn').disabled = true;
            
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showCpFlash("✅ Great job analyzing the data!", "success");

            cpRound++;
            setTimeout(() => {
                if (cpRound > totalCpRounds) finishCpGame();
                else startCpRound();
            }, 1500);

        } else {
            errorsThisRound++;
            showCpFlash(hintMsg, "error");
        }
    };

    function finishCpGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">⚖️</div>
                <h2 style="color:#1e293b; margin:10px 0;">Comparisons Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalCpRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['CompareProb'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['CompareProb'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'CompareProb': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[CompareProb] Update Error:", error); });
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

    function showCpFlash(msg, type) {
        const overlay = document.getElementById('cp-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 4000;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
