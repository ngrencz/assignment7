/**
 * skill_shapearea.js
 * - 7th Grade: Coordinate Plane Geometry
 * - Step 1: Plot 4 points
 * - Step 2: Identify the shape
 * - Step 3: Calculate the area
 */

var saData = {
    round: 1,
    maxRounds: 2, 
    score: 0,
    step: 1,
    shape: {},
    userPoints: [],
    errors: { plot: 0, identify: 0, area: 0 }
};

window.initShapeAreaGame = async function() {
    if (!document.getElementById('q-content')) return;

    window.isCurrentQActive = true;
    window.currentQSeconds = 0;
    saData.round = 1;

    if (!window.userMastery) window.userMastery = {};

    try {
        if (window.supabaseClient && window.currentUser) {
            const h = sessionStorage.getItem('target_hour') || "00";
            const { data } = await window.supabaseClient
                .from('assignment7')
                .select('ShapeArea, sa_plot, sa_identify, sa_area')
                .eq('userName', window.currentUser)
                .eq('hour', h)
                .maybeSingle();
            
            if (data) {
                window.userMastery = { ...window.userMastery, ...data };
                saData.score = data.ShapeArea || 0;
            }
        }
    } catch (e) {
        console.warn("ShapeArea DB sync error, falling back to local state.");
    }

    startSaRound();
};

function startSaRound() {
    saData.step = 1;
    saData.userPoints = [];
    saData.errors = { plot: 0, identify: 0, area: 0 };
    generateShape();
    renderSaUI();
}

function generateShape() {
    let valid = false;
    let pts = [];
    let type = '';
    let area = 0;

    // Keep generating until the shape fits cleanly on a -10 to +10 grid
    while(!valid) {
        const types = ['square', 'rectangle', 'parallelogram', 'trapezoid'];
        type = types[Math.floor(Math.random() * types.length)];
        
        let w = Math.floor(Math.random() * 6) + 3; // width 3 to 8
        let h = Math.floor(Math.random() * 5) + 3; // height 3 to 7

        let startX = Math.floor(Math.random() * 12) - 6; 
        let startY = Math.floor(Math.random() * 12) - 6;

        if (type === 'square') {
            h = w;
            pts = [
                {x: startX, y: startY}, {x: startX + w, y: startY},
                {x: startX + w, y: startY + h}, {x: startX, y: startY + h}
            ];
            area = w * w;
        } else if (type === 'rectangle') {
            if (w === h) w += 1; 
            pts = [
                {x: startX, y: startY}, {x: startX + w, y: startY},
                {x: startX + w, y: startY + h}, {x: startX, y: startY + h}
            ];
            area = w * h;
        } else if (type === 'parallelogram') {
            let shift = Math.floor(Math.random() * 3) + 2; 
            pts = [
                {x: startX, y: startY}, {x: startX + w, y: startY},
                {x: startX + w + shift, y: startY + h}, {x: startX + shift, y: startY + h}
            ];
            area = w * h;
        } else if (type === 'trapezoid') {
            let topW = w - Math.floor(Math.random() * (w-2)) - 1; 
            let shift = Math.floor(Math.random() * 3);
            pts = [
                {x: startX, y: startY}, {x: startX + w, y: startY},
                {x: startX + shift + topW, y: startY + h}, {x: startX + shift, y: startY + h}
            ];
            area = 0.5 * (w + topW) * h;
        }

        // Validate it fits on the grid
        valid = pts.every(p => p.x >= -9 && p.x <= 9 && p.y >= -9 && p.y <= 9);
        
        if (valid) {
            // Randomly flip over axes for variety
            if (Math.random() > 0.5) pts.forEach(p => p.y *= -1);
            if (Math.random() > 0.5) pts.forEach(p => p.x *= -1);

            // Re-center mathematically so we can draw it as a connected polygon
            let cx = pts.reduce((sum, p) => sum + p.x, 0) / 4;
            let cy = pts.reduce((sum, p) => sum + p.y, 0) / 4;
            pts.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
        }
    }

    // Shuffle the display points so they aren't listed in perfect order
    let displayPts = [...pts].sort(() => 0.5 - Math.random());

    saData.shape = { type, area, points: pts, displayPoints: displayPts };
}

