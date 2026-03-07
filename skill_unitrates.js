/**
 * skill_unitrates.js
 * - 7th Grade: Real-World Unit Rates
 * - Generates messy real-world division problems (Population Density, Unit Price, Speed).
 * - Forces rounding to two decimal places.
 * - Detects and hints if the student divides backwards (y/x vs x/y).
 */

console.log("🚀 skill_unitrates.js is LIVE - Real-World Unit Rates");

(function() {
    let urData = {};
    let urRound = 1;
    const totalUrRounds = 3;
    let sessionCorrectFirstTry = 0;
    let errorsThisRound = 0;

    window.initUnitRatesGame = async function() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        window.isCurrentQActive = true;
        window.currentQSeconds = 0;
        urRound = 1;
        sessionCorrectFirstTry = 0;
        errorsThisRound = 0;

        if (!window.userMastery) window.userMastery = {};

        try {
            if (window.supabaseClient && window.currentUser) {
                const currentHour = sessionStorage.getItem('target_hour') || "00";
                const { data, error } = await window.supabaseClient
                    .from('assignment7')
                    .select('UnitRates')
                    .eq('userName', window.currentUser)
                    .eq('hour', currentHour)
                    .maybeSingle();
                
                if (error) console.error("[UnitRates] Fetch error:", error);
                if (data) window.userMastery.UnitRates = data.UnitRates || 0;
            }
        } catch (e) { 
            console.error("[UnitRates] Init error:", e); 
        }
        
        startUrRound();
    };

    function startUrRound() {
        errorsThisRound = 0;
        generateUrProblem();
        renderUrUI();
    }

    function generateUrProblem() {
        const types = ['density', 'price', 'speed'];
        let type = types[Math.floor(Math.random() * types.length)];
        
        let promptStr = "";
        let num1, num2, targetRate, reverseRate, unitLabel;

        if (type === 'density') {
            // e.g., Population Density (People per Sq Mile)
            let states = ["Alaska", "Wyoming", "Montana", "North Dakota", "South Dakota"];
            let state = states[Math.floor(Math.random() * states.length)];
            
            // Generate messy large numbers
            let people = Math.floor(Math.random() * 800000) + 500000;
            let sqMiles = Math.floor(Math.random() * 300000) + 70000;
            
            targetRate = people / sqMiles;
            reverseRate = sqMiles / people; // The trap!
            unitLabel = "people per square mile";
            
            promptStr = `${state} has a population of ${people.toLocaleString()} people living in an area of ${sqMiles.toLocaleString()} square miles. Find the unit rate of density in terms of ${unitLabel}.`;

        } else if (type === 'price') {
            // e.g., Unit Price ($ per Ounce)
            let items = ["cereal", "laundry detergent", "coffee", "mixed nuts"];
            let item = items[Math.floor(Math.random() * items.length)];
            
            let ounces = Math.floor(Math.random() * 40) + 12; // 12 to 51 oz
            let price = (Math.random() * 8 + 3).toFixed(2); // $3.00 to $10.99
            
            targetRate = parseFloat(price) / ounces;
            reverseRate = ounces / parseFloat(price); // The trap!
            unitLabel = "dollars per ounce";
            
            promptStr = `A family-size box of ${item} weighs ${ounces} ounces and costs $${price}. Find the unit price in terms of ${unitLabel}.`;

        } else {
            // e.g., Speed (Miles per Hour)
            let vehicles = ["train", "car", "bus", "truck"];
            let vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
            
            let miles = Math.floor(Math.random() * 400) + 150; 
            let hours = (Math.random() * 5 + 2).toFixed(1); // 2.0 to 6.9 hours
            
            targetRate = miles / parseFloat(hours);
            reverseRate = parseFloat(hours) / miles; // The trap!
            unitLabel = "miles per hour";
            
            promptStr = `A ${vehicle} traveled ${miles} miles in exactly ${hours} hours. Find the unit rate of speed in terms of ${unitLabel}.`;
        }

        // Calculate properly rounded answers (to nearest hundredth)
        let roundedTarget = Math.round(targetRate * 100) / 100;
        let roundedReverse = Math.round(reverseRate * 100) / 100;

        urData = {
            prompt: promptStr,
            unitLabel: unitLabel,
            targetAns: roundedTarget,
            trapAns: roundedReverse
        };
    }

    function renderUrUI() {
        const qContent = document.getElementById('q-content');
        if (!qContent) return;

        document.getElementById('q-title').innerText = `Real-World Unit Rates (Round ${urRound}/${totalUrRounds})`;

        // Tell the Sandbox what the answer is
        window.expectedTestAnswer = current.a;
        
        qContent.innerHTML = `
            <div style="max-width: 650px; margin: 0 auto; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0; animation: fadeIn 0.4s;">
                
                <p style="font-size: 18px; color: #1e293b; line-height: 1.6; margin-bottom: 25px;">
                    ${urData.prompt}
                </p>

                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; display:flex; flex-direction:column; align-items:center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <span style="font-size: 15px; color: #64748b; margin-bottom: 15px; font-style: italic;">
                        (Round your answer to the nearest hundredth, or two decimal places)
                    </span>
                    <div style="display:flex; align-items:center; justify-content:center; gap: 10px; width: 100%;">
                        <input type="number" step="0.01" id="ur-ans" placeholder="0.00" autocomplete="off" style="width: 120px; height: 50px; padding: 0 10px; text-align: center; font-size: 20px; font-weight: bold; border: 2px solid #94a3b8; border-radius: 6px; outline: none; transition: border-color 0.2s;">
                        <span style="font-size: 18px; font-weight: bold; color: #1e293b;">${urData.unitLabel}</span>
                    </div>
                </div>

                <button onclick="checkUnitRate()" id="ur-check-btn" style="width:100%; height:50px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size: 18px; transition: background 0.2s;">SUBMIT ANSWER</button>
            </div>
            <div id="ur-flash" style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.8); color:white; padding:20px 40px; border-radius:12px; font-size:20px; font-weight:bold; display:none; z-index:100; text-align:center; line-height:1.4;"></div>
        `;

        setTimeout(() => { document.getElementById('ur-ans')?.focus(); }, 100);
    }

    window.checkUnitRate = function() {
        const inputEl = document.getElementById('ur-ans');
        if (!inputEl) return;

        let userAns = parseFloat(inputEl.value);
        let isCorrect = false;
        let hintMsg = "❌ Check your math!<br><br>";

        // Allow a tiny margin of error for different rounding methods, but require them to be very close
        if (!isNaN(userAns) && Math.abs(userAns - urData.targetAns) <= 0.02) {
            isCorrect = true;
        }

        if (isCorrect) {
            inputEl.style.borderColor = "#22c55e"; 
            inputEl.style.backgroundColor = "#dcfce7";
            inputEl.disabled = true;
            document.getElementById('ur-check-btn').disabled = true;
            
            if (errorsThisRound === 0) sessionCorrectFirstTry++;
            showUrFlash("✅ Spot on!", "success");

            urRound++;
            setTimeout(() => {
                if (urRound > totalUrRounds) finishUrGame();
                else startUrRound();
            }, 1500);

        } else {
            errorsThisRound++;
            inputEl.style.borderColor = "#ef4444"; 
            inputEl.style.backgroundColor = "#fee2e2";

            // Trap Check: Did they divide backwards?
            if (!isNaN(userAns) && Math.abs(userAns - urData.trapAns) <= 0.02) {
                hintMsg += `• <strong>You divided backwards!</strong><br>To find "${urData.unitLabel}", you must divide the first word by the second word.<br>`;
            } else {
                hintMsg += `• Make sure you are dividing correctly and rounding to exactly two decimal places.<br>`;
            }

            showUrFlash(hintMsg, "error");
        }
    };

    function finishUrGame() {
        window.isCurrentQActive = false; 
        const qContent = document.getElementById('q-content');
        if (!qContent) return;
        
        qContent.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
                <div style="font-size:60px; margin-bottom:15px;">📊</div>
                <h2 style="color:#1e293b; margin:10px 0;">Unit Rates Mastered!</h2>
                <p style="color:#64748b; font-size:16px;">Saving results to database...</p>
            </div>
        `;

        let mainAdjustment = 0;
        if (sessionCorrectFirstTry >= totalUrRounds) mainAdjustment = 1;
        else if (sessionCorrectFirstTry <= 1) mainAdjustment = -1;

        if (mainAdjustment !== 0) {
            const currentMain = window.userMastery?.['UnitRates'] || 0;
            const newMain = Math.max(0, Math.min(10, currentMain + mainAdjustment));
            window.userMastery['UnitRates'] = newMain;

            if (window.supabaseClient && window.currentUser) {
                const hour = sessionStorage.getItem('target_hour') || "00";
                window.supabaseClient.from('assignment7')
                    .update({ 'UnitRates': newMain })
                    .eq('userName', window.currentUser)
                    .eq('hour', hour)
                    .then(({ error }) => { if (error) console.error("[UnitRates] Update Error:", error); });
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

    function showUrFlash(msg, type) {
        const overlay = document.getElementById('ur-flash');
        if (!overlay) return;
        overlay.innerHTML = msg;
        overlay.style.display = 'block';
        overlay.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.98)';
        
        let readTime = type === 'success' ? 1500 : 4500;
        setTimeout(() => { overlay.style.display = 'none'; }, readTime);
    }
})();
