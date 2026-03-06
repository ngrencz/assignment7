/**
 * skill_c5review.js
 * - 7th Grade: Chapter 5 Test Review Router
 * - Randomly pools from the exact skills assessed on the Chapter 5 Individual Test.
 * - Timer tracking and completion logic are strictly handled by the Global Hub.
 */

console.log("🚀 skill_c5review.js LIVE (Chapter 5 Review Router)");

(function() {
    window.initC5ReviewGame = function() {
        // The exact skills mapped to the Chapter 5 Individual Assessment
        const c5Skills = [
            'ReversePercent',      
            'DependentProb',       
            'TreeDiagrams',        
            'Process5D',           
            'FractionOps',         
            'OrderOfOps',          
            'SimplifyExpr',        
            'PercentDiagram',      
            'IdentifyProportions'  
        ];

        // Pick a random skill from the pool
        const targetSkill = c5Skills[Math.floor(Math.random() * c5Skills.length)];
        console.log("🎯 C5 Review routing to:", targetSkill);

        // Map function calls
        let fnToCall = window['init' + targetSkill + 'Game'];
        
        // Catch the modules that have slightly different naming conventions
        if (targetSkill === 'SimplifyExpr') fnToCall = window.initSimplifyGame;
        
        if (typeof fnToCall === 'function') {
            // Launch the sub-module
            fnToCall();
            
            // Override the title slightly delayed so it doesn't get overwritten by the sub-module
            setTimeout(() => {
                const titleEl = document.getElementById('q-title') || document.querySelector('h2');
                if (titleEl) {
                    titleEl.innerHTML = `⭐ Chapter 5 Test Review <br><span style="font-size:14px; color:#64748b; font-weight:normal;">Currently practicing: ${targetSkill}</span>`;
                }
            }, 150);
        } else {
            console.error(`Could not find initialization function for ${targetSkill}`);
            if (typeof window.loadNextQuestion === 'function') window.loadNextQuestion();
        }
    };
})();
