/**
 * skill_algebratiles.js
 * - Generates Area and Perimeter expressions from visual tiles.
 * - Allows full string inputs and parses them automatically.
 * - Tracks 3 sub-skills: at_area, at_perim, and at_eval.
 * - Fully integrated with assignment_hub.js and Supabase assignment7.
 */

console.log("🚀 skill_algebratiles.js is LIVE - Sub-skills & Parsing");

(function() {
    let atData = {};
    let atRound = 1;
    const totalAtRounds = 3;
    
    // Track errors for the current round to manage scoring
    let roundErrors = { area: 0, perim: 0, eval: 0 };
    let sessionCorrectFirstTry = 0; // Tracks perfect rounds for main mastery

    window.initAlgebraTiles = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        atRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                
                // Fetch main skill AND sub-skills
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('AlgebraTiles, at_area, at_perim, at_eval')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[AlgebraTiles] Supabase fetch error:", error);
                
                // Safely merge DB data into local mastery
                if (data) window.userMastery = { ...window.userMastery, ...data };
            }
        } catch (e) { 
            console.error("[AlgebraTiles] Init error:", e); 
        }
        
        startAtRound();
    };

    function startAtRound() {
        roundErrors = { area: 0, perim: 0, eval: 0 };
        generateAtProblem();
        renderAtUI();
    }

    function generateAtProblem() {
        const lvl = Number(window.userMastery.AlgebraTiles) || 0;
        
        const allowX2 = lvl >= 3; 
        const x2Count = allowX2 ? Math.floor(Math.random() * 3) : 0;
        const xCount = Math.floor(Math.random() * 4) + 1;
        const numUnitColumns = Math.floor(Math.random() * 3) + 1;

        const unitColumns = [];
        let currentHeight = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numUnitColumns; i++) {
            unitColumns.push(currentHeight);
            currentHeight = Math.floor(Math.random() * currentHeight) + 1; 
        }

        const totalUnitTiles = unitColumns.reduce((sum, val) => sum + val, 0);

        const pX = (2 * x2Count) + 2;
        const pC = 2 * (xCount + numUnitColumns);

        const maxUnitHeight = unitColumns[0];
        let evalX;
        if (Math.random() < 0.25) {
            evalX = Math.max(0.1, Math.floor(Math.random() * (maxUnitHeight * 10)) / 10);
            if (evalX >= maxUnitHeight) evalX = maxUnitHeight - 0.5;
        } else {
            evalX = Math.floor(Math.random() * 8) + maxUnitHeight;
        }

        let actualPerimeterEval;
        if (evalX >= maxUnitHeight) {
            actualPerimeterEval = (pX * evalX) + pC;
        } else {
            const topBottomWidth = (x2Count * evalX) + xCount + numUnitColumns;
            const rightEdge = unitColumns[unitColumns.length - 1];
            const rise = maxUnitHeight - evalX;
            const drop = maxUnitHeight - rightEdge;
            actualPerimeterEval = evalX + rightEdge + (2 * topBottomWidth) + rise + drop;
        }
        actualPerimeterEval = parseFloat(actualPerimeterEval.toFixed(2));

        atData = {
            x2: x2Count, x: xCount, c: totalUnitTiles,
            pX: pX, pC: pC,
            unitColumns: unitColumns,
            evalX: evalX, evalP: actualPerimeterEval
        };
    }

    function renderAtUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Algebra Tiles (Round ${atRound}/${totalAtRounds})`;

        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap: 20px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; width: 100%; text-align: center;">
                    <canvas id="atCanvas" width="400" height="150" style="max-width:100%;"></canvas>
                </div>

                <div style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; width: 100%; max-width: 500px;">
                    <div style="margin-bottom: 15px; font-size: 18px;">
                        <strong>1. Area Expression:</strong><br>
                        <div style="margin-top: 8px;">
                            <input type="text" id="ans-area" placeholder="e.g. x^2 + 3x + 2" autocomplete="off" style="width:100%; height:40px; padding: 0 10px; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px; font-size: 18px;">
                        <strong>2. Perimeter Expression:</strong><br>
                        <div style="margin-top: 8px;">
                            <input type="text" id="ans-perim" placeholder="e.g. 2x + 6" autocomplete="off" style="width:100%; height:40px; padding: 0 10px; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        </div>
                    </div>

                    <div style="margin-bottom: 15px; font-size: 18px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <strong>3. Evaluate:</strong> If x = ${atData.evalX}, what is the physical perimeter?<br>
                        <div style="margin-top: 8px; display:flex; gap:10px; align-items:center;">
                            Perimeter = <input type="number" id="ans-eval" step="0.1" placeholder="?" autocomplete="off" style="width:100px; height:40px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">
                        </div>
                    </div>

                    <button onclick="checkAlgebraTiles()" id="at-check-btn" style="width:100%; height:45px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 16px;">CHECK ANSWERS</button>
                </div>
            </div>
            <div id="at-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:24px; font-weight:bold; display:none; z-index:100;"></div>
        `;

        setTimeout(drawTiles, 50);
    }

    function drawTiles() {
        const canvas = document.getElementById('atCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const u = 30; 
        const xLen = u * 3; 
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let startX = 20;
        let startY = canvas.height - 20; 

        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#ccc';
        ctx.lineWidth = 1;

        // Draw x^2
        for (let i = 0; i < atData.x2; i++) {
            ctx.fillRect(startX, startY - xLen, xLen, xLen);
            ctx.strokeRect(startX, startY - xLen, xLen, xLen);
            ctx.fillStyle = '#000'; ctx.font = '16px serif';
            ctx.fillText('x²', startX + xLen/2 - 8, startY - xLen/2 + 5);
            ctx.fillStyle = '#ccc'; 
            startX += xLen;
        }

        // Draw x
        for (let i = 0; i < atData.x; i++) {
            ctx.fillRect(startX, startY - xLen, u, xLen);
            ctx.strokeRect(startX, startY - xLen, u, xLen);
            ctx.fillStyle = '#000'; ctx.font = 'italic 16px serif';
            ctx.fillText('x', startX + u/2 - 4, startY - xLen/2 + 5);
            ctx.fillStyle = '#ccc'; 
            startX += u;
        }

        // Draw units
        for (let col = 0; col < atData.unitColumns.length; col++) {
            let currentY = startY;
            for (let row = 0; row < atData.unitColumns[col]; row++) {
                ctx.fillRect(startX, currentY - u, u, u);
                ctx.strokeRect(startX, currentY - u, u, u);
                currentY -= u;
            }
            startX += u;
        }
    }

    function parseExpression(str) {
        let counts = { x2: 0, x: 0, c: 0 };
        if (!str) return counts;
        
        let clean = str.replace(/\s+/g, '').toLowerCase();
        let terms = clean.split('+');
        
        for (let term of terms) {
            // Handles both typed 'x^2' and copy-pasted 'x²'
            if (term.includes('x^2') || term.includes('x²')) { 
                let coeff = term.replace(/x\^2|x²/g, '');
                counts.x2 += (coeff === '' ? 1 : parseInt(coeff));
            } else if (term.includes('x')) {
                let coeff = term.replace('x', '');
                counts.x += (coeff === '' ? 1 : parseInt(coeff));
            } else {
                counts.c += parseInt(term) || 0;
            }
        }
        return counts;
    }

    window.checkAlgebraTiles = function() {
        const elArea = document.getElementById('ans-area');
        const elPerim = document.getElementById('ans-perim');
        const elEval = document.getElementById('ans-eval');

        if (!elArea || !elPerim || !elEval) return;

        const parsedArea = parseExpression(elArea.value);
        const parsedPerim = parseExpression(elPerim.value);
        const evalVal = elEval.value.trim() === "" ? NaN : parseFloat(elEval.value);

        // Evaluate truth
        const areaCorrect = (parsedArea.x2 === atData.x2 && parsedArea.x === atData.x && parsedArea.c === atData.c);
        const perimCorrect = (parsedPerim.x2 === 0 && parsedPerim.x === atData.pX && parsedPerim.c === atData.pC);
        const evalCorrect = (!isNaN(evalVal) && Math.abs(evalVal - atData.evalP) < 0.05);

        let updateObj = {};

        // 1. Process Area
        if (areaCorrect) {
            elArea.style.backgroundColor = "#dcfce7"; elArea.style.borderColor = "#22c55e";
            elArea.disabled = true; // Lock it in
            if (roundErrors.area === 0) { // Award point if first try
                window.userMastery.at_area = Math.min(10, (window.userMastery.at_area || 0) + 1);
                updateObj.at_area = window.userMastery.at_area;
            }
            roundErrors.area = -1; // Flag as complete
        } else {
            if (roundErrors.area !== -1) {
                roundErrors.area++;
                elArea.style.backgroundColor = "#fee2e2"; elArea.style.borderColor = "#ef4444";
            }
        }

        // 2. Process Perimeter
        if (perimCorrect) {
            elPerim.style.backgroundColor = "#dcfce7"; elPerim.style.borderColor = "#22c55e";
            elPerim.disabled = true;
            if (roundErrors.perim === 0) {
                window.userMastery.at_perim = Math.min(10, (window.userMastery.at_perim || 0) + 1);
                updateObj.at_perim = window.userMastery.at_perim;
            }
            roundErrors.perim = -1;
        } else {
            if (roundErrors.perim !== -1) {
                roundErrors.perim++;
                elPerim.style.backgroundColor = "#fee2e2"; elPerim.style.borderColor = "#ef4444";
            }
        }

        // 3. Process Eval
        if (evalCorrect) {
            elEval.style.backgroundColor = "#dcfce7"; elEval.style.borderColor = "#22c55e";
            elEval.disabled = true;
            if (roundErrors.eval === 0) {
                window.userMastery.at_eval = Math.min(10, (window.userMastery.at_eval || 0) + 1);
                updateObj.at_eval = window.userMastery.at_eval;
            }
            roundErrors.eval = -1;
        } else {
            if (roundErrors.eval !== -1) {
                roundErrors.eval++;
                elEval.style.backgroundColor = "#fee2e2"; elEval.style.borderColor = "#ef4444";
            }
        }

        // Background sync any newly earned sub-skill points immediately
        if (Object.keys(updateObj).length > 0 && window.supabaseClient && window.currentUser) {
            const hour = sessionStorage.getItem('target_hour') || "00";
            window.supabaseClient.from('assignment7')
                .update(updateObj)
                .eq('userName', window.currentUser)
                .eq('hour', hour)
                .then(({error}) => { if (error) console.error("[AlgebraTiles] Sub-skill Update Error:", error); });
        }

        // Check for round completion
        if (areaCorrect && perimCorrect && evalCorrect) {
            document.getElementById('at-check-btn').disabled = true;
            showAtFlash("Round Complete!", "success");
            
            // Check if the whole round was perfect to boost the main mastery score
            if (roundErrors.area === -1 && roundErrors.perim === -1 && roundErrors.eval === -1) {
                sessionCorrectFirstTry++;
            }

            atRound++;
            setTimeout(() => {
                if (atRound > totalAtRounds) finishATGame();
                else startAtRound();
            }, 1200);
        } else {
            showAtFlash("Keep trying.", "error");
        }
    };

    function finishATGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px;">🧱</div>
                <h2 style="color:#1e293b; margin:10px 0;">Tile Set Complete!</h2>
                <p style="color:#64748b; font-size:16px;">Skills updated.</p>
            </div>
        `;

        // Process Main Mastery Adjustment
        let mainAdjustment = 0;
        if (sessionCorrectFirstTry === totalAtRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['AlgebraTiles'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['AlgebraTiles'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'AlgebraTiles': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[AlgebraTiles] Main Score Error:", error); });
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

    function showAtFlash(msg, type) {
        const overlay = document.getElementById('at-flash');
        if (!overlay) return;
        overlay.innerText = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)';
        setTimeout(() => { overlay.style.display = 'none'; }, 1500);
    }

})();
