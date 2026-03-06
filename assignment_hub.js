// --- Configuration & Supabase Init ---
const SB_URL = "https://khazeoycsjdqnmwodncw.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoYXplb3ljc2pkcW5td29kbmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MDMwOTMsImV4cCI6MjA3ODQ3OTA5M30.h-WabaGcQZ968sO2ImetccUaRihRFmO2mUKCdPiAbEI";
const isAssignmentPage = window.location.pathname.includes('assignment.html');

if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(SB_URL, SB_KEY);
}

// --- Dynamic Time Requirements ---
const timeRequirements = {
    'default': 12 * 60,
    'C5Review': 2100 // 35 minutes in seconds
};

// Global State
window.totalSecondsWorked = 0; 
window.isCurrentQActive = false;
window.currentQSeconds = 0;
window.currentUser = sessionStorage.getItem('target_user') || 'test_user';

let reqLesson = sessionStorage.getItem('target_lesson');
window.targetLesson = reqLesson || '5.2.2'; // Default to 5.2.2

window.lastActivity = Date.now();
window.isIdle = false;
window.hasDonePrimaryLesson = false;
window.skillsCompletedThisSession = []; 
window.canCount = false; 
window.resumeTimeout = null;
window.isWindowLargeEnough = true;
window.hasLoadedTime = false; 

window.isFreePlay = sessionStorage.getItem('free_play_mode') === 'true';
window.currentHour = sessionStorage.getItem('target_hour');

// --- Activity Reset Logic ---
['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
        window.lastActivity = Date.now();
        if (window.isIdle) {
            window.isIdle = false;
            console.log("Activity detected: System Awake");
            const statePill = document.getElementById('timer-state-pill');
            if (statePill) {
                statePill.innerText = "RUNNING";
                statePill.style.background = "#22c55e";
            }
        }
    });
});

console.log("Session Loaded:", window.currentUser, window.currentHour);
const GOAL_SECONDS = timeRequirements[window.targetLesson] || timeRequirements['default'];

// --- Window Size Checker Function ---
function checkWindowSize() {
    if (!isAssignmentPage) {
        window.isWindowLargeEnough = true;
        return;
    }
    const winWidth = window.outerWidth;
    const winHeight = window.outerHeight;
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    const overlay = document.getElementById('size-overlay');

    if (winWidth < (screenWidth * 0.8) || winHeight < (screenHeight * 0.8)) {
        window.isWindowLargeEnough = false;
        if (overlay) overlay.classList.add('active');
    } else {
        window.isWindowLargeEnough = true;
        if (overlay) overlay.classList.remove('active');
    }
}

window.onblur = () => { window.canCount = false; clearTimeout(window.resumeTimeout); };
window.onfocus = () => {
    clearTimeout(window.resumeTimeout);
    if (isAssignmentPage) window.resumeTimeout = setTimeout(() => { window.canCount = true; }, 5000);
    else window.canCount = true;
};

window.addEventListener('resize', checkWindowSize);
checkWindowSize();

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { window.canCount = false; clearTimeout(window.resumeTimeout); }
});

if (!isAssignmentPage) window.canCount = true; 
else window.resumeTimeout = setTimeout(() => { window.canCount = true; }, 5000);

// --- The Master Timer Loop ---
setInterval(() => {
    if (!isAssignmentPage || !window.hasLoadedTime) return;

    const statePill = document.getElementById('timer-state-pill');
    const totalDisplay = document.getElementById('debug-total-time');
    
    const secondsSinceLastActivity = (Date.now() - window.lastActivity) / 1000;
    if (secondsSinceLastActivity > 60) window.isIdle = true;

    const qContent = document.getElementById('q-content');
    const hasQuestion = qContent && qContent.innerHTML.length > 50 && !qContent.innerText.includes("Wait...");

    if (window.isCurrentQActive && window.canCount && hasQuestion && !window.isIdle && window.isWindowLargeEnough) {
        window.totalSecondsWorked++;
        window.currentQSeconds++;
        
        const remaining = Math.max(0, GOAL_SECONDS - window.totalSecondsWorked);
        let mins = Math.floor(remaining / 60);
        let secs = remaining % 60;
        
        if (totalDisplay) totalDisplay.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        
        if (window.totalSecondsWorked % 10 === 0) syncTimerToDB();

        if (statePill) {
            statePill.innerText = "RUNNING";
            statePill.style.background = "#22c55e";
        }
        
        if (window.totalSecondsWorked >= GOAL_SECONDS && !window.isFreePlay) finishAssignment();
    } else {
        if (statePill) {
            if (!window.isWindowLargeEnough) { statePill.innerText = "RESTORE WINDOW SIZE"; statePill.style.background = "#7c3aed"; } 
            else if (!hasQuestion) { statePill.innerText = "NO QUESTION"; statePill.style.background = "#64748b"; } 
            else if (window.isIdle) { statePill.innerText = "IDLE PAUSE"; statePill.style.background = "#f59e0b"; } 
            else if (!window.canCount) { statePill.innerText = "PLEASE WAIT..."; statePill.style.background = "#3b82f6"; } 
            else { statePill.innerText = "PAUSED"; statePill.style.background = "#ef4444"; }
        }
    }
}, 1000);

