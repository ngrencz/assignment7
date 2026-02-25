/**
 * skill_algebratiles.js
 * - Generates Area and Perimeter expressions from visual tiles.
 * - Handles the physical geometric perimeter trick when x < 1.
 * - Fully integrated with assignment_hub.js and Supabase assignment7.
 */

console.log("🚀 skill_algebratiles.js is LIVE - Hub Integrated");

(function() {
    let atData = {};
    let atRound = 1;
    const totalAtRounds = 3;

    window.initAlgebraTiles = async function() {
        if (!document.getElementById('q-content')) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        atRound = 1;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('AlgebraTiles')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[AlgebraTiles] Supabase fetch error:", error);
                window.userMastery.AlgebraTiles = data?.AlgebraTiles || 0;
            }
        } catch (e) { 
            console.error("[AlgebraTiles] Init error:", e); 
        }
        
        startAtRound();
    };

    function startAtRound() {
        generateAtProblem();
        renderAtUI();
    }

    function generateAtProblem() {
        const lvl = Number(window.userMastery.AlgebraTiles) || 0;
        
        // Include x^2 tiles if mastery is high enough, or randomly
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

        // Coefficients
        const pX = (2 * x2Count) + 2;
        const pC = 2 * (xCount + numUnitColumns);

        // Determine substitution x-value (25% chance to test the x=0.5 trick)
        const maxUnitHeight = unitColumns[0];
        let evalX;
        if (Math.random() < 0.25) {
            // Trick value (e.g., 0.5)
            evalX = Math.max(0.1, Math.floor(Math.random() * (maxUnitHeight * 10)) / 10);
            if (evalX >= maxUnitHeight) evalX = maxUnitHeight - 0.5;
        } else {
            // Normal integer value
            evalX = Math.floor(Math.random() * 8) + maxUnitHeight;
        }

        // Calculate actual physical perimeter
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
        // Round to 2 decimals to prevent floating point UI bugs
        actualPerimeterEval = parseFloat(actualPerimeterEval.toFixed(2));

        atData = {
            x2: x2Count,
            x: xCount,
            c: totalUnitTiles,
            pX: pX,
            pC: pC,
            unitColumns: unitColumns,
            evalX: evalX,
            evalP: actualPerimeterEval
        };
    }

    function renderAtUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Algebra Tiles (Round ${atRound}/${totalAtRounds})`;

        // Helper to generate consistent input boxes
        const makeInput = (id) => `<input type="number" id="ans-${id}" step="0.1" placeholder="?" autocomplete="off" style="width:50px; height:30px; text-align:center; font-size:16px; border:2px solid #3b82f6; border-radius:6px; outline:none;">`;

        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap: 20px;">
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; width: 100%; text-align: center;">
                    <canvas id="atCanvas" width="400" height="150" style="max-width:100%;"></canvas>
                </div>

                <div style="background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; width: 100%; max-width: 500px;">
                    <div style="margin-bottom: 15px; font-size: 18px;">
                        <strong>1. Area Expression:</strong><br>
                        <div style="margin-top: 8px; display:flex; gap:10px; align-items:center;">
                            ${makeInput('area-x2')} x² + ${makeInput('area-x')} x + ${makeInput('area-c')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px; font-size: 18px;">
                        <strong>2. Perimeter Expression:</strong><br>
                        <div style="margin-top: 8px; display:flex; gap:10px; align-items:center;">
                            ${makeInput('perim-x')} x + ${makeInput('perim-c')}
                        </div>
                    </div>

                    <div style="margin-bottom: 15px; font-size: 18px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
                        <strong>3. Evaluate:</strong> If x = ${atData.evalX}, what is the physical perimeter?<br>
                        <div style="margin-top: 8px; display:flex; gap:10px; align-items:center;">
                            Perimeter = ${makeInput('eval-p')}
                        </div>
                    </div>

                    <button onclick="checkAlgebraTiles()" style="width:100%; height:45px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 16px;">CHECK ANSWERS</button>
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
        
        const u = 30; // 1 unit
        const xLen = u * 3; // Length of x visually
        
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

    window.checkAlgebraTiles = function() {
        let allCorrect = true;

        const checks = [
            { id: 'area-x2', val: atData.x2 },
            { id: 'area-x', val: atData.x },
            { id: 'area-c', val: atData.c },
            { id: 'perim-x', val: atData.pX },
            { id: 'perim-c', val: atData.pC },
            { id: 'eval-p', val: atData.evalP }
        ];

        checks.forEach(check => {
            const el = document.getElementById(`ans-${check.id}`);
            if (!el) return;
            
            // Treat empty as 0 to prevent frustrating NaN errors
            const userVal = el.value.trim() === "" ? 0 : parseFloat(el.value);

            if (Math.abs(userVal - check.val) > 0.05) {
                allCorrect = false;
                el.style.backgroundColor = "#fee2e2";
                el.style.borderColor = "#ef4444";
            } else {
                el.style.backgroundColor = "#dcfce7";
                el.style.borderColor = "#22c55e";
            }
        });

        if (allCorrect) {
            showAtFlash("Correct!", "success");
            
            let current = Number(window.userMastery.AlgebraTiles) || 0;
            let nextScore = Math.min(10, current + 1);
            window.userMastery.AlgebraTiles = nextScore;
            
            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ AlgebraTiles: nextScore })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({error}) => { if (error) console.error("[AlgebraTiles] Update Error:", error); });
            }

            atRound++;
            setTimeout(() => {
                if (atRound > totalAtRounds) finishATGame();
                else startAtRound();
            }, 1200);
        } else {
            showAtFlash("Check your math.", "error");
        }
    };

    function finishATGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px;">
                <div style="font-size:60px;">🧱</div>
                <h2 style="color:#1e293b; margin:10px 0;">Tile Set Complete!</h2>
                <p style="color:#64748b; font-size:16px;">Skills updated.</p>
            </div>
        `;

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
