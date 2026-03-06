/**
 * skill_c5review.js
 * - 7th Grade: Chapter 5 Test Review Router
 * - Randomly pools from the exact skills assessed on the Chapter 5 Individual Test.
 * - Extends the session timer to 30 minutes.
 */

console.log("🚀 skill_c5review.js LIVE (Chapter 5 Review Router)");

(function() {
    window.initC5ReviewGame = function() {
        // The exact skills mapped to the Chapter 5 Individual Assessment
        const c5Skills = [
            'ReversePercent',      // Q1: Babe Ruth Bat 
            'DependentProb',       // Q2, Q7, Q8: Probability
            'TreeDiagrams',        // Q3: Mongolian Bar-B-Que Sample Space
            'Process5D',           // Q4: Parallelogram Area
            'FractionOps',         // Q5a: Fraction Operations
            'OrderOfOps',          // Q5b: PEMDAS
            'SimplifyExpr',        // Q5c: Combine Like Terms
            'PercentDiagram',      // Q5d: Percent of a Number
            'IdentifyProportions'  // Q6: Proportional Relationships
        ];

        // Override the standard timer for this specific review (30 mins = 1800 seconds)
        if (typeof window.targetSeconds !== 'undefined') window.targetSeconds = 1800;
        if (typeof window.requiredSeconds !== 'undefined') window.requiredSeconds = 1800;
        
        // Pick a random skill from the pool
        const targetSkill = c5Skills[Math.floor(Math.random() * c5Skills.length)];
        console.log("🎯 C5 Review routing to:", targetSkill);

        // Execute the chosen skill's init function
        let fnToCall = window['init' + targetSkill + 'Game'];
        
        // Catch the modules that have slightly different naming conventions in 7th Grade
        if (targetSkill === 'SimplifyExpr') fnToCall = window.initSimplifyGame;
        
        if (typeof fnToCall === 'function') {
            // Launch the actual game
            fnToCall();
            
            // Override the title slightly delayed so they know they are in the review
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
