class AlgebraTileSkill {
    /**
     * @param {string} canvasId - The ID of the HTML canvas element.
     * @param {boolean} allowX2 - Whether to include x^2 tiles.
     */
    constructor(canvasId, allowX2 = true) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.allowX2 = allowX2;
        this.currentProblem = null;
        
        // Visual settings for drawing
        this.tileSize = 30; // base pixel size for 1 unit
        this.xScale = 3;    // how many units long the 'x' dimension is visually
    }

    generateProblem() {
        // 1. Generate random tile counts
        const x2Count = this.allowX2 ? Math.floor(Math.random() * 3) : 0;
        const xCount = Math.floor(Math.random() * 4) + 1;
        const numUnitColumns = Math.floor(Math.random() * 3) + 1;
        
        const unitColumns = [];
        let currentHeight = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numUnitColumns; i++) {
            unitColumns.push(currentHeight);
            currentHeight = Math.floor(Math.random() * currentHeight) + 1; 
        }

        const totalUnitTiles = unitColumns.reduce((sum, val) => sum + val, 0);

        // 2. Build expressions
        let areaParts = [];
        if (x2Count > 0) areaParts.push(x2Count === 1 ? 'x^2' : `${x2Count}x^2`);
        if (xCount > 0) areaParts.push(xCount === 1 ? 'x' : `${xCount}x`);
        if (totalUnitTiles > 0) areaParts.push(`${totalUnitTiles}`);
        
        const xCoefficient = (2 * x2Count) + 2;
        const constantTerm = 2 * (xCount + numUnitColumns);

        let perimParts = [];
        perimParts.push(xCoefficient === 1 ? 'x' : `${xCoefficient}x`);
        if (constantTerm > 0) perimParts.push(`${constantTerm}`);

        // Store current state
        this.currentProblem = {
            x2Count, xCount, unitColumns, totalUnitTiles,
            areaString: areaParts.join(' + '),
            perimeterString: perimParts.join(' + '),
            xCoefficient, constantTerm
        };

        if (this.ctx) this.drawShape();
        return this.currentProblem;
    }

    drawShape() {
        if (!this.ctx || !this.currentProblem) return;
        
        // Clear previous drawing
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const { x2Count, xCount, unitColumns } = this.currentProblem;
        const u = this.tileSize;
        const xLen = u * this.xScale;
        
        // Start drawing from bottom-left corner with some padding
        let startX = 20;
        let startY = this.canvas.height - 20; 

        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#ccc';
        this.ctx.lineWidth = 1;

        // Draw x^2 tiles (Large squares)
        for (let i = 0; i < x2Count; i++) {
            this.ctx.fillRect(startX, startY - xLen, xLen, xLen);
            this.ctx.strokeRect(startX, startY - xLen, xLen, xLen);
            
            // Label
            this.ctx.fillStyle = '#000';
            this.ctx.font = '16px serif';
            this.ctx.fillText('x^2', startX + xLen/2 - 10, startY - xLen/2 + 5);
            this.ctx.fillStyle = '#ccc'; // reset
            
            startX += xLen;
        }

        // Draw x tiles (Tall rectangles)
        for (let i = 0; i < xCount; i++) {
            this.ctx.fillRect(startX, startY - xLen, u, xLen);
            this.ctx.strokeRect(startX, startY - xLen, u, xLen);
            
            // Label
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'italic 16px serif';
            this.ctx.fillText('x', startX + u/2 - 4, startY - xLen/2 + 5);
            this.ctx.fillStyle = '#ccc'; // reset
            
            startX += u;
        }

        // Draw unit tiles (Small squares in columns)
        for (let col = 0; col < unitColumns.length; col++) {
            let tilesInColumn = unitColumns[col];
            let currentY = startY;
            
            for (let row = 0; row < tilesInColumn; row++) {
                this.ctx.fillRect(startX, currentY - u, u, u);
                this.ctx.strokeRect(startX, currentY - u, u, u);
                currentY -= u;
            }
            startX += u;
        }
    }

    /**
     * Checks the student's submitted answers.
     */
    checkAnswers(studentArea, studentPerimeter) {
        if (!this.currentProblem) return false;

        // Strip spaces to make string comparison more forgiving
        const cleanStr = (str) => str.replace(/\s+/g, '').toLowerCase();
        
        const isAreaCorrect = cleanStr(studentArea) === cleanStr(this.currentProblem.areaString);
        const isPerimCorrect = cleanStr(studentPerimeter) === cleanStr(this.currentProblem.perimeterString);

        return {
            areaCorrect: isAreaCorrect,
            perimeterCorrect: isPerimCorrect,
            allCorrect: isAreaCorrect && isPerimCorrect
        };
    }

    /**
     * Evaluates part B/C where the student plugs in a specific x-value.
     */
    evaluateAtX(xValue, studentCalculatedArea, studentCalculatedPerimeter) {
        if (!this.currentProblem) return false;

        const { x2Count, xCount, totalUnitTiles, xCoefficient, constantTerm, unitColumns } = this.currentProblem;

        // 1. Calculate correct mathematical values
        const correctArea = (x2Count * Math.pow(xValue, 2)) + (xCount * xValue) + totalUnitTiles;
        const correctAlgebraicPerimeter = (xCoefficient * xValue) + constantTerm;

        // 2. Calculate actual physical perimeter (handles the x = 0.5 trap)
        let actualPhysicalPerimeter;
        const maxUnitHeight = unitColumns[0];

        if (xValue >= maxUnitHeight) {
            actualPhysicalPerimeter = correctAlgebraicPerimeter; 
        } else {
            const topBottomWidth = (x2Count * xValue) + xCount + unitColumns.length;
            const rightEdge = unitColumns[unitColumns.length - 1];
            const rise = maxUnitHeight - xValue;
            const drop = maxUnitHeight - rightEdge;

            actualPhysicalPerimeter = xValue + rightEdge + (2 * topBottomWidth) + rise + drop;
        }

        // 3. Compare with student answers (converting inputs to numbers)
        const numStudentArea = Number(studentCalculatedArea);
        const numStudentPerim = Number(studentCalculatedPerimeter);

        return {
            correctArea: correctArea,
            correctPerimeter: actualPhysicalPerimeter,
            isAreaCorrect: numStudentArea === correctArea,
            // We check against the physical perimeter in case x is smaller than unit height
            isPerimeterCorrect: numStudentPerim === actualPhysicalPerimeter, 
            formulaFails: correctAlgebraicPerimeter !== actualPhysicalPerimeter
        };
    }
}
