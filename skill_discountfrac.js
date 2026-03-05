/**
 * skill_discountfrac.js
 * - 7th Grade: Fractional & Percent Discounts 
 * - Generates 2 word problems per round (1 fraction, 1 percent).
 * - Tracks specific sub-skills (df_fraction and df_percent) in the database.
 */

console.log("🚀 skill_discountfrac.js is LIVE - Fraction & Percent Sub-Tracking");

(function() {
    let dfData = {};
    let dfRound = 1;
    const totalDfRounds = 3;
    let sessionCorrectFirstTry = 0;
    let currentQuestions = [];
    let roundErrors = [0, 0]; 

    window.initDiscountFracGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        dfRound = 1;
        sessionCorrectFirstTry = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('DiscountFrac, df_fraction, df_percent')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[DiscountFrac] Fetch error:", error);
                if (data) window.userMastery = { ...window.userMastery, ...data };
            }
        } catch (e) { 
            console.error("[DiscountFrac] Init error:", e); 
        }
        
        startDfRound();
    };

    function startDfRound() {
        roundErrors = [0, 0];
        
        let types = ["fraction", "percent"];
        types.sort(() => 0.5 - Math.random());
        
        currentQuestions = [generateDfProblem(types[0]), generateDfProblem(types[1])];
        renderDfUI();
    }

    function generateDfProblem(type) {
        const names = ["Lynn", "Marcus", "Sarah", "David", "Chloe", "Alex", "Maya", "Leo"];
        const items = ["purse", "jacket", "pair of shoes", "video game", "skateboard", "backpack", "smart watch", "headphones"];
        
        let name = names[Math.floor(Math.random() * names.length)];
        let item = items[Math.floor(Math.random() * items.length)];
        
        let origPrice, discount, discountStr;

        if (type === "fraction") {
            const fractions = [
                {n: 1, d: 2, str: "1/2"}, {n: 1, d: 3, str: "1/3"}, {n: 1, d: 4, str: "1/4"}, 
                {n: 1, d: 5, str: "1/5"}, {n: 2, d: 3, str: "2/3"}, {n: 3, d: 4, str: "3/4"}, 
                {n: 2, d: 5, str: "2/5"}
            ];
            let frac = fractions[Math.floor(Math.random() * fractions.length)];
            
            let baseMult = Math.floor(Math.random() * 12) + 4; 
            origPrice = baseMult * frac.d * 5; 
            
            discount = (origPrice * frac.n) / frac.d;
            discountStr = frac.str;
        } else {
            const percents = [10, 15, 20, 25, 30, 40, 50, 75];
            let pct = percents[Math.floor(Math.random() * percents.length)];
            
            let baseMult = Math.floor(Math.random() * 15) + 2; 
            origPrice = baseMult * 10;
            
            discount = origPrice * (pct / 100);
            discountStr = `${pct}%`;
        }

        let finalPrice = origPrice - discount;

        return {
            type: type, // Identifies if this is the fraction or percent problem
            name: name,
            prompt: `${name} was shopping and found a ${item} that was marked with a discount of "${discountStr} off." If the original cost of the ${item} was $${origPrice}, how much will ${name} pay?`,
            ans: finalPrice,
            discountAmount: discount
        };
    }

    function renderDfUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Calculating Discounts (Round ${dfRound}/${totalDfRounds})`;

        let questionsHTML = '';

        currentQuestions.forEach((q, i) => {
            questionsHTML += `
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-bottom: 15px;">
                        <strong>${i + 1}.</strong> ${q.prompt}
                    </p>
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <span style="font-size:18px; font-weight:bold; color:#1e293b;">Final Price: $</span>
                        <input type="number" step="0.01" id="df-ans-${i}" placeholder="0.00" autocomplete="off" style="width:120px; height:40px; padding: 0 10px; font-size:18px; border:2px solid #94a3b8; border-radius:6px; outline:none; transition: border-color 0.2s;">
                    </div>
                </div>
            `;
        });

        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                <p style="color: #64748b; font-size: 15px; margin-bottom: 20px; text-align: center;">Calculate the discount and subtract it from the original price.</p>
                
                ${questionsHTML}

                <button onclick="checkDiscountFrac()" id="df-check-btn" style="width:100%; height:50px; margin-top: 5px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">CHECK ANSWERS</button>
            </div>
            <div id="df-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('df-ans-0')?.focus(); }, 100);
    }

    window.checkDiscountFrac = function() {
        let allCorrect = true;

        currentQuestions.forEach((q, i) => {
            const inputEl = document.getElementById(`df-ans-${i}`);
            if (!inputEl) return;
            if (inputEl.disabled) return; 

            const userAns = parseFloat(inputEl.value);

            if (!isNaN(userAns) && Math.abs(userAns - q.ans) < 0.02) {
                inputEl.style.backgroundColor = "#dcfce7"; 
                inputEl.style.borderColor = "#22c55e";
                inputEl.disabled = true; 
                
                // --- SUB-SKILL TRACKING ---
                // If they got this specific question right on the first try, bump its sub-skill
                if (roundErrors[i] === 0) {
                    let colName = 'df_' + q.type; // Will be 'df_fraction' or 'df_percent'
                    let currentSubScore = window.userMastery[colName] || 0;
                    let nextSubScore = Math.min(10, currentSubScore + 1);
                    window.userMastery[colName] = nextSubScore;

                    // Sync sub-skill immediately
                    if (window.supabaseClient && window.currentUser) {
                        const hour = sessionStorage.getItem('target_hour') || "00";
                        window.supabaseClient.from('assignment7')
                            .update({ [colName]: nextSubScore })
                            .eq('userName', window.currentUser)
                            .eq('hour', hour)
                            .then(({ error }) => { if (error) console.error("Sub-score sync error:", error); });
                    }
                }

                roundErrors[i] = -1; 
            } else {
                allCorrect = false;
                roundErrors[i]++;
                inputEl.style.backgroundColor = "#fee2e2"; 
                inputEl.style.borderColor = "#ef4444";
                
                if (!isNaN(userAns) && Math.abs(userAns - q.discountAmount) < 0.02) {
                    showDfFlash(`You found the discount for #${i+1}, but don't forget to subtract it from the original price!`, "error");
                }
            }
        });

        if (allCorrect) {
            document.getElementById('df-check-btn').disabled = true;
            
            const isPerfectRound = roundErrors.every(err => err === -1);
            if (isPerfectRound) sessionCorrectFirstTry++;
            
            showDfFlash("✅ Perfect Calculations!", "success");

            dfRound++;
            setTimeout(() => {
                if (dfRound > totalDfRounds) finishDfGame();
                else startDfRound();
            }, 1500);
        } else if (document.getElementById('df-flash').style.display === 'none') {
            showDfFlash("❌ Check your math.", "error");
        }
    };

    function finishDfGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">🛍️</div>
                <h2 style="color:#1e293b; margin:10px 0;">Discounts Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
                <p style="color:#3b82f6; font-size:14px; font-weight:bold; margin-top:15px; background:#eff6ff; padding:10px; border-radius:8px;">(Keep practicing until your Session Timer hits the goal!)</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry === totalDfRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['DiscountFrac'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['DiscountFrac'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'DiscountFrac': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[DiscountFrac] Main Update Error:", error); });
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

    function showDfFlash(msg, type) {
        const overlay = document.getElementById('df-flash');
        if (!overlay) return;
        overlay.innerText = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 3500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
