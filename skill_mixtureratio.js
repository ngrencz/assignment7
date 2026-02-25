/**
 * skill_mixtureratio.js
 * - Generates ratio and percent mixture problems.
 * - Draws a visual percent line diagram.
 * - Asks for percentages, fractional ratios, and evaluates a second scenario.
 * - Fully integrated with assignment_hub.js and Supabase.
 */

console.log("🚀 skill_mixtureratio.js is LIVE - Percent Line Diagrams");

(function() {
    let mrData = {};
    let mrRound = 1;
    const totalMrRounds = 3;
    let sessionCorrectFirstTry = 0;
    
    // Using a select dropdown for the Yes/No question, we need to track it
    let userSelectedMatch = null; 

    const scenarios = [
        { name: "Angel", item: "lemonade", p1Name: "lemon juice", p2Name: "water", unit: "cups" },
        { name: "Carlos", item: "fruit punch", p1Name: "cherry juice", p2Name: "mango juice", unit: "cups" },
        { name: "Maya", item: "green paint", p1Name: "blue paint", p2Name: "yellow paint", unit: "pints" },
        { name: "Leo", item: "trail mix", p1Name: "peanuts", p2Name: "pretzels", unit: "cups" },
        { name: "Chloe", item: "smoothie", p1Name: "strawberries", p2Name: "yogurt", unit: "scoops" }
    ];

    // Clean ratio pairs that result in whole-number percentages
    const cleanRatios = [
        [1, 3], [2, 3], [1, 4], [3, 1], [1, 1], [3, 7], [1, 9], [4, 1]
    ];

    window.initMixtureRatioGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        mrRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('MixtureRatio')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[MixtureRatio] Fetch error:", error);
                if (data) window.userMastery.MixtureRatio = data.MixtureRatio || 0;
            }
        } catch (e) { 
            console.error("[MixtureRatio] Init error:", e); 
        }
        
        startMrRound();
    };

    function startMrRound() {
        userSelectedMatch = null;
        generateMrProblem();
        renderMrUI();
    }

    function generateMrProblem() {
        const base = scenarios[Math.floor(Math.random() * scenarios.length)];
        const pair = cleanRatios[Math.floor(Math.random() * cleanRatios.length)];
        
        const p1 = pair[0];
        const p2 = pair[1];
        const total = p1 + p2;
        
        const perc1 = (p1 / total) * 100;
        const perc2 = (p2 / total) * 100;

        // Generate Scenario C
        const isSameRecipe = Math.random() > 0.5;
        const multiplier = Math.floor(Math.random() * 3) + 2; // 2x, 3x, or 4x the recipe
        const newTotal = total * multiplier;
        
        let newP1;
        if (isSameRecipe) {
            newP1 = p1 * multiplier;
        } else {
            // Tweak the part so it's incorrect, but keep it a whole number
            newP1 = (p1 * multiplier) + (Math.random() > 0.5 ? 1 : -1);
            if (newP1 <= 0) newP1 = 2; // Failsafe
        }

        mrData = {
            ...base,
            p1: p1,
            p2: p2,
            total: total,
            perc1: perc1,
            perc2: perc2,
            newTotal: newTotal,
            newP1: newP1,
            isSameRecipe: isSameRecipe
        };
    }

    function renderMrUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Mixture Ratios (Round ${mrRound}/${totalMrRounds})`;

        const storyText = `A recipe for ${mrData.item} calls for using a ratio of <strong>${mrData.p1} ${mrData.unit} of ${mrData.p1Name}</strong> for every <strong>${mrData.p2} ${mrData.unit} of ${mrData.p2Name}</strong>.`;
        
        const scenarioCText = `${mrData.name} made ${mrData.newTotal} ${mrData.unit} of ${mrData.item}. They used ${mrData.newP1} ${mrData.unit} of ${mrData.p1Name} in their mixture. Did they follow the same recipe? (Did they use the same ratio?)`;

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 10px;">
                    ${storyText}
                </p>

                <div style="background: white; padding: 20px 10px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; text-align: center; overflow-x: auto;">
                    <canvas id="mrCanvas" width="500" height="120" style="max-width:100%;"></canvas>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px;">
                    
                    <div style="margin-bottom: 20px; font-size: 16px;">
                        <strong>a.</strong> Based on the diagram, what percent of the ${mrData.item} is ${mrData.p2Name}, and what percent is ${mrData.p1Name}?<br>
                        <div style="display: flex; gap: 20px; margin-top: 10px; align-items: center;">
                            <div>
                                <input type="number" id="mr-ans-perc1" placeholder="?" style="width:60px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                                <span>% ${mrData.p1Name}</span>
                            </div>
                            <div>
                                <input type="number" id="mr-ans-perc2" placeholder="?" style="width:60px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                                <span>% ${mrData.p2Name}</span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px; font-size: 16px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <strong>b.</strong> What is the ratio of ${mrData.p1Name} to the total liquid? (Write as a fraction)<br>
                        <div style="display: flex; gap: 5px; margin-top: 10px; align-items: center;">
                            <input type="number" id="mr-ans-num" placeholder="?" style="width:50px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                            <span style="font-size: 20px;">/</span>
                            <input type="number" id="mr-ans-den" placeholder="?" style="width:50px; height:35px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        </div>
                    </div>

                    <div style="font-size: 16px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <strong>c.</strong> ${scenarioCText}<br>
                        <div style="margin-top: 10px;">
                            <select id="mr-ans-match" style="height:40px; padding: 0 10px; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none; background: white; cursor: pointer;">
                                <option value="none">-- Select Yes or No --</option>
                                <option value="yes">Yes, it is the same ratio</option>
                                <option value="no">No, it is a different ratio</option>
                            </select>
                        </div>
                    </div>

                </div>

                <button onclick="checkMixtureRatio()" id="mr-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ANSWERS</button>
            </div>
            <div id="mr-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:24px; font-weight:bold; display:none; z-index:100;"></div>
        `;

        setTimeout(drawDiagram, 50);
    }

    function drawDiagram() {
        const canvas = document.getElementById('mrCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const width = canvas.width;
        const height = canvas.height;
        const padding = 50;
        const lineY = 80;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw main line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, lineY);
        ctx.lineTo(width - padding, lineY);
        ctx.stroke();

        // Draw ticks
        const drawTick = (x) => {
            ctx.beginPath();
            ctx.moveTo(x, lineY - 8);
            ctx.lineTo(x, lineY + 8);
            ctx.stroke();
        };

        const startX = padding;
        const endX = width - padding;
        const midX = padding + ((mrData.perc1 / 100) * (endX - startX));

        drawTick(startX);
        drawTick(endX);
        drawTick(midX);

        // Draw text below line
        ctx.fillStyle = '#0f172a';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('0%', startX, lineY + 25);
        ctx.fillText('100%', endX, lineY + 25);

        // Draw bracket for Part 1
        const bracketY = lineY - 15;
        ctx.beginPath();
        ctx.moveTo(startX, bracketY + 5);
        ctx.lineTo(startX, bracketY - 5);
        ctx.lineTo(midX, bracketY - 5);
        ctx.lineTo(midX, bracketY + 5);
        ctx.stroke();

        // Label above bracket
        ctx.fillText(`${mrData.p1} ${mrData.unit}`, startX + (midX - startX)/2, bracketY - 22);
        ctx.fillText(`${mrData.p1Name}`, startX + (midX - startX)/2, bracketY - 8);

        // Total label above 100%
        ctx.fillText(`${mrData.total} ${mrData.unit}`, endX, bracketY - 22);
        ctx.fillText(`${mrData.item}`, endX, bracketY - 8);
    }

    window.checkMixtureRatio = function() {
        const elPerc1 = document.getElementById('mr-ans-perc1');
        const elPerc2 = document.getElementById('mr-ans-perc2');
        const elNum = document.getElementById('mr-ans-num');
        const elDen = document.getElementById('mr-ans-den');
        const elMatch = document.getElementById('mr-ans-match');

        if (!elPerc1 || !elPerc2 || !elNum || !elDen || !elMatch) return;

        const uPerc1 = parseFloat(elPerc1.value);
        const uPerc2 = parseFloat(elPerc2.value);
        const uNum = parseInt(elNum.value);
        const uDen = parseInt(elDen.value);
        const uMatch = elMatch.value;

        let allCorrect = true;

        // Check Percentages
        if (uPerc1 === mrData.perc1) {
            elPerc1.style.backgroundColor = "#dcfce7"; elPerc1.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elPerc1.style.backgroundColor = "#fee2e2"; elPerc1.style.borderColor = "#ef4444";
        }

        if (uPerc2 === mrData.perc2) {
            elPerc2.style.backgroundColor = "#dcfce7"; elPerc2.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elPerc2.style.backgroundColor = "#fee2e2"; elPerc2.style.borderColor = "#ef4444";
        }

        // Check Ratio Fraction (Cross multiplication handles unsimplified fractions)
        if (!isNaN(uNum) && !isNaN(uDen) && uDen !== 0 && (uNum * mrData.total === mrData.p1 * uDen)) {
            elNum.style.backgroundColor = "#dcfce7"; elNum.style.borderColor = "#22c55e";
            elDen.style.backgroundColor = "#dcfce7"; elDen.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elNum.style.backgroundColor = "#fee2e2"; elNum.style.borderColor = "#ef4444";
            elDen.style.backgroundColor = "#fee2e2"; elDen.style.borderColor = "#ef4444";
        }

        // Check Scenario C
        const correctMatch = mrData.isSameRecipe ? "yes" : "no";
        if (uMatch === correctMatch) {
            elMatch.style.backgroundColor = "#dcfce7"; elMatch.style.borderColor = "#22c55e";
        } else {
            allCorrect = false;
            elMatch.style.backgroundColor = "#fee2e2"; elMatch.style.borderColor = "#ef4444";
        }

        if (uMatch === "none") allCorrect = false; // Prevent empty submission

        if (allCorrect) {
            document.getElementById('mr-check-btn').disabled = true;
            showMrFlash("Correct!", "success");
            sessionCorrectFirstTry++;

            mrRound++;
            setTimeout(() => {
                if (mrRound > totalMrRounds) finishMrGame();
                else startMrRound();
            }, 1200);
        } else {
            showMrFlash("Check your work.", "error");
        }
    };

    function finishMrGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px;">🍋</div>
                <h2 style="color:#1e293b; margin:10px 0;">Mixtures Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Skills updated.</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalMrRounds) mainAdjustment = 1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['MixtureRatio'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['MixtureRatio'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'MixtureRatio': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[MixtureRatio] Update Error:", error); });
            }
        }

        setTimeout(() => { 
            if (typeof window.loadNextQuestion === 'function') {
                window.loadNextQuestion(); 
            } else {
                location.reload();
            }
        }, 2000);
    }

    function showMrFlash(msg, type) {
        const overlay = document.getElementById('mr-flash');
        if (!overlay) return;
        overlay.innerText = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)';
        setTimeout(() => { overlay.style.display = 'none'; }, 1500);
    }

})();
