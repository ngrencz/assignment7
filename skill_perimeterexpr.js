/**
 * skill_perimeterexpr.js
 * - 7th Grade: Translating Word Problems to Algebraic Expressions (Perimeter)
 * - Generates relative length word problems (e.g., "7 feet more than twice the width").
 * - Requires students to label the diagram and write the fully simplified perimeter.
 * - Uses the robust polynomial parser to accept terms in any order.
 */

console.log("🚀 skill_perimeterexpr.js is LIVE - Algebraic Perimeter");

(function() {
    let peData = {};
    let peRound = 1;
    const totalPeRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initPerimeterExprGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        peRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('PerimeterExpr')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[PerimeterExpr] Fetch error:", error);
                if (data) window.userMastery.PerimeterExpr = data.PerimeterExpr || 0;
            }
        } catch (e) { 
            console.error("[PerimeterExpr] Init error:", e); 
        }
        
        startPeRound();
    };

    function startPeRound() {
        errorsThisRound = 0;
        generatePeProblem();
        renderPeUI();
    }

    function generatePeProblem() {
        const names = ["Mr. Nowling's", "Sarah's", "Coach T's", "The school's", "A community"];
        const areas = ["garden", "rectangular pool", "fenced dog park", "soccer field", "patio"];
        
        let name = names[Math.floor(Math.random() * names.length)];
        let area = areas[Math.floor(Math.random() * areas.length)];
        
        // Progression based on mastery
        let mastery = window.userMastery.PerimeterExpr || 0;
        let mult, constant;

        if (mastery < 4) {
            // Level 1: Just addition/subtraction (e.g., "5 feet longer than the width")
            mult = 1;
            do { constant = Math.floor(Math.random() * 20) - 10; } while (constant === 0);
        } else if (mastery < 7) {
            // Level 2: Multiplication with positive constants (e.g., "3 more than twice")
            mult = Math.floor(Math.random() * 3) + 2; // 2 or 3
            constant = Math.floor(Math.random() * 10); // 0 to 9
        } else {
            // Level 3: Full mix, including negatives (e.g., "4 less than 3 times")
            mult = Math.floor(Math.random() * 3) + 1; // 1 to 3
            do { constant = Math.floor(Math.random() * 25) - 12; } while (mult === 1 && constant === 0);
        }

        // Construct the word problem text
        let lengthPhrase = "";
        let cAbs = Math.abs(constant);

        if (mult === 1) {
            lengthPhrase = constant > 0 ? `${constant} feet more than the width` : `${cAbs} feet less than the width`;
        } else {
            let mStr = mult === 2 ? "twice" : `${mult} times`;
            if (constant === 0) {
                lengthPhrase = `${mStr} the width`;
            } else if (constant > 0) {
                lengthPhrase = `${constant} feet more than ${mStr} the width`;
            } else {
                lengthPhrase = `${cAbs} feet less than ${mStr} the width`;
            }
        }

        // Calculate Target Polynomial Maps
        // Width = w  -> {w: 1}
        // Length = mw + c -> {w: m, c: c}
        // Perimeter = 2w + 2(mw + c) -> {w: 2 + 2m, c: 2c}

        let wMap = { 'w': 1 };
        let lMap = {};
        if (mult !== 0) lMap['w'] = mult;
        if (constant !== 0) lMap['c'] = constant;

        let pMap = {};
        pMap['w'] = 2 + (2 * mult);
        if (constant !== 0) pMap['c'] = 2 * constant;

        peData = {
            prompt: `${name} ${area} has a length that is <strong>${lengthPhrase}</strong>.`,
            wMap: wMap,
            lMap: lMap,
            pMap: pMap,
            mult: mult,
            constant: constant
        };
    }

    function renderPeUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Algebraic Perimeter (Round ${peRound}/${totalPeRounds})`;

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 35px; text-align:center;">
                    ${peData.prompt}<br>
                    <span style="color:#64748b; font-size:14px; font-style:italic;">(Use the variable <strong>w</strong> to represent the width).</span>
                </p>

                <div style="display:flex; justify-content: center; align-items:center; padding: 20px; margin-bottom: 20px;">
                    <div style="position:relative; width: 320px; height: 160px; background: #dcfce7; border: 4px solid #166534; border-radius: 4px;">
                        
                        <div style="position:absolute; top: -55px; left: 50%; transform: translateX(-50%); text-align:center;">
                            <div style="font-size:12px; font-weight:bold; color:#1e293b; margin-bottom:2px;">Length</div>
                            <input type="text" id="pe-len" placeholder="e.g. 2w + 5" style="width: 140px; padding:8px; text-align:center; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off">
                        </div>

                        <div style="position:absolute; right: -90px; top: 50%; transform: translateY(-50%); text-align:center;">
                            <div style="font-size:12px; font-weight:bold; color:#1e293b; margin-bottom:2px;">Width</div>
                            <input type="text" id="pe-wid" placeholder="w" style="width: 70px; padding:8px; text-align:center; font-size:16px; border:2px solid #94a3b8; border-radius:6px; outline:none;" autocomplete="off">
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 15px; display:flex; flex-direction: column; align-items: center;">
                    <span style="font-size: 16px; margin-bottom: 10px; color:#1e293b;"><strong>Simplified Perimeter Expression:</strong></span>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <span style="font-size:20px; font-weight:bold; font-family:'Courier New', monospace;">P = </span>
                        <input type="text" id="pe-perim" placeholder="Combine all like terms" style="width: 220px; padding:10px; font-size:18px; text-align:center; border:2px solid #3b82f6; border-radius:6px; outline:none;" autocomplete="off">
                    </div>
                </div>

                <button onclick="checkPerimeterExpr()" id="pe-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ALL</button>
            </div>
            <div id="pe-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('pe-wid')?.focus(); }, 100);
    }

    // Identical robust polynomial parser from skill_simplify
    function parsePolynomial(str) {
        if (!str) return { map: {}, termCount: 0 };
        let clean = str.replace(/\s+/g, '').toLowerCase();
        let terms = clean.match(/[+-]?[^+-]+/g) || [];
        let map = {};
        
        for (let t of terms) {
            let match = t.match(/^([+-]?\d*)([a-z]\^?\d*)?$/);
            if (!match) continue; 
            
            let coefStr = match[1];
            let varPart = match[2] || 'c';
            
            let coef = 1;
            if (coefStr === '-' || coefStr === '+-') coef = -1;
            else if (coefStr === '+' || coefStr === '') coef = 1;
            else coef = parseInt(coefStr);
            
            map[varPart] = (map[varPart] || 0) + coef;
        }
        for(let k in map) { if(map[k] === 0) delete map[k]; }
        return { map: map, termCount: terms.length };
    }

    function mapsAreEqual(map1, map2) {
        let keys1 = Object.keys(map1);
        let keys2 = Object.keys(map2);
        if (keys1.length !== keys2.length) return false;
        for (let k of keys1) {
            if (map1[k] !== map2[k]) return false;
        }
        return true;
    }

    window.checkPerimeterExpr = function() {
        const elWid = document.getElementById('pe-wid');
        const elLen = document.getElementById('pe-len');
        const elPerim = document.getElementById('pe-perim');

        if (!elWid || !elLen || !elPerim) return;

        const wParsed = parsePolynomial(elWid.value);
        const lParsed = parsePolynomial(elLen.value);
        const pParsed = parsePolynomial(elPerim.value);

        let wCorrect = mapsAreEqual(wParsed.map, peData.wMap);
        let lCorrect = mapsAreEqual(lParsed.map, peData.lMap);
        
        let pMathCorrect = mapsAreEqual(pParsed.map, peData.pMap);
        let pFullySimplified = pParsed.termCount === Object.keys(pParsed.map).length;
        let pCorrect = pMathCorrect && pFullySimplified;

        // Visual Feedback
        elWid.style.borderColor = wCorrect ? "#22c55e" : "#ef4444";
        elWid.style.backgroundColor = wCorrect ? "#dcfce7" : "#fee2e2";

        elLen.style.borderColor = lCorrect ? "#22c55e" : "#ef4444";
        elLen.style.backgroundColor = lCorrect ? "#dcfce7" : "#fee2e2";

        elPerim.style.borderColor = pCorrect ? "#22c55e" : "#ef4444";
        elPerim.style.backgroundColor = pCorrect ? "#dcfce7" : "#fee2e2";

        if (wCorrect && lCorrect && pCorrect) {
            document.getElementById('pe-check-btn').disabled = true;
            
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showPeFlash("✅ Perfect Translation!", "success");

            peRound++;
            setTimeout(() => {
                if (peRound > totalPeRounds) finishPeGame();
                else startPeRound();
            }, 1500);

        } else {
            errorsThisRound++;
            
            let hintMsg = "❌ Check your inputs!<br><br>";
            if (!wCorrect) hintMsg += "• Width should just be represented by 'w'.<br>";
            if (!lCorrect) hintMsg += "• Re-read the word problem to build the length expression.<br>";
            if (lCorrect && wCorrect && !pCorrect) {
                if (pMathCorrect && !pFullySimplified) {
                    hintMsg += "• Your perimeter is correct, but not fully simplified! Combine like terms.<br>";
                } else {
                    hintMsg += "• Remember, a rectangle has 4 sides! Add up ALL 4 sides: w + w + length + length.<br>";
                }
            }
            showPeFlash(hintMsg, "error");
        }
    };

    function finishPeGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">📐</div>
                <h2 style="color:#1e293b; margin:10px 0;">Expressions Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalPeRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['PerimeterExpr'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['PerimeterExpr'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'PerimeterExpr': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[PerimeterExpr] Update Error:", error); });
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

    function showPeFlash(msg, type) {
        const overlay = document.getElementById('pe-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        // Let error messages stay slightly longer so they can read the bullet points
        let readTime = type === 'success' ? 1500 : 3500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
