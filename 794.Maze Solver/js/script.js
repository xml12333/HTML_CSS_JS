class MazeGrid {
  constructor() {
    // Maze difficulty (1-10): Controls maze complexity and size
    this.mazeDifficulty = 5;

    // Derived maze parameters
    this.cellSize = Math.max(20, 60 - this.mazeDifficulty * 4); // Range: 20px to 56px
    this.minDistance = Math.max(10, Math.floor(this.mazeDifficulty * 2.5)); // Range: 10 to 25

    // Animation timing (milliseconds)
    this.solveDelay = 20;
    this.generationDelay = 0.5;

    // State initialization
    this.container = document.getElementById("maze-grid");
    this.maze = [];
    this.cells = []; // Cache for cell elements (2D array)
    this.continueGeneration = true;

    this.initializeGrid();

    // Debounced resize listener so the maze always fits its container
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.initializeGrid(), 200);
  }

  async initializeGrid() {
    // Get container dimensions
    const {
      width: gridWidth,
      height: gridHeight
    } = this.container.getBoundingClientRect();

    // Determine number of columns and rows based on the cell size
    this.cols = Math.floor(gridWidth / this.cellSize);
    this.rows = Math.floor(gridHeight / this.cellSize);

    // Ensure odd dimensions (often desirable for maze algorithms)
    if (this.rows % 2 === 0) this.rows--;
    if (this.cols % 2 === 0) this.cols--;

    // Set CSS grid template to enforce fixed cell sizes
    this.container.style.gridTemplateColumns = `repeat(${this.cols}, ${this.cellSize}px)`;
    this.container.style.gridTemplateRows = `repeat(${this.rows}, ${this.cellSize}px)`;

    // Clear container and cached cell array
    this.container.innerHTML = "";
    this.cells = [];

    // Initialize maze state array and create DOM cells
    this.maze = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({
        visited: false,
        walls: { top: true, right: true, bottom: true, left: true },
        inMaze: false
      }))
    );

    for (let row = 0; row < this.rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const cell = document.createElement("div");
        cell.className = "maze-cell wall-top wall-right wall-bottom wall-left";
        cell.dataset.row = row;
        cell.dataset.col = col;
        this.container.appendChild(cell);
        this.cells[row][col] = cell;
      }
    }

    try {
      await this.startInfiniteMaze();
    } catch (error) {
      console.error("Error during maze generation or solving:", error);
    }
  }

  async startInfiniteMaze() {
    // Generate initial maze and then continually solve and extend it.
    await this.generateMaze();

    while (this.continueGeneration) {
      await this.delay(500);
      await this.solveMaze();
      await this.delay(1000);

      // Promote the current end cell to be the new start
      this.start = { ...this.end };
      const startCell = this.getCellElement(this.start.row, this.start.col);
      startCell.classList.remove("end");
      startCell.classList.add("start");

      // Clear solved path/visited classes but keep the start highlighted
      this.clearSolutionKeepStart();

      // Generate the next maze segment, keeping the current start cell in place.
      await this.generateMaze(true);
    }
  }

  clearSolutionKeepStart() {
    // Iterate over our cached cells rather than using querySelectorAll.
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (row !== this.start.row || col !== this.start.col) {
          this.cells[row][col].classList.remove("visited", "path", "end");
        } else {
          this.cells[row][col].classList.add("start");
        }
      }
    }
  }

  async generateMaze(keepStart = false) {
    // Reset maze state (except for the start if desired)
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!keepStart || row !== this.start.row || col !== this.start.col) {
          this.maze[row][col].inMaze = false;
          this.maze[row][col].visited = false;
          this.maze[row][col].walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
          };
          this.cells[row][col].className =
            "maze-cell wall-top wall-right wall-bottom wall-left";
        }
      }
    }

    if (keepStart) {
      this.maze[this.start.row][this.start.col].inMaze = true;
    }

    const startRow = keepStart
      ? this.start.row
      : 1 + 2 * Math.floor(Math.random() * ((this.rows - 1) / 2));
    const startCol = keepStart
      ? this.start.col
      : 1 + 2 * Math.floor(Math.random() * ((this.cols - 1) / 2));
    const walls = [];
    this.addWalls(startRow, startCol, walls);

    // Process walls in chunks to keep the UI responsive.
    await new Promise(async (resolve) => {
      const processChunk = async () => {
        const chunkSize = 20;
        let processed = 0;
        while (walls.length && processed < chunkSize) {
          const randomIndex = Math.floor(Math.random() * walls.length);
          const [wallRow, wallCol, direction] = walls.splice(randomIndex, 1)[0];
          const [nextRow, nextCol] = this.getCellInDirection(
            wallRow,
            wallCol,
            direction
          );

          if (
            this.isValidCell(nextRow, nextCol) &&
            !this.maze[nextRow][nextCol].inMaze
          ) {
            this.removeWall(wallRow, wallCol, direction);
            this.maze[nextRow][nextCol].inMaze = true;
            this.addWalls(nextRow, nextCol, walls);
            await this.delay(this.generationDelay);
          }
          processed++;
        }
        if (walls.length) {
          await this.delay(0);
          await processChunk();
        } else {
          keepStart ? this.selectNewEndPoint() : this.selectPoints();
          resolve();
        }
      };
      await processChunk();
    });
  }

  selectNewEndPoint() {
    if (this.end) {
      this.getCellElement(this.end.row, this.end.col).classList.remove("end");
    }
    let attempts = 0,
      maxAttempts = 100;
    while (attempts < maxAttempts) {
      const endRow = Math.floor(Math.random() * this.rows);
      const endCol = Math.floor(Math.random() * this.cols);
      const distance = this.getManhattanDistance(
        this.start.row,
        this.start.col,
        endRow,
        endCol
      );
      if (distance >= this.minDistance) {
        this.end = { row: endRow, col: endCol };
        this.getCellElement(endRow, endCol).classList.add("end");
        return;
      }
      attempts++;
    }
    // Fallback: choose the farthest corner
    const corners = [
      [0, 0],
      [0, this.cols - 1],
      [this.rows - 1, 0],
      [this.rows - 1, this.cols - 1]
    ];
    let maxDistance = 0,
      bestCorner = corners[0];
    for (const [row, col] of corners) {
      const distance = this.getManhattanDistance(
        this.start.row,
        this.start.col,
        row,
        col
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        bestCorner = [row, col];
      }
    }
    this.end = { row: bestCorner[0], col: bestCorner[1] };
    this.getCellElement(bestCorner[0], bestCorner[1]).classList.add("end");
  }

  addWalls(row, col, walls) {
    const directions = ["top", "right", "bottom", "left"];
    for (const direction of directions) {
      const [nextRow, nextCol] = this.getCellInDirection(row, col, direction);
      if (
        this.isValidCell(nextRow, nextCol) &&
        !this.maze[nextRow][nextCol].inMaze
      ) {
        walls.push([row, col, direction]);
      }
    }
  }

  getCellInDirection(row, col, direction) {
    switch (direction) {
      case "top":
        return [row - 1, col];
      case "right":
        return [row, col + 1];
      case "bottom":
        return [row + 1, col];
      case "left":
        return [row, col - 1];
    }
  }

  removeWall(row, col, direction) {
    if (!this.isValidCell(row, col)) return;
    this.maze[row][col].walls[direction] = false;
    this.getCellElement(row, col).classList.remove(`wall-${direction}`);

    const [nextRow, nextCol] = this.getCellInDirection(row, col, direction);
    if (this.isValidCell(nextRow, nextCol)) {
      const opposite = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right"
      }[direction];
      this.maze[nextRow][nextCol].walls[opposite] = false;
      this.getCellElement(nextRow, nextCol).classList.remove(
        `wall-${opposite}`
      );
    }
  }

  isValidCell(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  selectPoints() {
    this.clearPoints();

    const startThird = Math.floor(this.rows / 3);
    this.start = {
      row: this.getRandomInt(0, startThird),
      col: this.getRandomInt(0, this.cols)
    };

    const endThird = Math.floor((this.rows * 2) / 3);
    let endRow, endCol;
    do {
      endRow = this.getRandomInt(endThird, this.rows);
      endCol = this.getRandomInt(0, this.cols);
    } while (
      this.getManhattanDistance(
        this.start.row,
        this.start.col,
        endRow,
        endCol
      ) < this.minDistance
    );

    this.end = { row: endRow, col: endCol };
    this.getCellElement(this.start.row, this.start.col).classList.add("start");
    this.getCellElement(this.end.row, this.end.col).classList.add("end");
  }

  getRandomInt(min, max) {
    return (
      Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min))) +
      Math.ceil(min)
    );
  }

  getManhattanDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
  }

  // Return the cached cell element at (row, col)
  getCellElement(row, col) {
    return this.cells[row][col];
  }

  clearPoints() {
    if (this.start)
      this.getCellElement(this.start.row, this.start.col).classList.remove(
        "start"
      );
    if (this.end)
      this.getCellElement(this.end.row, this.end.col).classList.remove("end");
    this.start = this.end = null;
  }

  async solveMaze() {
    if (this.solving) return;
    this.solving = true;

    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${this.start.row},${this.start.col}`;
    const endKey = `${this.end.row},${this.end.col}`;

    openSet.enqueue(startKey, 0);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(this.start.row, this.start.col));

    let iterations = 0,
      maxIterations = this.rows * this.cols;
    while (!openSet.isEmpty() && iterations++ < maxIterations) {
      const currentKey = openSet.dequeue();
      if (currentKey === endKey) {
        await this.reconstructPath(cameFrom, currentKey);
        this.solving = false;
        return;
      }

      closedSet.add(currentKey);
      const [curRow, curCol] = currentKey.split(",").map(Number);

      if (currentKey !== startKey && currentKey !== endKey) {
        this.getCellElement(curRow, curCol).classList.add("visited");
        await this.delay(this.solveDelay);
      }

      for (const [nextRow, nextCol] of this.getValidNeighbors(curRow, curCol)) {
        const neighborKey = `${nextRow},${nextCol}`;
        if (closedSet.has(neighborKey)) continue;

        const tentativeG = gScore.get(currentKey) + 1;
        if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeG);
          const f = tentativeG + this.heuristic(nextRow, nextCol);
          fScore.set(neighborKey, f);
          if (!openSet.contains(neighborKey)) {
            openSet.enqueue(neighborKey, f);
          }
        }
      }
    }
    this.solving = false;
  }

  getValidNeighbors(row, col) {
    const neighbors = [];
    const { walls } = this.maze[row][col];
    if (!walls.top && row > 0) neighbors.push([row - 1, col]);
    if (!walls.right && col < this.cols - 1) neighbors.push([row, col + 1]);
    if (!walls.bottom && row < this.rows - 1) neighbors.push([row + 1, col]);
    if (!walls.left && col > 0) neighbors.push([row, col - 1]);
    return neighbors;
  }

  heuristic(row, col) {
    return this.getManhattanDistance(row, col, this.end.row, this.end.col);
  }

  async reconstructPath(cameFrom, currentKey) {
    const path = [currentKey];
    while (cameFrom.has(currentKey)) {
      currentKey = cameFrom.get(currentKey);
      path.unshift(currentKey);
    }
    for (const key of path) {
      const [row, col] = key.split(",").map(Number);
      if (
        (row !== this.start.row || col !== this.start.col) &&
        (row !== this.end.row || col !== this.end.col)
      ) {
        this.getCellElement(row, col).classList.add("path");
        await this.delay(this.solveDelay * 2);
      }
    }
  }

  clearSolution() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col].classList.remove("visited", "path");
      }
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.bubbleUp();
  }

  dequeue() {
    const min = this.values[0];
    const end = this.values.pop();
    if (this.values.length > 0) {
      this.values[0] = end;
      this.sinkDown(0);
    }
    return min?.val;
  }

  bubbleUp() {
    let idx = this.values.length - 1;
    while (idx > 0) {
      let parentIdx = Math.floor((idx - 1) / 2);
      if (this.values[parentIdx].priority <= this.values[idx].priority) break;
      [this.values[parentIdx], this.values[idx]] = [
        this.values[idx],
        this.values[parentIdx]
      ];
      idx = parentIdx;
    }
  }

  sinkDown(idx) {
    const length = this.values.length;
    while (true) {
      let swap = null;
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      if (
        left < length &&
        this.values[left].priority < this.values[idx].priority
      ) {
        swap = left;
      }
      if (
        right < length &&
        ((swap === null &&
          this.values[right].priority < this.values[idx].priority) ||
          (swap !== null &&
            this.values[right].priority < this.values[left].priority))
      ) {
        swap = right;
      }
      if (swap === null) break;
      [this.values[idx], this.values[swap]] = [
        this.values[swap],
        this.values[idx]
      ];
      idx = swap;
    }
  }

  isEmpty() {
    return this.values.length === 0;
  }

  contains(val) {
    return this.values.some((item) => item.val === val);
  }
}

// Initialize when the DOM is ready.
document.addEventListener("DOMContentLoaded", () => new MazeGrid());