// --- DB Persistence Sync ---
async function syncTimerToDB() {
    const currentHour = sessionStorage.getItem('target_hour') || "00";
    const timerCol = `${window.targetLesson}Timer`;
    const update = { [timerCol]: window.totalSecondsWorked };
    // STRICTLY assignment7
    try { await window.supabaseClient.from('assignment7').update(update).eq('userName', window.currentUser).eq('hour', currentHour); } 
    catch (e) { console.error("Sync error", e); }
}

// --- Adaptive Routing & DB Check/Create Logic ---
async function loadNextQuestion() {
    if (window.isCurrentQActive) return;
    window.isCurrentQActive = true; 
    window.currentQSeconds = 0; 
    
    const feedback = document.getElementById('feedback-box');
    if(feedback) { feedback.style.display = 'none'; feedback.className = ''; }
    window.scrollTo(0,0);

    const currentHour = sessionStorage.getItem('target_hour') || "00";
    let userData = null; 

    // --- Resilient Database Fetch (assignment7) ---
    try {
        let { data, error } = await window.supabaseClient
            .from('assignment7')
            .select('*')
            .eq('userName', window.currentUser)
            .eq('hour', currentHour)
            .maybeSingle();

        if (!data && !error) {
            console.warn(`User ${window.currentUser} not found. Creating record...`);
            await window.supabaseClient.from('assignment7').insert([{ 
                userName: window.currentUser, 
                hour: currentHour, 
                [window.targetLesson]: false,
                [`${window.targetLesson}Timer`]: 0
            }]);
            
            const { data: refreshed } = await window.supabaseClient
                .from('assignment7').select('*')
                .eq('userName', window.currentUser).eq('hour', currentHour).maybeSingle();
            data = refreshed;
        }

        if (data) {
            userData = data; 
            const timerCol = `${window.targetLesson}Timer`;
            
            if (data[window.targetLesson] === true) {
                if (window.isFreePlay) window.totalSecondsWorked = Math.max(0, (data[timerCol] || 0) - 30); 
                else window.totalSecondsWorked = Math.max(GOAL_SECONDS, data[timerCol] || 0);
            } else {
                const savedTime = data[timerCol] || 0;
                window.totalSecondsWorked = Math.max(0, savedTime - 30); 
            }
        }
    } catch (err) { console.error("DB Initialization Error:", err); } 
    finally { window.hasLoadedTime = true; }

    // --- Safe Routing Execution (7th Grade Skills Only) ---
    try {
        const skillMap = [
            { id: 'SolveX', fn: typeof initSolveXGame !== 'undefined' ? initSolveXGame : null },
            { id: 'BoxPlot', fn: typeof initBoxPlotGame !== 'undefined' ? initBoxPlotGame : null },
            { id: 'ComplexShapes', fn: typeof initComplexShapesGame !== 'undefined' ? initComplexShapesGame : null },
            { id: 'Graphing', fn: typeof initGraphingGame !== 'undefined' ? initGraphingGame : null },
            { id: 'DiamondMath', fn: typeof initDiamondMath !== 'undefined' ? initDiamondMath : null },
            { id: 'Prob522', fn: typeof initProbGame !== 'undefined' ? initProbGame : null },
            { id: 'ProbOr', fn: typeof initProbOrGame !== 'undefined' ? initProbOrGame : null },
            { id: 'Substitution', fn: typeof initSubstitutionGame !== 'undefined' ? initSubstitutionGame : null },
            { id: 'ShapeArea', fn: typeof initShapeAreaGame !== 'undefined' ? initShapeAreaGame : null },
            { id: 'DependentProb', fn: typeof initDependentGame !== 'undefined' ? initDependentGame : null },
            { id: 'SampleSpace', fn: typeof initSampleSpaceGame !== 'undefined' ? initSampleSpaceGame : null },
            { id: 'AlgebraTiles', fn: typeof initAlgebraTiles !== 'undefined' ? initAlgebraTiles : null },
            { id: 'SimplifyExpr', fn: typeof initSimplifyGame !== 'undefined' ? initSimplifyGame : null },
            { id: 'ProbTable', fn: typeof initProbTableGame !== 'undefined' ? initProbTableGame : null },
            { id: 'MixtureRatio', fn: typeof initMixtureRatioGame !== 'undefined' ? initMixtureRatioGame : null },
            { id: 'Prob525', fn: typeof initProb525Game !== 'undefined' ? initProb525Game : null },
            { id: 'SpinnerFrac', fn: typeof initSpinnerFracGame !== 'undefined' ? initSpinnerFracGame : null },
            { id: 'AreaPerimeter', fn: typeof initAreaPerimeterGame !== 'undefined' ? initAreaPerimeterGame : null },
            { id: 'PerimeterExpr', fn: typeof initPerimeterExprGame !== 'undefined' ? initPerimeterExprGame : null },
            { id: 'ProportionsWeb', fn: typeof initProportionsWebGame !== 'undefined' ? initProportionsWebGame : null },
            { id: 'PortionsWeb', fn: typeof initPortionsWebGame !== 'undefined' ? initPortionsWebGame : null },
            { id: 'DiscountFrac', fn: typeof initDiscountFracGame !== 'undefined' ? initDiscountFracGame : null },
            { id: 'ExpressionMats', fn: typeof initExpressionMatsGame !== 'undefined' ? initExpressionMatsGame : null },
            { id: 'Process5D', fn: typeof initProcess5DGame !== 'undefined' ? initProcess5DGame : null },
            { id: 'CompareProb', fn: typeof initCompareProbGame !== 'undefined' ? initCompareProbGame : null },
            { id: 'OrderOfOps', fn: typeof initOrderOfOpsGame !== 'undefined' ? initOrderOfOpsGame : null },
            { id: 'FindMissing', fn: typeof initFindMissingGame !== 'undefined' ? initFindMissingGame : null },
            { id: 'PercentDiagram', fn: typeof initPercentDiagramGame !== 'undefined' ? initPercentDiagramGame : null },
            { id: 'FractionOps', fn: typeof initFractionOpsGame !== 'undefined' ? initFractionOpsGame : null },
            { id: 'UnitRates', fn: typeof initUnitRatesGame !== 'undefined' ? initUnitRatesGame : null },
            { id: 'ReversePercent', fn: typeof initReversePercentGame !== 'undefined' ? initReversePercentGame : null },
            { id: 'TreeDiagrams', fn: typeof initTreeDiagramsGame !== 'undefined' ? initTreeDiagramsGame : null },
            { id: 'IdentifyProportions', fn: typeof initIdentifyProportionsGame !== 'undefined' ? initIdentifyProportionsGame : null },
            { id: 'C5Review', fn: typeof initC5ReviewGame !== 'undefined' ? initC5ReviewGame : null }
        ].filter(s => s.fn !== null);

        if (skillMap.length === 0) {
            console.error("No skill scripts loaded.");
            window.isCurrentQActive = false;
            return;
        }

        // --- FIXED: Added the missing comma after FindMissing ---
        const curriculumSequence = [
            'DiamondMath',
            'SolveX',
            'OrderOfOps',
            'PortionsWeb',
            'PercentDiagram',
            'FractionOps',
            'Graphing',
            'BoxPlot',
            'UnitRates',
            'ShapeArea',
            'ReversePercent',
            'TreeDiagrams',
            'IdentifyProportions',
            'AreaPerimeter',
            'ComplexShapes',
            'Substitution',
            'AlgebraTiles',
            'DiscountFrac',
            'ProportionsWeb',
            'ExpressionMats',
            'SimplifyExpr', 
            'Prob522', 
            'ProbOr',
            'DependentProb', 
            'SampleSpace',
            'ProbTable', 
            'MixtureRatio',
            'SpinnerFrac',
            'Prob525',
            'PerimeterExpr',
            'Process5D',
            'CompareProb',
            'FindMissing', // <-- Comma added here
            'C5Review'
        ];

        // --- FIXED: Standardized the C5Review anchor key ---
        const lessonAnchors = {
            '5.2.1': 'SimplifyExpr',
            '5.2.2': 'Prob522',
            '5.2.3': 'DependentProb',
            '5.2.4': 'ProbTable',
            '5.2.5': 'Prob525',
            '5.3.1': 'PerimeterExpr',
            '5.3.3': 'Process5D',
            '5.3.4': 'FindMissing',
            'C5Review': 'C5Review' // <-- Standardized to match the timeRequirements dictionary
        };

        const primarySkillId = lessonAnchors[window.targetLesson];

        if (primarySkillId) {
            
            // Calculate the ceiling based on the sequence array
            const maxAllowedIndex = curriculumSequence.indexOf(primarySkillId);

            if (!window.hasDonePrimaryLesson) {
                window.hasDonePrimaryLesson = true;
                const primarySkill = skillMap.find(s => s.id === primarySkillId);
                if (primarySkill) {
                    window.skillsCompletedThisSession.push(primarySkillId);
                    return primarySkill.fn();
                }
            }

            // Filter out FUTURE skills (above the ceiling) and already completed skills
            let availableSkills = skillMap.filter(s => {
                const skillIndex = curriculumSequence.indexOf(s.id);
                const isNotFuture = skillIndex > -1 && skillIndex <= maxAllowedIndex;
                const isNotDoneToday = !window.skillsCompletedThisSession.includes(s.id);
                return isNotFuture && isNotDoneToday;
            });
            
            // If they exhausted all previous skills, loop back to the beginning of the allowed list
            if (availableSkills.length === 0) {
                window.skillsCompletedThisSession = [];
                availableSkills = skillMap.filter(s => {
                    const skillIndex = curriculumSequence.indexOf(s.id);
                    return skillIndex > -1 && skillIndex <= maxAllowedIndex;
                });
            }

            // Sort by lowest mastery score using their loaded DB info
            availableSkills.sort((a, b) => {
                const scoreA = userData ? (userData[a.id] || 0) : 0;
                const scoreB = userData ? (userData[b.id] || 0) : 0;
                return scoreA - scoreB;
            });

            const nextSkill = availableSkills[0];
            
            if (!nextSkill) {
                window.isCurrentQActive = false;
                return;
            }

            window.skillsCompletedThisSession.push(nextSkill.id);
            nextSkill.fn(); 

        } else {
            document.getElementById('q-title').innerText = "Under Construction";
            document.getElementById('q-content').innerHTML = `Lesson ${window.targetLesson} is not yet available.`;
            window.isCurrentQActive = false;
        }
    } catch (err) {
        console.error("Error executing skill script:", err);
        window.isCurrentQActive = false; 
    }
}

async function finishAssignment() {
    window.isCurrentQActive = false;
    const currentHour = sessionStorage.getItem('target_hour') || "00";
    const timerCol = `${window.targetLesson}Timer`;

    const updateObj = {
        [window.targetLesson]: true,
        [timerCol]: Math.max(GOAL_SECONDS, window.totalSecondsWorked)
    };

    // STRICTLY assignment7
    try {
        await window.supabaseClient
            .from('assignment7')
            .update(updateObj)
            .eq('userName', window.currentUser)
            .eq('hour', currentHour);

        document.getElementById('work-area').innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 12px; border: 2px solid #22c55e;">
                <h1 style="color: #22c55e;">Goal Reached!</h1>
                <p>Your ${GOAL_SECONDS / 60} minutes of practice for <strong>${window.targetLesson}</strong> are complete.</p>
                <button onclick="sessionStorage.setItem('free_play_mode', 'true'); location.reload()" class="primary-btn">Keep Practicing (Free Play)</button>
            </div>
        `;
    } catch (err) { console.error("Error saving completion:", err); }
}

window.onload = loadNextQuestion;
