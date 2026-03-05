/**
 * skill_portionsweb.js
 * - 7th Grade: Portions Web
 * - Converts between Fractions, Decimals, Percents, and Pictures (Interactive Pie Chart).
 * - Randomly locks one node as the "Given" and requires the other three.
 */

console.log("🚀 skill_portionsweb.js is LIVE - Interactive Picture Web");

(function() {
    let pwData = {};
    let pwRound = 1;
    const totalPwRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initPortionsWebGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        pwRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('PortionsWeb')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[PortionsWeb] Fetch error:", error);
                if (data) window.userMastery.PortionsWeb = data.PortionsWeb || 0;
            }
        } catch (e) { 
            console.error("[PortionsWeb] Init error:", e); 
        }
        
        startPwRound();
    };

    function startPwRound() {
        errorsThisRound = 0;
        generatePwProblem();
        renderPwUI();
    }

    function generatePwProblem() {
        // Clean, terminating fractions for smooth validation
        const portions = [
            { n: 1, d: 2, dec: 0.5, pct: 50 },
            { n: 1, d: 4, dec: 0.25, pct: 25 },
            { n: 3, d: 4, dec: 0.75, pct: 75 },
            { n: 1, d: 5, dec: 0.2, pct: 20 },
            { n: 2, d: 5, dec: 0.4, pct: 40 },
            { n: 3, d: 5, dec: 0.6, pct: 60 },
            { n: 4, d: 5, dec: 0.8, pct: 80 },
            { n: 1, d: 10, dec: 0.1, pct: 10 },
            { n: 3, d: 10, dec: 0.3, pct: 30 },
            { n: 7, d: 10, dec: 0.7, pct: 70 },
            { n: 9, d: 10, dec: 0.9, pct: 90 },
            { n: 1, d: 8, dec: 0.125, pct: 12.5 },
            { n: 3, d: 8, dec: 0.375, pct: 37.5 }
        ];
        
        let p = portions[Math.floor(Math.random() * portions.length)];
        
        const modes = ["fraction", "decimal", "percent", "picture"];
        let givenMode = modes[Math.floor(Math.random() * modes.length)];

        // Initialize the interactive slices array
        let slices = new Array(p.d).fill(false);
        
        // If the picture is the given clue, pre-fill the correct number of slices
        if (givenMode === "picture") {
            for (let i = 0; i < p.n; i++) {
                slices[i] = true;
            }
        }

        pwData = {
            portion: p,
            givenMode: givenMode,
            slices: slices
        };
    }

    function renderPwUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Portions Web (Round ${pwRound}/${totalPwRounds})`;

        let p = pwData.portion;
        let m = pwData.givenMode;

        let htmlFraction = m === "fraction" 
            ? `<div style="font-size:24px; font-weight:bold; color:#1e293b;">${p.n}/${p.d}</div>` 
            : `<input type="text" id="pw-frac" placeholder="e.g. 1/2" style="width:100px; padding:10px; font-size:18px; text-align:center; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off">`;

        let htmlDecimal = m === "decimal" 
            ? `<div style="font-size:24px; font-weight:bold; color:#1e293b;">${p.dec}</div>` 
            : `<input type="number" step="0.001" id="pw-dec" placeholder="0.0" style="width:100px; padding:10px; font-size:18px; text-align:center; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off">`;

        let htmlPercent = m === "percent" 
            ? `<div style="font-size:24px; font-weight:bold; color:#1e293b;">${p.pct}%</div>` 
            : `<div style="display:flex; align-items:center; gap:5px; justify-content:center;"><input type="number" step="0.1" id="pw-pct" placeholder="0" style="width:90px; padding:10px; font-size:18px; text-align:center; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off"><span style="font-size:20px; font-weight:bold;">%</span></div>`;

        // The center is now always a canvas, but cursor style changes if it's locked
        let pointerStyle = m === "picture" ? "default" : "pointer";
        let instructionText = m === "picture" ? "Given Picture" : "Click to fill pieces";

        let htmlPicture = `
            <span style="font-size:12px; color:#64748b; margin-bottom:5px; display:block;">${instructionText}</span>
            <canvas id="pw-canvas" width="120" height="120" style="cursor:${pointerStyle}; border-radius:50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></canvas>
        `;

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
                    <p style="font-size: 16px; color: #1e293b; line-height: 1.6; flex:1; margin-right: 15px;">
                        Complete the Portions Web! One representation has been given to you. Fill in the missing boxes (and color the picture!) to represent the exact same portion.
                    </p>
                    <button onclick="togglePwHelp()" style="background:#3b82f6; color:white; border:none; padding:8px 12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:14px; white-space:nowrap;">
                        💡 Help: Web
                    </button>
                </div>

                <div style="position:relative; width:100%; height:370px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; display:flex; align-items:center; justify-content:center;">
                    
                    <div id="pw-pic-container" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center; background:#f1f5f9; padding:15px; border-radius:12px; border:2px solid ${m === 'picture' ? '#22c55e' : '#cbd5e1'}; z-index:10;">
                        ${htmlPicture}
                    </div>

                    <div style="position:absolute; top:20px; left:50%; transform:translateX(-50%); text-align:center;">
                        <span style="display:block; font-size:12px; font-weight:bold; color:#64748b; margin-bottom:5px; text-transform:uppercase;">Fraction</span>
                        ${htmlFraction}
                    </div>

                    <div style="position:absolute; bottom:30px; left:40px; text-align:center;">
                        <span style="display:block; font-size:12px; font-weight:bold; color:#64748b; margin-bottom:5px; text-transform:uppercase;">Decimal</span>
                        ${htmlDecimal}
                    </div>

                    <div style="position:absolute; bottom:30px; right:40px; text-align:center;">
                        <span style="display:block; font-size:12px; font-weight:bold; color:#64748b; margin-bottom:5px; text-transform:uppercase;">Percent</span>
                        ${htmlPercent}
                    </div>

                    <svg width="100%" height="100%" style="position:absolute; top:0; left:0; z-index:0; pointer-events:none;">
                        <line x1="50%" y1="90" x2="25%" y2="250" stroke="#cbd5e1" stroke-width="2" />
                        <line x1="50%" y1="90" x2="75%" y2="250" stroke="#cbd5e1" stroke-width="2" />
                        <line x1="25%" y1="280" x2="75%" y2="280" stroke="#cbd5e1" stroke-width="2" />
                    </svg>

                </div>

                <button onclick="checkPortionsWeb()" id="pw-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>

            <div id="pw-help-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15, 23, 42, 0.8); z-index:200; align-items:center; justify-content:center;">
                <div style="background:white; padding:30px; border-radius:12px; max-width:500px; width:90%; position:relative; text-align:center;">
                    <button onclick="togglePwHelp()" style="position:absolute; top:10px; right:15px; font-size:24px; background:none; border:none; cursor:pointer; color:#64748b;">&times;</button>
                    <h3 style="margin-top:0; color:#1e293b;">Representations of a Portion</h3>
                    <p style="color:#475569; font-size:14px; margin-bottom:20px;">All 4 corners represent the <strong>exact same value!</strong></p>
                    
                    <div style="position:relative; width:300px; height:250px; margin:0 auto;">
                        <div style="position:absolute; top:0; left:50%; transform:translateX(-50%); font-weight:bold; color:#2563eb;">Fraction</div>
                        <div style="position:absolute; bottom:0; left:0; font-weight:bold; color:#16a34a;">Decimal</div>
                        <div style="position:absolute; bottom:0; right:0; font-weight:bold; color:#d97706;">Percent</div>
                        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-weight:bold; color:#9333ea;">Words or<br>Pictures</div>
                        
                        <svg width="100%" height="100%" style="position:absolute; top:0; left:0; z-index:-1;">
                            <path d="M 150 30 Q 80 120 40 220" fill="transparent" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" marker-start="url(#arrow)"/>
                            <path d="M 150 30 Q 220 120 260 220" fill="transparent" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" marker-start="url(#arrow)"/>
                            <path d="M 50 240 Q 150 200 250 240" fill="transparent" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)" marker-start="url(#arrow)"/>
                            
                            <defs>
                                <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                                </marker>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>

            <div id="pw-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => {
            initCanvasInteractive();
            // Auto focus the first available input
            if(m !== "fraction") document.getElementById('pw-frac')?.focus();
            else if(m !== "decimal") document.getElementById('pw-dec')?.focus();
        }, 100);
    }

    function initCanvasInteractive() {
        const canvas = document.getElementById('pw-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = 58; // slightly less than 60 to allow for stroke
        const d = pwData.portion.d;
        const sliceAngle = (2 * Math.PI) / d;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < d; i++) {
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                // Start at -Math.PI/2 to orient the first slice at 12 o'clock
                let startAngle = (i * sliceAngle) - (Math.PI / 2);
                let endAngle = ((i + 1) * sliceAngle) - (Math.PI / 2);
                ctx.arc(cx, cy, r, startAngle, endAngle);
                ctx.closePath();
                
                // Color it blue if selected, white if not
                ctx.fillStyle = pwData.slices[i] ? '#3b82f6' : '#ffffff';
                ctx.fill();
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        draw();

        // Only add click listener if the picture is NOT the given clue
        if (pwData.givenMode !== "picture") {
            canvas.addEventListener('mousedown', function(e) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left - cx;
                const y = e.clientY - rect.top - cy;
                
                // Calculate angle from 12 o'clock
                let angle = Math.atan2(y, x) + (Math.PI / 2);
                if (angle < 0) angle += 2 * Math.PI;
                
                let clickedIndex = Math.floor(angle / sliceAngle);
                
                // Toggle the slice
                pwData.slices[clickedIndex] = !pwData.slices[clickedIndex];
                draw();
            });
        }
    }

    window.togglePwHelp = function() {
        const modal = document.getElementById('pw-help-modal');
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    };

    window.checkPortionsWeb = function() {
        let p = pwData.portion;
        let m = pwData.givenMode;
        let allCorrect = true;
        let hintMsg = "❌ Check your conversions!<br><br>";

        // 1. Check Fraction
        if (m !== "fraction") {
            const elFrac = document.getElementById('pw-frac');
            let fracVal = elFrac.value.trim();
            let isFracCorrect = false;
            
            if (fracVal.includes('/')) {
                let parts = fracVal.split('/');
                let num = parseInt(parts[0]);
                let den = parseInt(parts[1]);
                if (!isNaN(num) && !isNaN(den) && den !== 0 && (num * p.d === p.n * den)) {
                    isFracCorrect = true;
                }
            }

            elFrac.style.borderColor = isFracCorrect ? "#22c55e" : "#ef4444";
            elFrac.style.backgroundColor = isFracCorrect ? "#dcfce7" : "#fee2e2";
            if (!isFracCorrect) { allCorrect = false; hintMsg += "• Fraction: Check your numerator and denominator.<br>"; }
        }

        // 2. Check Decimal
        if (m !== "decimal") {
            const elDec = document.getElementById('pw-dec');
            let userDec = parseFloat(elDec.value);
            let isDecCorrect = (!isNaN(userDec) && Math.abs(userDec - p.dec) < 0.001);

            elDec.style.borderColor = isDecCorrect ? "#22c55e" : "#ef4444";
            elDec.style.backgroundColor = isDecCorrect ? "#dcfce7" : "#fee2e2";
            if (!isDecCorrect) { allCorrect = false; hintMsg += "• Decimal: Divide the numerator by the denominator.<br>"; }
        }

        // 3. Check Percent
        if (m !== "percent") {
            const elPct = document.getElementById('pw-pct');
            let userPct = parseFloat(elPct.value);
            let isPctCorrect = (!isNaN(userPct) && Math.abs(userPct - p.pct) < 0.1);

            elPct.style.borderColor = isPctCorrect ? "#22c55e" : "#ef4444";
            elPct.style.backgroundColor = isPctCorrect ? "#dcfce7" : "#fee2e2";
            if (!isPctCorrect) { allCorrect = false; hintMsg += "• Percent: Move the decimal point two places to the right.<br>"; }
        }

        // 4. Check Picture
        if (m !== "picture") {
            const picContainer = document.getElementById('pw-pic-container');
            // Count how many slices are true
            let coloredCount = pwData.slices.filter(Boolean).length;
            let isPicCorrect = (coloredCount === p.n);

            picContainer.style.borderColor = isPicCorrect ? "#22c55e" : "#ef4444";
            if (!isPicCorrect) { allCorrect = false; hintMsg += `• Picture: Click the chart to color in exactly ${p.n} piece(s).<br>`; }
        }

        if (allCorrect) {
            document.getElementById('pw-check-btn').disabled = true;
            
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showPwFlash("✅ Web Complete!", "success");

            pwRound++;
            setTimeout(() => {
                if (pwRound > totalPwRounds) finishPwGame();
                else startPwRound();
            }, 1500);

        } else {
            errorsThisRound++;
            showPwFlash(hintMsg, "error");
        }
    };

    function finishPwGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🕸️</div>
                <h2 style="color:#1e293b; margin:10px 0;">Portions Web Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalPwRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['PortionsWeb'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['PortionsWeb'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'PortionsWeb': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[PortionsWeb] Update Error:", error); });
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

    function showPwFlash(msg, type) {
        const overlay = document.getElementById('pw-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 3500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
