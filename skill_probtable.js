/**
 * skill_probtable.js
 * - Primary skill for 5.2.4
 * - Generates combinations/sample space word problems.
 * - Draws a visual probability table grid.
 * - Asks for total combinations and simple probability.
 */

console.log("🚀 skill_probtable.js is LIVE - Visual Probability Tables");

(function() {
    let ptData = {};
    let ptRound = 1;
    const totalPtRounds = 3;
    let sessionCorrectFirstTry = 0;

    const scenarios = [
        {
            name: "Maggie", context: "is at the state fair and decided to buy a sundae. The stand has",
            cat1Name: "flavors of ice cream", cat1Items: ["Chocolate", "Vanilla", "Mint Chip", "Coconut", "Strawberry", "Coffee"],
            cat2Name: "toppings", cat2Items: ["Hot Fudge", "Caramel", "Sprinkles", "Whipped Cream"]
        },
        {
            name: "Marcus", context: "is getting dressed for school. He is choosing from",
            cat1Name: "shirts", cat1Items: ["Red", "Blue", "Green", "Black", "White", "Yellow"],
            cat2Name: "pants", cat2Items: ["Jeans", "Khakis", "Sweatpants", "Shorts"]
        },
        {
            name: "Sarah", context: "is ordering a sandwich at the deli. She needs to pick from",
            cat1Name: "meats", cat1Items: ["Turkey", "Ham", "Salami", "Roast Beef", "Chicken", "Bologna"],
            cat2Name: "breads", cat2Items: ["White", "Wheat", "Rye", "Sourdough"]
        },
        {
            name: "Leo", context: "is at the arcade spending his tickets. He can choose from",
            cat1Name: "candy types", cat1Items: ["Lollipops", "Gummy Bears", "Chocolates", "Sour Rings", "Mints"],
            cat2Name: "small toys", cat2Items: ["Bouncy Ball", "Sticker", "Whistle", "Yo-Yo"]
        }
    ];

    window.initProbTableGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        ptRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('ProbTable')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[ProbTable] Fetch error:", error);
                if (data) window.userMastery.ProbTable = data.ProbTable || 0;
            }
        } catch (e) { 
            console.error("[ProbTable] Init error:", e); 
        }
        
        startPtRound();
    };

    function startPtRound() {
        generatePtProblem();
        renderPtUI();
    }

    function generatePtProblem() {
        const base = scenarios[Math.floor(Math.random() * scenarios.length)];
        
        const lvl = Number(window.userMastery.ProbTable) || 0;
        let maxC1 = lvl < 4 ? 3 : 5; 
        let maxC2 = lvl < 4 ? 2 : 4;

        let c1 = [...base.cat1Items].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * (maxC1 - 2)) + 2);
        let c2 = [...base.cat2Items].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * (maxC2 - 2)) + 2);

        const target1 = c1[Math.floor(Math.random() * c1.length)];
        const target2 = c2[Math.floor(Math.random() * c2.length)];

        ptData = {
            name: base.name,
            context: base.context,
            cat1Name: base.cat1Name,
            cat2Name: base.cat2Name,
            rows: c1,
            cols: c2,
            targetRow: target1,
            targetCol: target2,
            totalCombos: c1.length * c2.length
        };
    }

    function renderPtUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Probability Tables (Round ${ptRound}/${totalPtRounds})`;

        let tableHTML = `<table style="width:100%; border-collapse: collapse; margin-top: 15px; background: white; text-align: center;">`;
        
        tableHTML += `<tr><th style="border: 1px solid #cbd5e1; padding: 10px; background: #f1f5f9;"></th>`;
        ptData.cols.forEach(col => {
            tableHTML += `<th style="border: 1px solid #cbd5e1; padding: 10px; background: #f8fafc; color: #334155;">${col}</th>`;
        });
        tableHTML += `</tr>`;

        ptData.rows.forEach(row => {
            tableHTML += `<tr><th style="border: 1px solid #cbd5e1; padding: 10px; background: #f8fafc; color: #334155; text-align: left;">${row}</th>`;
            ptData.cols.forEach(() => {
                tableHTML += `<td style="border: 1px solid #e2e8f0; padding: 10px; height: 30px;"></td>`;
            });
            tableHTML += `</tr>`;
        });
        tableHTML += `</table>`;

        let rowList = ptData.rows.slice(0, -1).join(', ') + (ptData.rows.length > 1 ? ', and ' : '') + ptData.rows[ptData.rows.length - 1];
        let colList = ptData.cols.slice(0, -1).join(', ') + (ptData.cols.length > 1 ? ', and ' : '') + ptData.cols[ptData.cols.length - 1];

        const storyText = `${ptData.name} ${ptData.context} ${ptData.rows.length} ${ptData.cat1Name} (${rowList}) and ${ptData.cols.length} ${ptData.cat2Name} (${colList}).`;

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 20px;">
                    ${storyText}
                </p>

                <div style="margin-bottom: 25px;">
                    <strong style="color: #475569; font-size: 14px; text-transform: uppercase;">Probability Table:</strong>
                    ${tableHTML}
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px;">
                    <div style="margin-bottom: 15px; font-size: 16px; display:flex; align-items: center; justify-content: space-between;">
                        <span><strong>1.</strong> How many different combinations are possible?</span>
                        <input type="number" id="pt-ans-total" placeholder="?" style="width:60px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                    </div>
                    
                    <div style="font-size: 16px; display:flex; align-items: center; justify-content: space-between;">
                        <span><strong>2.</strong> If picking randomly, what is the probability of getting <strong>${ptData.targetRow}</strong> and <strong>${ptData.targetCol}</strong>?</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <input type="number" id="pt-ans-num" placeholder="?" style="width:50px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                            <span style="font-size: 20px;">/</span>
                            <input type="number" id="pt-ans-den" placeholder="?" style="width:50px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        </div>
                    </div>
                </div>

                <button onclick="checkProbTable()" id="pt-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ANSWERS</button>
            </div>
            <div id="pt-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:24px; font-weight:bold; display:none; z-index:100;"></div>
        `;
    }

    window.checkProbTable = function() {
        const elTotal = document.getElementById('pt-ans-total');
        const elNum = document.getElementById('pt-ans-num');
        const elDen = document.getElementById('pt-ans-den');

        if (!elTotal || !elNum || !elDen) return;

        const uTotal = parseInt(elTotal.value);
        const uNum = parseInt(elNum.value);
        const uDen = parseInt(elDen.value);

        let allCorrect = true;

        if (uTotal === ptData.totalCombos) {
            elTotal.style.backgroundColor = "#dcfce7"; elTotal.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elTotal.style.backgroundColor = "#fee2e2"; elTotal.style.borderColor = "#ef4444";
        }

        if (uNum === 1) {
            elNum.style.backgroundColor = "#dcfce7"; elNum.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elNum.style.backgroundColor = "#fee2e2"; elNum.style.borderColor = "#ef4444";
        }

        if (uDen === ptData.totalCombos) {
            elDen.style.backgroundColor = "#dcfce7"; elDen.style.borderColor = "#22c