function renderSaUI() {
    const qContent = document.getElementById('q-content');
    if (!qContent) return;

    document.getElementById('q-title').innerText = `Coordinate Geometry (Round ${saData.round}/${saData.maxRounds})`;

    let pointList = saData.shape.displayPoints.map(p => `(${p.x}, ${p.y})`).join(', &nbsp;');

    let sidebarHtml = "";
    
    if (saData.step === 1) {
        sidebarHtml = `
            <h3 style="margin-top:0; color:#1e293b;">Step 1: Plot the Points</h3>
            <p style="color:#475569; font-size:14px; margin-bottom:15px;">Click the grid to plot the following ordered pairs:</p>
            <div style="background:white; padding:12px; border-radius:6px; border:1px solid #cbd5e1; font-family:monospace; font-size:16px; font-weight:bold; color:#2563eb; line-height:1.5;">
                ${pointList}
            </div>
            <div style="margin-top:15px; font-size:13px; color:#64748b;">
                <strong>Found:</strong> ${saData.userPoints.length} / 4
            </div>
            <div id="sa-feedback" style="margin-top:15px; font-weight:bold; color:#ef4444; min-height:20px;"></div>
        `;
    } 
    else if (saData.step === 2) {
        sidebarHtml = `
            <h3 style="margin-top:0; color:#1e293b;">Step 2: Identify</h3>
            <p style="color:#475569; font-size:14px;">What is the most specific name for the shape you just graphed?</p>
            <select id="sa-shape-select" style="width:100%; padding:10px; font-size:16px; border-radius:6px; border:1px solid #94a3b8; margin-top:10px; margin-bottom:15px; cursor:pointer;">
                <option value="">-- Select Shape --</option>
                <option value="square">Square</option>
                <option value="rectangle">Rectangle</option>
                <option value="parallelogram">Parallelogram</option>
                <option value="trapezoid">Trapezoid</option>
            </select>
            <button onclick="checkSaIdentify()" style="width:100%; padding:12px; background:#1e293b; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:15px;">Check Answer</button>
            <div id="sa-feedback" style="margin-top:15px; font-weight:bold; min-height:20px;"></div>
        `;
    }
    else if (saData.step === 3) {
        sidebarHtml = `
            <h3 style="margin-top:0; color:#1e293b;">Step 3: Area</h3>
            <p style="color:#475569; font-size:14px;">Calculate the area of the <strong>${saData.shape.type}</strong>.</p>
            <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin: 20px 0;">
                <input type="number" id="sa-area-input" style="width:80px; padding:10px; font-size:18px; text-align:center; border:2px solid #cbd5e1; border-radius:6px;" placeholder="?">
                <span style="font-weight:bold; color:#334155;">square units</span>
            </div>
            <button onclick="checkSaArea()" style="width:100%; padding:12px; background:#10b981; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:15px;">Submit Final Area</button>
            <div id="sa-feedback" style="margin-top:15px; font-weight:bold; min-height:20px;"></div>
        `;
    }

    qContent.innerHTML = `
        <div style="display:flex; flex-wrap:wrap; gap:25px; justify-content:center; align-items:flex-start; animation: fadeIn 0.5s;">
            <div style="position:relative; background:white; padding:10px; border-radius:8px; border:1px solid #94a3b8; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                <canvas id="saCanvas" width="400" height="400" style="cursor:${saData.step === 1 ? 'crosshair' : 'default'};"></canvas>
            </div>
            
            <div style="flex:1; min-width:260px; max-width: 320px; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
                ${sidebarHtml}
            </div>
        </div>
    `;

    setupSaCanvas();
    drawSaGrid();
}

function setupSaCanvas() {
    const canvas = document.getElementById('saCanvas');
    if (!canvas) return;

    canvas.onclick = (e) => {
        if (saData.step !== 1) return; 

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Map to -10 to +10 grid (400px canvas = 20px per unit)
        let gridX = Math.round((mouseX - 200) / 20);
        let gridY = Math.round((200 - mouseY) / 20);

        const fb = document.getElementById('sa-feedback');

        // Check if point belongs to the target shape
        const match = saData.shape.points.find(p => p.x === gridX && p.y === gridY);

        if (match) {
            // Check if already found
            if (saData.userPoints.some(p => p.x === gridX && p.y === gridY)) {
                fb.innerText = "Already plotted that point!";
                return;
            }

            saData.userPoints.push(match);
            fb.innerText = "";
            drawSaGrid();

            // Re-render sidebar to update the "Found: X/4" counter without flashing canvas
            document.querySelector('#sa-feedback').previousElementSibling.innerHTML = `<strong>Found:</strong> ${saData.userPoints.length} / 4`;

            if (saData.userPoints.length === 4) {
                // Record plot success
                let change = saData.errors.plot === 0 ? 1 : 0;
                updateSaSubScore('sa_plot', change);
                
                saData.step = 2;
                setTimeout(renderSaUI, 1000); 
            }
        } else {
            saData.errors.plot++;
            fb.style.color = "#dc2626";
            fb.innerText = `Missed! You clicked (${gridX}, ${gridY})`;
        }
    };
}

