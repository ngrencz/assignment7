/**
 * skill_prob525.js
 * - 7th Grade: Probability of More Than Two Events (Lesson 5.2.5)
 * - SINGLE ROUND: Interactive Tree Builder followed by sequential questions.
 * - NEW: Massively dynamic scenario generator for infinite replayability.
 * - Tracks primary skill (Prob525) and sub-skills (p3_total, p3_match, p3_diff, p3_fair)
 */

console.log("🚀 skill_prob525.js - Dynamic Tree Builder is LIVE");

(function() {
    let p525Data = {
        step: 0, 
        errorsInCurrentStep: 0,
        scenario: {},
        treeState: 0 
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
        // Massive template bank for infinite replayability
        const templates = [
            {
                context: "[Name] is designing a new ice cream treat. They must choose one item from each category:",
                c1Name: "Base", c1Items: ["Vanilla", "Chocolate", "Strawberry", "Mint"],
                c2Name: "Mix-In", c2Items: ["Hazelnuts", "Sprinkles", "Toffee", "Fudge", "Cookie Dough"],
                c3Name: "Swirl", c3Items: ["Apricot", "Plum", "Berry", "Grape", "Caramel"]
            },
            {
                context: "[Name] is ordering a lunch combo. They must choose one item from each menu category:",
                c1Name: "Main", c1Items: ["Burger", "Wrap", "Sandwich", "Salad", "Tacos"],
                c2Name: "Side", c2Items: ["Fries", "Chips", "Apple", "Soup"],
                c3Name: "Drink", c3Items: ["Water", "Juice", "Milk", "Soda", "Tea"]
            },
            {
                context: "[Name] is building a custom bicycle. They must choose one option from each category:",
                c1Name: "Frame", c1Items: ["Mountain", "Road", "Cruiser", "BMX"],
                c2Name: "Color", c2Items: ["Red", "Blue", "Black", "Green", "Silver"],
                c3Name: "Accessory", c3Items: ["Basket", "Bell", "Lights", "Pegs"]
            },
            {
                context: "[Name] is packing a backpack for a hiking trip. They must choose one of each:",
                c1Name: "Snack", c1Items: ["Trail Mix", "Granola", "Jerky", "Apple"],
                c2Name: "Drink", c2Items: ["Water", "Sports Drink", "Juice", "Tea"],
                c3Name: "Gear", c3Items: ["Compass", "Map", "Flashlight", "Binoculars"]
            },
            {
                context: "[Name] is setting up a new video game character. They must pick one of each:",
                c1Name: "Class", c1Items: ["Mage", "Warrior", "Rogue", "Archer"],
                c2Name: "Weapon", c2Items: ["Sword", "Bow", "Staff", "Dagger"],
                c3Name: "Pet", c3Items: ["Wolf", "Dragon", "Hawk", "Bear"]
            }
        ];

        const names = ["Scott", "Maya", "Jamal", "Chloe", "Sam", "Olivia", "Marcus", "Elena", "Jordan", "Alex"];
        
        let t = templates[Math.floor(Math.random() * templates.length)];
        let name = names[Math.floor(Math.random() * names.length)];
        
        // Randomly slice the item lists so the lengths are always different (between 2 and 4)
        let l1 = Math.floor(Math.random() * 2) + 2; 
        let l2 = Math.floor(Math.random() * 2) + 2; 
        let l3 = Math.floor(Math.random() * 2) + 2;
        // Occasional chance for a longer list if it won't crash the canvas height
        if (l1 * l2 * l3 < 16 && Math.random() > 0.5) l3++; 

        let c1 = [...t.c1Items].sort(() => 0.5 - Math.random()).slice(0, l1);
        let c2 = [...t.c2Items].sort(() => 0.5 - Math.random()).slice(0, l2);
        let c3 = [...t.c3Items].sort(() => 0.5 - Math.random()).slice(0, l3);

        let totalOutcomes = l1 * l2 * l3;
        
        // Pick targets for questions
        let t1 = c1[Math.floor(Math.random() * c1.length)];
        let t2 = c2[Math.floor(Math.random() * c2.length)];
        let t3 = c3[Math.floor(Math.random() * c3.length)];

        // Dynamic Fairness Generation
        let pB_Item;
        let pB_Length;
        let r = Math.random();
        
        // Player B might pick a winning condition from any of the three categories
        if (r < 0.33) {
            let remain = c1.filter(x => x !== t1);
            pB_Item = remain[Math.floor(Math.random() * remain.length)];
            pB_Length = l1;
        } else if (r < 0.66) {
            pB_Item = t2;
            pB_Length = l2;
        } else {
            pB_Item = t3;
            pB_Length = l3;
        }

        // It is only fair if Player B's category has the exact same number of options as Player A's category
        let isFair = (l1 === pB_Length) ? 'Yes' : 'No';

        let context = t.context.replace('[Name]', name);

        p525Data.scenario = {
            context,
            c1Name: t.c1Name, c1,
            c2Name: t.c2Name, c2,
            c3Name: t.c3Name, c3,
            totalOutcomes, t1, t2, t3,
            pB_Item, isFair, pB_Length
        };
    }

    function renderMainUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Lesson 5.2.5: Tree Diagrams`;

        let s = p525Data.scenario;
        let c1List = s.c1.join(', ');
        let c2List = s.c2.join(', ');
        let c3List = s.c3.join(', ');

        // Dynamically scale canvas height so massive trees don't get squished
        let canvasHeight = Math.max(400, s.totalOutcomes * 22);

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 850px; margin: 0 auto; animation: fadeIn 0.5s;">
                <div style="background:white; padding:15px 20px; border-radius:12px; border:1px solid #cbd5e1; margin-bottom:15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <p style="font-size:16px; color:#1e293b; margin:0 0 10px 0;"><strong>Scenario:</strong> ${s.context}</p>
                    <table style="width:100%; border-collapse: collapse; text-align:center; font-size:14px;">
                        <tr>
                            <th style="border:1px solid #94a3b8; padding:8px; background:#f1f5f9; width:33%;">${s.c1Name} (${s.c1.length})</th>
                            <th style="border:1px solid #94a3b8; padding:8px; background:#f1f5f9; width:33%;">${s.c2Name} (${s.c2.length})</th>
                            <th style="border:1px solid #94a3b8; padding:8px; background:#f1f5f9; width:33%;">${s.c3Name} (${s.c3.length})</th>
                        </tr>
                        <tr>
                            <td style="border:1px solid #94a3b8; padding:8px;">${c1List}</td>
                            <td style="border:1px solid #94a3b8; padding:8px;">${c2List}</td>
                            <td style="border:1px solid #94a3b8; padding:8px;">${c3List}</td>
                        </tr>
                    </table>
                </div>

                <div style="display:flex; gap:20px; align-items:flex-start;">
                    <div style="flex: 1.5; background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px; text-align:center; max-height: 500px; overflow-y: auto;">
                        <canvas id="treeCanvas" width="450" height="${canvasHeight}" style="max-width:100%; background:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1;"></canvas>
                    </div>

                    <div id="interaction-panel" style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; position: sticky; top: 20px;">
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

        p525Data.errorsInCurrentStep = 0; 

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
                <p style="font-size:14px;">Look at the right edge of your completed tree. How many <strong>total combinations</strong> are possible?</p>
                <div style="display:flex; gap:10px;">
                    <input type="number" id="ans-input" style="width:70px; padding:8px; text-align:center; font-size:16px; border:2px solid #cbd5e1; border-radius:6px;">
                    <button onclick="checkStep()" style="background:#10b981; color:white; border:none; border-radius:6px; padding:0 15px; font-weight:bold; cursor:pointer;">Submit</button>
                </div>
                <div id="step-feedback" style="margin-top:10px; font-weight:bold; font-size:14px;"></div>
            `;
        } else if (p525Data.step === 4) {
            html = `
                <h3 style="margin-top:0; color:#10b981;">Question B</h3>
                <p style="font-size:14px;">What is the probability of randomly creating the exact combination: <strong>${s.t1} + ${s.t2} + ${s.t3}</strong>?</p>
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
                <p style="font-size:14px;">A game says Player A wins if they get <strong>${s.t1}</strong>, and Player B wins if they get <strong>${s.pB_Item}</strong>. Is the game fair?</p>
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
        let state = p525Data.treeState; 

        const startX = 20;
        const xOffsets = [startX, 120, 260, 400];
        const h = canvas.height;

        ctx.font = "bold 14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        let rootNode = { x: startX, y: h / 2 };

        if (state >= 1) {
            let l1Nodes = [];
            let yGap1 = h / s.c1.length;
            for (let i = 0; i < s.c1.length; i++) {
                let y = (yGap1 * i) + (yGap1 / 2);
                let x = xOffsets[1];
                l1Nodes.push({x, y});
                
                ctx.beginPath(); ctx.moveTo(rootNode.x, rootNode.y); ctx.lineTo(x - 15, y); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                ctx.fillStyle = "#1e293b"; ctx.fillText(s.c1[i].substring(0, 3) + ".", x, y);
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
                        
                        ctx.beginPath(); ctx.moveTo(l1Nodes[i].x + 20, l1Nodes[i].y); ctx.lineTo(x - 15, y); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                        ctx.fillStyle = "#1e293b"; ctx.fillText(s.c2[j].substring(0, 3) + ".", x, y);
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
                            
                            ctx.beginPath(); ctx.moveTo(l2Nodes[i].x + 20, l2Nodes[i].y); ctx.lineTo(x - 15, y); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
                            ctx.fillStyle = "#1e293b"; ctx.fillText(s.c3[k].substring(0, 3) + ".", x, y);
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
        let errorHint = "";

        if (step <= 3) {
            let val = parseInt(document.getElementById('ans-input').value);
            if (isNaN(val)) return;

            if (step === 0) { if (val === s.c1.length) isCorrect = true; else errorHint = `Count the items in the ${s.c1Name} list above!`; }
            if (step === 1) { if (val === s.c2.length) isCorrect = true; else errorHint = `Count the items in the ${s.c2Name} list above!`; }
            if (step === 2) { if (val === s.c3.length) isCorrect = true; else errorHint = `Count the items in the ${s.c3Name} list above!`; }
            if (step === 3) { 
                if (val === s.totalOutcomes) { isCorrect = true; dbSubSkill = 'p3_total'; }
                else errorHint = `Multiply the choices together (${s.c1.length} × ${s.c2.length} × ${s.c3.length}) or count the right edge.`;
            }
        } else {
            let num = parseInt(document.getElementById('ans-num').value);
            let den = parseInt(document.getElementById('ans-den').value);
            if (isNaN(num) || isNaN(den) || den === 0) return;

            let targetNum, targetDen = s.totalOutcomes;
            if (step === 4) { 
                targetNum = 1;
                dbSubSkill = 'p3_match';
                if (num * targetDen === targetNum * den) isCorrect = true; 
                else errorHint = `That specific exact combination only appears exactly 1 time in the whole tree!`;
            } else if (step === 5) { 
                targetNum = s.c2.length * s.c3.length;
                dbSubSkill = 'p3_diff';
                if (num * targetDen === targetNum * den) isCorrect = true;
                else errorHint = `How many branches originate from ${s.t1}? Count them all!`;
            }
        }

        handleStepResult(isCorrect, feedback, dbSubSkill, errorHint);
    };

    window.checkFairness = function(answer) {
        let s = p525Data.scenario;
        let feedback = document.getElementById('step-feedback');
        let isCorrect = (answer === s.isFair); 
        
        let pABranches = s.totalOutcomes / s.c1.length;
        let pBBranches = s.totalOutcomes / s.pB_Length;
        let errorHint = `Compare their winning paths! Player A has ${pABranches} winning paths. Player B has ${pBBranches} winning paths.`;
        
        handleStepResult(isCorrect, feedback, 'p3_fair', errorHint);
    };

    function handleStepResult(isCorrect, feedback, dbSubSkill, errorHint) {
        if (isCorrect) {
            feedback.style.color = "#16a34a";
            feedback.innerText = "✅ Correct!";
            
            if (p525Data.step < 3) p525Data.treeState++;
            drawTree();

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
            feedback.innerText = `❌ Not quite. ${errorHint}`;
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
