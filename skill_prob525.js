/**
 * skill_prob525.js
 * - 7th Grade: Probability of More Than Two Events (Lesson 5.2.5)
 * - SINGLE ROUND ONLY: Interactive Tree Builder followed by sequential questions.
 * - Tracks primary skill (Prob525) and sub-skills (p3_total, p3_match, p3_diff, p3_fair)
 */

console.log("🚀 skill_prob525.js - Interactive Tree Builder is LIVE");

(function() {
    let p525Data = {
        step: 0, // 0-2: Tree Building, 3-6: Questions
        errorsInCurrentStep: 0,
        scenario: {},
        treeState: 0 // 0: Blank, 1: Level 1 drawn, 2: Level 2 drawn, 3: Full tree
    };

    window.initProb525Game = async function() {
        if (!document.getElementById('q-content')) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        p525Data.step = 0;
        p525Data.treeState = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const h = sessionStorage.getItem('target_hour') || "00";
                const { data } = await window.supabaseClient
                    .from('assignment7')
                    .select('Prob525, p3_total, p3_match, p3_diff, p3_fair')
                    .eq('userName', window.currentUser)
                    .eq('hour', h)
                    .maybeSingle();
                
                if (data) window.userMastery = { ...window.userMastery, ...data };
            }
        } catch (e) {
            console.warn("Prob525 DB sync error, falling back to local state.");
        }

        generateScenario();
        renderMainUI();
    };

    function generateScenario() {
        const scenarios = [
            {
                context: "Scott is designing new ice cream flavors at Crazy Creations. He must choose one item from each category:",
                c1Name: "Base Flavor", c1: ["Vanilla", "Chocolate"],
                c2Name: "Mix-In", c2: ["Hazelnuts", "Sprinkles", "Toffee"],
                c3Name: "Fruit Swirl", c3: ["Apricot", "Plum", "Berry", "Grape"]
            },
            {
                context: "Maya is buying a custom bicycle. She must choose one option from each category to build her bike:",
                c1Name: "Frame Style", c1: ["Mountain", "Road", "Cruiser"],
                c2Name: "Color", c2: ["Red", "Blue"],
                c3Name: "Accessory", c3: ["Basket", "Bell", "Lights"]
            },
            {
                context: "Jamal is ordering a lunch combo. He must choose one item from each menu category:",
                c1Name: "Main", c1: ["Burger", "Wrap"],
                c2Name: "Side", c2: ["Fries", "Chips", "Apple"],
                c3Name: "Drink", c3: ["Water", "Juice", "Milk"]
            }
        ];

        // Pick random scenario
        let s = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        let totalOutcomes = s.c1.length * s.c2.length * s.c3.length;
        
        // Pick random targets for questions
        let t1 = s.c1[Math.floor(Math.random() * s.c1.length)];
        let t2 = s.c2[Math.floor(Math.random() * s.c2.length)];
        let t3 = s.c3[Math.floor(Math.random() * s.c3.length)];
        let diffT1 = s.c1.find(x => x !== t1);

        p525Data.scenario = { ...s, totalOutcomes, t1, t2, t3, diffT1 };
    }

    function renderMainUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Lesson 5.2.5: Tree Diagrams`;

        let s = p525Data.scenario;
        let c1List = s.c1.join(', ');
        let c2List = s.c2.join(', ');
        let c3List = s.c3.join(', ');

        qContent.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; animation: fadeIn 0.5s;">
                <div style="background:white; padding:15px 20px; border-radius:12px; border:1px solid #cbd5e1; margin-bottom:15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <p style="font-size:16px; color:#1e293b; margin:0 0 10px 0;"><strong>Scenario:</strong> ${s.context}</p>
                    <table style="width:100%; border-collapse: collapse; text-align:center; font-size:14px;">
                        <tr>
                            <th style="border:1px solid #94a3b8; padding:8px; background:#f1f5f9; width:33%;">${s.c1Name}</th>
                            <th style="border:1px solid #94a3b8; padding:8px; background:#f1f5f9; width:33%;">${s.c2Name}</th>
                            <th style="border:1px solid #94a3b8; padding:8px; background:#f1f5f9; width:33%;">${s.c3Name}</th>
                        </tr>
                        <tr>
                            <td style="border:1px solid #94a3b8; padding:8px;">${c1List}</td>
                            <td style="border:1px solid #94a3b8; padding:8px;">${c2List}</td>
                            <td style="border:1px solid #94a3b8; padding:8px;">${c3List}</td>
                        </tr>
                    </table>
                </div>

                <div style="display:flex; gap:20px; align-items:flex-start;">
                    <div style="flex: 1.5; background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px; text-align:center;">
                        <canvas id="treeCanvas" width="450" height="400" style="max-width:100%; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;"></canvas>
                    </div>

                    <div id="interaction-panel" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px;">
                        </div>
                </div>
            </div>
        `;

        drawTree();
        loadStepUI();
    }

    function loadStepUI() {
        const panel = document.getElementById('interaction-panel');
        let s = p525Data.scenario;
        let html = ``;

        p525Data.errorsInCurrentStep = 0; // Reset errors for this step

        if (p525Data.step === 0) {
            html = `
                <h3 style="margin-top:0; color:#2563eb;">Step 1: Build the Tree</h3>
                <p style="font-size:14px;">Let's start the probability tree. How many branches should come off the starting point for the <strong>${s.c1Name}</strong>?</p>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="ans-input" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #cbd5e1; border-radius:6px;">
                    <button onclick="checkStep()" style="background:#2563eb; color:white; border:none; border-radius:6px; padding:0 15px; font-weight:bold; cursor:pointer;">Draw</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 1) {
            html = `
                <h3 style="margin-top:0; color:#2563eb;">Step 2: Expand</h3>
                <p style="font-size:14px;">Now for the second category. How many branches should come off of EACH ${s.c1Name} for the <strong>${s.c2Name}</strong>?</p>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="ans-input" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #cbd5e1; border-radius:6px;">
                    <button onclick="checkStep()" style="background:#2563eb; color:white; border:none; border-radius:6px; padding:0 15px; font-weight:bold; cursor:pointer;">Draw</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 2) {
            html = `
                <h3 style="margin-top:0; color:#2563eb;">Step 3: Final Branches</h3>
                <p style="font-size:14px;">Finally, how many branches should come off of EACH ${s.c2Name} for the <strong>${s.c3Name}</strong>?</p>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="ans-input" style="width:60px; padding:8px; text-align:center; font-size:16px; border:2px solid #cbd5e1; border-radius:6px;">
                    <button onclick="checkStep()" style="background:#2563eb; color:white; border:none; border-radius:6px; padding:0 15px; font-weight:bold; cursor:pointer;">Draw</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 3) {
            html = `
                <h3 style="margin-top:0; color:#10b981;">Question A</h3>
                <p style="font-size:14px;">Look at the ends of your completed tree. How many <strong>total combinations</strong> are possible?</p>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="ans-input" style="width:70px; padding:8px; text-align:center; font-size:16px; border:2px solid #cbd5e1; border-radius:6px;">
                    <button onclick="checkStep()" style="background:#10b981; color:white; border:none; border-radius:6px; padding:0 15px; font-weight:bold; cursor:pointer;">Submit</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 4) {
            html = `
                <h3 style="margin-top:0; color:#10b981;">Question B</h3>
                <p style="font-size:14px;">What is the probability of randomly creating exactly <strong>${s.t1} + ${s.t2} + ${s.t3}</strong>?</p>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="display:flex; flex-direction:column; width:50px;">
                        <input type="number" id="ans-num" style="text-align:center; padding:5px; border:2px solid #cbd5e1; border-radius:4px;">
                        <div style="height:2px; background:#1e293b; margin:2px 0;"></div>
                        <input type="number" id="ans-den" style="text-align:center; padding:5px; border:2px solid #cbd5e1; border-radius:4px;">
                    </div>
                    <button onclick="checkStep()" style="background:#10b981; color:white; border:none; border-radius:6px; padding:15px; font-weight:bold; cursor:pointer;">Submit</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 5) {
            // How many paths start with t1? It's c2.length * c3.length
            html = `
                <h3 style="margin-top:0; color:#10b981;">Question C</h3>
                <p style="font-size:14px;">What is the probability of getting <strong>${s.t1}</strong> with ANY ${s.c2Name} and ANY ${s.c3Name}?</p>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="display:flex; flex-direction:column; width:50px;">
                        <input type="number" id="ans-num" style="text-align:center; padding:5px; border:2px solid #cbd5e1; border-radius:4px;">
                        <div style="height:2px; background:#1e293b; margin:2px 0;"></div>
                        <input type="number" id="ans-den" style="text-align:center; padding:5px; border:2px solid #cbd5e1; border-radius:4px;">
                    </div>
                    <button onclick="checkStep()" style="background:#10b981; color:white; border:none; border-radius:6px; padding:15px; font-weight:bold; cursor:pointer;">Submit</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 6) {
            html = `
                <h3 style="margin-top:0; color:#8b5cf6;">Question D (Evaluation)</h3>
                <p style="font-size:14px;">If a game says Player A wins if they get <strong>${s.t1}</strong>, and Player B wins if they get <strong>${s.diffT1}</strong>, is the game fair?</p>
                <div style="display:flex; gap:10px; margin-top: 10px;">
                    <button onclick="checkFairness('Yes')" style="flex:1; background:white; color:#1e293b; border:2px solid #cbd5e1; border-radius:6px; padding:10px; font-weight:bold; cursor:pointer;">Yes</button>
                    <button onclick="checkFairness('No')" style="flex:1; background:white; color:#1e293b; border:2px solid #cbd5e1; border-radius:6px; padding:10px; font-weight:bold; cursor:pointer;">No</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        }

        panel.innerHTML = html;
        if(document.getElementById('ans-input')) document.getElementById('ans-input').focus();
    }

    // --- Dynamic Tree Drawing Algorithm ---
    function drawTree() {
        const canvas = document.getElementById('treeCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let s = p525Data.scenario;
        let state = p525Data.treeState; // 0, 1, 2, or 3

        const startX = 20;
        const xOffsets = [startX, 120, 260, 400];
        const h = canvas.height;

        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        // Root Node (Invisible, just a start point)
        let rootNode = { x: startX, y: h / 2 };

        if (state >= 1) {
            let l1Nodes = [];
            let yGap1 = h / s.c1.length;
            for (let i = 0; i < s.c1.length; i++) {
                let y = (yGap1 * i) + (yGap1 / 2);
                let x = xOffsets[1];
                l1Nodes.push({x, y});
                
                // Draw Line
                ctx.beginPath(); ctx.moveTo(rootNode.x, rootNode.y); ctx.lineTo(x - 15, y); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                // Draw Text (Initial)
                ctx.fillStyle = "#1e293b"; ctx.fillText(s.c1[i].charAt(0), x, y);
            }

            if (state >= 2) {
                let l2Nodes = [];
                let yGap2 = h / (s.c1.length * s.c2.length);
                let count2 = 0;
                
                for (let i = 0; i < s.c1.length; i++) {
                    for (let j = 0; j < s.c2.length; j++) {
                        let y = (yGap2 * count2) + (yGap2 / 2);
                        let x = xOffsets[2];
                        l2Nodes.push({x, y});
                        
                        // Line from parent
                        ctx.beginPath(); ctx.moveTo(l1Nodes[i].x + 10, l1Nodes[i].y); ctx.lineTo(x - 15, y); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                        ctx.fillStyle = "#1e293b"; ctx.fillText(s.c2[j].charAt(0), x, y);
                        count2++;
                    }
                }

                if (state >= 3) {
                    let yGap3 = h / s.totalOutcomes;
                    let count3 = 0;
                    for (let i = 0; i < l2Nodes.length; i++) {
                        for (let k = 0; k < s.c3.length; k++) {
                            let y = (yGap3 * count3) + (yGap3 / 2);
                            let x = xOffsets[3];
                            
                            // Line from parent
                            ctx.beginPath(); ctx.moveTo(l2Nodes[i].x + 10, l2Nodes[i].y); ctx.lineTo(x - 15, y); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                            ctx.fillStyle = "#1e293b"; ctx.fillText(s.c3[k].charAt(0), x, y);
                            count3++;
                        }
                    }
                }
            }
        }
    }

    // --- Step Checking Logic ---
    window.checkStep = function() {
        let s = p525Data.scenario;
        let step = p525Data.step;
        let feedback = document.getElementById('step-feedback');
        let isCorrect = false;
        let dbSubSkill = null;

        if (step <= 3) {
            let val = parseInt(document.getElementById('ans-input').value);
            if (isNaN(val)) return;

            if (step === 0 && val === s.c1.length) isCorrect = true;
            if (step === 1 && val === s.c2.length) isCorrect = true;
            if (step === 2 && val === s.c3.length) isCorrect = true;
            if (step === 3 && val === s.totalOutcomes) { isCorrect = true; dbSubSkill = 'p3_total'; }
        } else {
            let num = parseInt(document.getElementById('ans-num').value);
            let den = parseInt(document.getElementById('ans-den').value);
            if (isNaN(num) || isNaN(den) || den === 0) return;

            let targetNum, targetDen = s.totalOutcomes;
            if (step === 4) { // Specific Match (1 path)
                targetNum = 1;
                dbSubSkill = 'p3_match';
                if (num * targetDen === targetNum * den) isCorrect = true; // Cross-multiplication
            } else if (step === 5) { // Broad Match (c2 * c3 paths)
                targetNum = s.c2.length * s.c3.length;
                dbSubSkill = 'p3_diff';
                if (num * targetDen === targetNum * den) isCorrect = true;
            }
        }

        handleStepResult(isCorrect, feedback, dbSubSkill);
    };

    window.checkFairness = function(answer) {
        let feedback = document.getElementById('step-feedback');
        // Because both Player A and Player B have exactly 1 base flavor assigned, their branch counts are equal. Yes, it's fair.
        let isCorrect = (answer === 'Yes'); 
        handleStepResult(isCorrect, feedback, 'p3_fair');
    };

    function handleStepResult(isCorrect, feedback, dbSubSkill) {
        if (isCorrect) {
            feedback.style.color = "#16a34a";
            feedback.innerText = "✅ Correct!";
            
            // Advance Tree visually if in building phase
            if (p525Data.step < 3) p525Data.treeState++;
            drawTree();

            // Handle DB Subskill update
            if (dbSubSkill && p525Data.errorsInCurrentStep === 0) {
                let current = window.userMastery[dbSubSkill] || 0;
                let newVal = Math.min(10, current + 1);
                window.userMastery[dbSubSkill] = newVal;
                
                if (window.supabaseClient && window.currentUser) {
                    const h = sessionStorage.getItem('target_hour') || "00";
                    window.supabaseClient.from('assignment7').update({ [dbSubSkill]: newVal })
                        .eq('userName', window.currentUser).eq('hour', h)
                        .then(({error}) => { if(error) console.error("DB error:", error); });
                }
            }

            p525Data.step++;
            
            setTimeout(() => {
                if (p525Data.step > 6) {
                    finishP525Game();
                } else {
                    loadStepUI();
                }
            }, 800);

        } else {
            p525Data.errorsInCurrentStep++;
            feedback.style.color = "#dc2626";
            if (p525Data.step <= 2) feedback.innerText = "❌ Look at the table above and count the options for that category!";
            else feedback.innerText = "❌ Not quite. Count the branches carefully!";
        }
    }

    function finishP525Game() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🌳</div>
                <h2 style="color:#1e293b; margin:0 0 10px 0;">Tree Builder Complete!</h2>
                <p style="color:#64748b; font-size:16px;">Saving progress...</p>
            </div>
        `;

        // Update Main Skill
        let curMain = window.userMastery.Prob525 || 0;
        let newMain = Math.min(10, curMain + 1);
        window.userMastery.Prob525 = newMain;

        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            window.supabaseClient.from('assignment7').update({ Prob525: newMain })
                .eq('userName', window.currentUser).eq('hour', h)
                .then(({error}) => { if(error) console.error("DB error:", error); });
        }

        setTimeout(() => { 
            if (typeof window.loadNextQuestion === 'function') {
                window.loadNextQuestion(); 
            } else {
                location.reload(); 
            }
        }, 2500);
    }
})();