function drawSaGrid() {
    const canvas = document.getElementById('saCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const step = 20;
    const center = 200;

    ctx.clearRect(0, 0, 400, 400);

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    for (let i = 0; i <= 400; i += step) {
        ctx.moveTo(i, 0); ctx.lineTo(i, 400);
        ctx.moveTo(0, i); ctx.lineTo(400, i);
    }
    ctx.stroke();

    // Draw Main Axes
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(center, 0); ctx.lineTo(center, 400);
    ctx.moveTo(0, center); ctx.lineTo(400, center);
    ctx.stroke();

    // Draw Axis Numbers
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = -10; i <= 10; i += 2) {
        if (i === 0) continue;
        ctx.fillText(i, center + (i * step), center + 12);
        ctx.fillText(i, center - 12, center - (i * step));
    }

    // Draw Plotted Points
    saData.userPoints.forEach(p => {
        let px = center + (p.x * step);
        let py = center - (p.y * step);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
    });

    // Draw Connected Shape if all 4 points found (Step 2 and 3)
    if (saData.userPoints.length === 4) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#3b82f6";
        ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
        
        ctx.beginPath();
        const start = saData.shape.points[0];
        ctx.moveTo(center + start.x*step, center - start.y*step);
        for(let i = 1; i < saData.shape.points.length; i++) {
            const p = saData.shape.points[i];
            ctx.lineTo(center + p.x*step, center - p.y*step);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

window.checkSaIdentify = function() {
    const userType = document.getElementById('sa-shape-select').value;
    const fb = document.getElementById('sa-feedback');

    if (!userType) {
        fb.style.color = "#dc2626";
        fb.innerText = "Please select a shape.";
        return;
    }

    if (userType === saData.shape.type) {
        fb.style.color = "#16a34a";
        fb.innerText = "✅ Correct!";
        
        let change = saData.errors.identify === 0 ? 1 : 0;
        updateSaSubScore('sa_identify', change);

        saData.step = 3;
        setTimeout(renderSaUI, 1000);
    } else {
        saData.errors.identify++;
        fb.style.color = "#dc2626";
        fb.innerText = "❌ Incorrect. Look closely at the parallel lines and side lengths!";
    }
};

window.checkSaArea = function() {
    const userArea = parseFloat(document.getElementById('sa-area-input').value);
    const fb = document.getElementById('sa-feedback');

    if (isNaN(userArea)) {
        fb.style.color = "#dc2626";
        fb.innerText = "Please enter a number.";
        return;
    }

    if (Math.abs(userArea - saData.shape.area) < 0.1) {
        fb.style.color = "#16a34a";
        fb.innerText = "✅ Area is Correct!";

        let change = saData.errors.area === 0 ? 1 : 0;
        updateSaSubScore('sa_area', change);

        // Update Main Score if the entire round was mostly clean (max 1 error total allowed for full credit)
        let totalErrors = saData.errors.plot + saData.errors.identify + saData.errors.area;
        if (totalErrors <= 1) {
            updateSaSubScore('ShapeArea', 1);
        }

        saData.round++;
        setTimeout(() => {
            if (saData.round > saData.maxRounds) finishSaGame();
            else startSaRound();
        }, 1500);

    } else {
        saData.errors.area++;
        fb.style.color = "#dc2626";
        let hint = "";
        if (saData.shape.type === 'trapezoid') hint = "<br><span style='font-size:12px; color:#92400e;'>Hint: Area = ½ × (base1 + base2) × height</span>";
        else hint = "<br><span style='font-size:12px; color:#92400e;'>Hint: Count the units for the base and the straight-up height!</span>";
        fb.innerHTML = `❌ Incorrect Area.${hint}`;
    }
};

function updateSaSubScore(col, amt) {
    if (!window.userMastery) window.userMastery = {};
    let current = window.userMastery[col] || 0;
    let next = Math.max(0, Math.min(10, current + amt));
    window.userMastery[col] = next;

    if (window.supabaseClient && window.currentUser) {
        const h = sessionStorage.getItem('target_hour') || "00";
        window.supabaseClient.from('assignment7')
            .update({ [col]: next })
            .eq('userName', window.currentUser)
            .eq('hour', h)
            .then(({error}) => { if (error) console.error("DB update failed:", error); });
    }
}

function finishSaGame() {
    window.isCurrentQActive = false; 
    const qContent = document.getElementById('q-content');
    
    qContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; animation: fadeIn 0.5s;">
            <div style="font-size:60px; margin-bottom:15px;">📏</div>
            <h2 style="color:#1e293b; margin:0 0 10px 0;">Geometry Complete!</h2>
            <p style="color:#64748b; font-size:16px;">Loading next skill...</p>
        </div>
    `;

    setTimeout(() => { 
        if (typeof window.loadNextQuestion === 'function') {
            window.loadNextQuestion(); 
        } else {
            location.reload(); 
        }
    }, 2500);
}
