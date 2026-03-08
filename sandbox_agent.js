// sandbox_agent.js - The inside operative for the Admin Dashboard
(function() {
    // Only activate if running inside an iframe! (Keeps it asleep for real students)
    if (window === window.parent) return;

    function sendToAdmin(type, msg) {
        window.parent.postMessage({ source: 'sandbox_agent', type: type, payload: msg }, '*');
    }

    sendToAdmin('info', 'Agent injected and listening.');

    // 1. Spy on Errors
    window.addEventListener('error', function(e) {
        sendToAdmin('error', e.message + ' at ' + e.filename + ':' + e.lineno);
    });
    const oldErr = console.error;
    console.error = function(...args) {
        sendToAdmin('error', args.join(' '));
        if (oldErr) oldErr.apply(console, args);
    };

    // 2. Spy on loadNextQuestion
    const checkLoadNext = setInterval(() => {
        if (typeof window.loadNextQuestion === 'function' && !window._agentSpiedLoadNext) {
            const origLoadNext = window.loadNextQuestion;
            window.loadNextQuestion = function() {
                sendToAdmin('success', 'loadNextQuestion triggered!');
                if (window._sandboxMode === 'auto') {
                    sendToAdmin('auto_next', 'Loop complete.');
                } else {
                    if (origLoadNext) origLoadNext.apply(window);
                }
            };
            window._agentSpiedLoadNext = true;
        }
    }, 500);

    // 3. Interrogate the Answer Hook
    const spyInterval = setInterval(() => {
        if (window.expectedTestAnswer !== undefined) {
            const ans = window.expectedTestAnswer;
            sendToAdmin('spy', 'EXPECTED ANSWER: ' + ans);
            window.expectedTestAnswer = undefined; // clear it so we don't spam the console
            
            if (window._sandboxMode === 'auto') {
                executeAutoPilotMove(ans);
            }
        }
    }, 500);

    // Listen for Mode Commands from Admin Dashboard
    window.addEventListener('message', function(e) {
        if (e.data && e.data.command === 'set_mode') {
            window._sandboxMode = e.data.mode;
            sendToAdmin('info', 'Agent activated in ' + e.data.mode.toUpperCase() + ' mode.');
        }
    });

    // Auto-Pilot Logic
    // Auto-Pilot Logic
    function executeAutoPilotMove(ans) {
        setTimeout(() => {
            // --- NEW: Complex Multi-Step Object Handler ---
            if (typeof ans === 'object' && ans !== null && ans.targets) {
                ans.targets.forEach(t => {
                    let el = document.getElementById(t.id);
                    if (el) {
                        el.value = t.val;
                        // Fire events so the browser registers the change
                        el.dispatchEvent(new window.KeyboardEvent('input', {bubbles:true}));
                        el.dispatchEvent(new window.Event('change', {bubbles:true}));
                    }
                });
                sendToAdmin('info', "🤖 Auto-Pilot executed targeted instructions.");
                
                if (ans.btnId) {
                    let stepBtn = document.getElementById(ans.btnId);
                    if (stepBtn) {
                        setTimeout(() => {
                            stepBtn.click();
                            sendToAdmin('info', "🤖 Auto-Pilot clicked targeted Check button.");
                        }, 500);
                    }
                }
                return; // Stop here so it doesn't run the legacy code below
            }

            // --- LEGACY: Standard Single-Input Handler ---
            const inputs = document.querySelectorAll('input[type="number"], .answer');
            const btns = document.querySelectorAll('button:not([style*="display: none"])');
            
            if(inputs.length > 0) {
                inputs[0].value = ans;
                sendToAdmin('info', "🤖 Auto-Pilot typed standard answer.");
                
                // Added "check" to the button search to cover more of your modules
                let submitBtn = Array.from(btns).find(b => 
                    b.innerText.toLowerCase().includes('submit') || 
                    b.innerText.toLowerCase().includes('check') || 
                    (b.id && b.id.includes('submit'))
                );
                
                if (submitBtn) {
                    setTimeout(() => {
                        submitBtn.click();
                        sendToAdmin('info', "🤖 Auto-Pilot clicked Submit/Check.");
                    }, 500);
                } else {
                    const ev = new window.KeyboardEvent('input', {bubbles:true});
                    inputs[0].dispatchEvent(ev);
                    sendToAdmin('info', "🤖 Auto-Pilot triggered Enter/Input.");
                }
            }
        }, 1000);
    }
})();
