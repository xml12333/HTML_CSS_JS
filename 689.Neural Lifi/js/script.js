let resourceChar = "✦";
let resourceColor = "white";
const predatorColors = ["#FF0000", "#FF4000", "#FF8000", "#FFBF00", "#FFFF00"];
const superPredatorColors = [
  "#FF1493",
  "#FF69B4",
  "#FF85C2",
  "#FF9FCB",
  "#FFC0CB"
];
const preyColors = ["#00FFFF", "#00BFFF", "#007FFF", "#0040FF", "#0000FF"];
const normalColors = ["#2F2F2F", "#4F4F4F", "#6F6F6F", "#8F8F8F", "#AFAFAF"];
const scavengerColors = ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#F4A460"];
const explorerColors = ["#32CD32", "#00FF00", "#7CFC00", "#ADFF2F", "#9ACD32"];
const builderColors = ["#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"];
const healerColors = ["#EE82EE", "#DA70D6", "#BA55D3", "#9400D3", "#9932CC"];
const fractalColors = [
  ["#00FA9A", "#3CB371", "#2E8B57", "#008080", "#4682B4"],
  ["#4B0082", "#8A2BE2", "#9400D3", "#9932CC", "#BA55D3"],
  ["#00FFFF", "#00CED1", "#20B2AA", "#5F9EA0", "#4682B4"],
  ["#FFD700", "#FFA500", "#FF8C00", "#FF4500", "#FF0000"],
  ["#7FFF00", "#32CD32", "#228B22", "#006400", "#2E8B57"],
  ["#FF00FF", "#FF69B4", "#FF1493", "#C71585", "#8B008B"]
];

const chars = "evila∴∵⋮⋰⋱▏▎▍▌▋▊▉▲△▴▵▸▹►▻∴∵⋮⋰⋱◁◂◃◄◅▾▿▼▽▁▂▃▄▅▆▇ ";

const MAX_AGENTS = 160;
const MAX_ENERGY = 200;

const charSize = 15;
let cols, rows;
let audioContext, analyser, dataArray;
let beatHistory = [];
let beatDetected = false;
let resources = {};
let fractalEvent = null;

let generation = 0;
const populationSize = 80;
const mutationRate = 0.1;
const crossoverRate = 0.5;
let bestAgent;

const container = document.getElementById("container");
const debugPanel = document.getElementById("debugPanel");
const debugInfo = document.getElementById("debugInfo");
const toggleDebugButton = document.getElementById("toggleDebugButton");

let lastGenerationAgents = [];
let animationStarted = false;
let frameCount = 0;
const audioAnalysisThrottleInterval = 100;
let lastAudioAnalysisTime = 0;
const frameRate = 30;
let lastFrameTime = 0;

let highScoreAge = {
  predator: 0,
  prey: 0,
  normal: 0,
  "super predator": 0,
  scavenger: 0,
  explorer: 0,
  builder: 0,
  healer: 0
};

toggleDebugButton.addEventListener("click", () => {
  if (debugPanel.style.display === "block") {
    debugPanel.style.display = "none";
  } else {
    debugPanel.style.display = "block";
  }
});

function updateDebugInfo() {
  const agentTypes = ["predator", "prey", "normal", "super predator", "scavenger", "explorer", "builder", "healer"];
  let agentInfo = "";

  agentTypes.forEach((type) => {
    const typeAgents = agents.filter((agent) => agent.type === type);
    const count = typeAgents.length;
    const avgEnergy =
      typeAgents.reduce((sum, agent) => sum + agent.energy, 0) / count || 0;
    const avgAge =
      typeAgents.reduce((sum, agent) => sum + agent.age, 0) / count || 0;
    const maxAge = Math.max(...typeAgents.map((agent) => agent.age), 0);
    if (maxAge > highScoreAge[type]) {
      highScoreAge[type] = maxAge;
    }

    agentInfo += `
      <div class="agentType ${type.replace(" ", "-")}">
        <p><strong>${
          type.charAt(0).toUpperCase() + type.slice(1)
        }</strong>: ${count}</p>
        <p>Avg Energy: ${avgEnergy.toFixed(2)}</p>
        <p>Avg Age: ${avgAge.toFixed(2)}</p>
        <p>High Score Age: ${highScoreAge[type]}</p>
      </div>
    `;
  });

  const barCharts = agentTypes
    .map((type) => {
      const count = agents.filter((agent) => agent.type === type).length;
      const barClass = type.replace(" ", "-");
      return `
      <div class="barChart ${barClass}">
        <div class="bar" style="width: ${(count / MAX_AGENTS) * 100}%;"></div>
      </div>
    `;
    })
    .join("");

  debugInfo.innerHTML = `
    <p><strong>Generation</strong>: ${generation}</p>
    <p><strong>Agents</strong>: ${agents.length}</p>
    <p><strong>Resources</strong>: ${Object.keys(resources).length}</p>
    <p><strong>Fractal Event</strong>: ${
      fractalEvent ? "Active" : "Inactive"
    }</p>
    <p><strong>Beat Detected</strong>: ${beatDetected}</p>
    <div class="barContainer">
      ${barCharts}
    </div>
    ${agentInfo}
  `;
}

function getGradientColor(value, max, colors, invert = false) {
  const index = Math.floor((value / max) * (colors.length - 1));
  let color = colors[index];

  if (invert) {
    color = invertColor(color);
  }

  return color;
}

function invertColor(hex) {
  if (!hex || hex[0] !== "#" || hex.length !== 7) {
    console.warn(`Invalid color value: ${hex}`);
    return hex;
  }

  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const invertedR = 255 - r;
  const invertedG = 255 - g;
  const invertedB = 255 - b;

  const invertedHex = ((invertedR << 16) | (invertedG << 8) | (invertedB << 0))
    .toString(16)
    .padStart(6, "0");
  return `#${invertedHex}`;
}

function evaluateFitness(agent) {
  if (agent.type === "predator" || agent.type === "super predator") {
    return agent.age + agent.energy * 1.5;
  } else if (agent.type === "prey") {
    return agent.age * 2 + agent.energy;
  } else if (agent.type === "scavenger") {
    return agent.age + agent.energy;
  } else if (agent.type === "explorer") {
    return agent.age + agent.energy * 2;
  } else if (agent.type === "builder") {
    return agent.age + agent.energy + agent.constructions * 2;
  } else if (agent.type === "healer") {
    return agent.age + agent.energy + agent.healing * 2;
  } else {
    return agent.age + agent.energy;
  }
}

function selectParentsByType(type) {
  const filteredAgents = agents.filter(
    (agent) => agent.type === type && agent.nn
  );

  const previousGenAgents = lastGenerationAgents.filter(
    (agent) => agent.type === type && agent.nn
  );

  const combinedAgents = [...filteredAgents, ...previousGenAgents];

  if (combinedAgents.length < 2) {
    console.warn(`Not enough agents of type ${type} to reproduce.`);
    return combinedAgents;
  }

  const sortedAgents = combinedAgents.sort(
    (a, b) => evaluateFitness(b) - evaluateFitness(a)
  );

  const parentCount = Math.max(2, Math.floor(sortedAgents.length / 2));
  return sortedAgents.slice(0, parentCount);
}

function evolvePopulation() {
  const predatorParents = selectParentsByType("predator");
  const preyParents = selectParentsByType("prey");
  const normalParents = selectParentsByType("normal");
  const scavengerParents = selectParentsByType("scavenger");
  const explorerParents = selectParentsByType("explorer");
  const builderParents = selectParentsByType("builder");
  const healerParents = selectParentsByType("healer");

  const newPredators = reproduceByType(predatorParents, "predator");
  const newPrey = reproduceByType(preyParents, "prey");
  const newNormals = reproduceByType(normalParents, "normal");
  const newScavengers = reproduceByType(scavengerParents, "scavenger");
  const newExplorers = reproduceByType(explorerParents, "explorer");
  const newBuilders = reproduceByType(builderParents, "builder");
  const newHealers = reproduceByType(healerParents, "healer");

  agents = [
    ...newPredators,
    ...newPrey,
    ...newNormals,
    ...newScavengers,
    ...newExplorers,
    ...newBuilders,
    ...newHealers
  ];
  lastGenerationAgents = [...agents];
  generation++;
  console.log(`Generation: ${generation}`);

  initializeCentralResources();

  if (agents.length > MAX_AGENTS) {
    agents = agents.slice(0, MAX_AGENTS);
  }
}

function initializeCentralResources() {
  Object.keys(resources).forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    const centerX = Math.floor(cols / 2);
    const centerY = Math.floor(rows / 2);
    if (Math.abs(centerX - x) <= 5 && Math.abs(centerY - y) <= 5) {
      delete resources[key];
    }
  });

  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      const x = centerX + i;
      const y = centerY + j;
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        resources[`${x},${y}`] = new Resource(x, y, Math.random() * 50 + 50);
      }
    }
  }
}

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function saveWeights() {
  const weights = agents.map((agent) => ({
    type: agent.type,
    nn: {
      weights_ih: agent.nn.weights_ih,
      weights_ho: agent.nn.weights_ho
    }
  }));
  const blob = new Blob([JSON.stringify(weights)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neural-life-12-weights-${getTimestamp()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadWeights(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const weights = JSON.parse(e.target.result);
    agents = weights.map((data) => {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      const nn = new NeuralNetwork(7, 4, 2, data.nn);
      return new Agent(x, y, data.type, nn);
    });
    console.log("Weights loaded successfully");
  };
  reader.readAsText(file);
}

class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes, weights = null) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;
    if (weights) {
      this.weights_ih = weights.weights_ih;
      this.weights_ho = weights.weights_ho;
    } else {
      this.weights_ih = new Array(this.inputNodes)
        .fill(0)
        .map(() =>
          new Array(this.hiddenNodes).fill(0).map(() => Math.random() * 2 - 1)
        );
      this.weights_ho = new Array(this.hiddenNodes)
        .fill(0)
        .map(() =>
          new Array(this.outputNodes).fill(0).map(() => Math.random() * 2 - 1)
        );
    }
  }

  predict(inputs) {
    let hidden = this.matrixMultiply(inputs, this.weights_ih).map((x) =>
      Math.tanh(x)
    );
    let outputs = this.matrixMultiply(hidden, this.weights_ho).map((x) =>
      Math.tanh(x)
    );
    outputs = outputs.map((output) => (isNaN(output) ? 0.5 : (output + 1) / 2));
    return outputs;
  }

  matrixMultiply(vector, matrix) {
    return matrix[0].map((_, colIndex) =>
      matrix
        .map((row) => row[colIndex])
        .reduce((sum, value, index) => sum + value * vector[index], 0)
    );
  }

  crossover(partner) {
    const childWeights = {
      weights_ih: this.uniformCrossover(this.weights_ih, partner.weights_ih),
      weights_ho: this.blendCrossover(this.weights_ho, partner.weights_ho)
    };
    return new NeuralNetwork(
      this.inputNodes,
      this.hiddenNodes,
      this.outputNodes,
      childWeights
    );
  }

  uniformCrossover(matrix1, matrix2) {
    const rows = matrix1.length;
    const cols = matrix1[0].length;
    const newMatrix = new Array(rows)
      .fill(0)
      .map(() => new Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newMatrix[i][j] = Math.random() < 0.5 ? matrix1[i][j] : matrix2[i][j];
      }
    }
    return newMatrix;
  }

  blendCrossover(matrix1, matrix2, alpha = 0.5) {
    const rows = matrix1.length;
    const cols = matrix1[0].length;
    const newMatrix = new Array(rows)
      .fill(0)
      .map(() => new Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const gene1 = matrix1[i][j];
        const gene2 = matrix2[i][j];
        const lower = Math.min(gene1, gene2);
        const upper = Math.max(gene1, gene2);
        newMatrix[i][j] =
          lower +
          (upper - lower + alpha * (Math.random() - 0.5)) * Math.random();
      }
    }
    return newMatrix;
  }

  mutate(agentPerformance) {
    const mutationRate = this.getAdaptiveMutationRate(agentPerformance);
    this.mutateMatrix(this.weights_ih, mutationRate);
    this.mutateMatrix(this.weights_ho, mutationRate);
  }

  getAdaptiveMutationRate(agentPerformance) {
    if (agentPerformance < 0.2) {
      return 0.3;
    } else if (agentPerformance < 0.5) {
      return 0.2;
    } else {
      return 0.1;
    }
  }

  mutateMatrix(matrix, mutationRate) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() < mutationRate) {
          matrix[i][j] += Math.random() * 2 - 1;
        }
      }
    }
  }
}

function reproduceByType(parents, type) {
  const newAgents = [];
  const parentCount = parents.length;
  if (!parentCount) return newAgents;
  while (
    newAgents.length < populationSize / 7 &&
    newAgents.length + agents.length < MAX_AGENTS
  ) {
    const parentA = parents[Math.floor(Math.random() * parentCount)];
    const parentB = parents[Math.floor(Math.random() * parentCount)];

    if (parentA && parentB && parentA.nn && parentB.nn) {
      const childNN = parentA.nn.crossover(parentB.nn);
      const agentPerformance =
        evaluateFitness(parentA) + evaluateFitness(parentB);
      childNN.mutate(agentPerformance);
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      newAgents.push(new Agent(x, y, type, childNN));
    } else {
      console.warn(
        "One of the parents does not have a neural network initialized."
      );
    }
  }

  return newAgents;
}

class Agent {
  constructor(x, y, type, nn = null) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.energy = Math.random() * 100;
    this.type = type;
    this.state = "moving";
    this.speed = type === "predator" ? 0.5 : type === "prey" ? 0.4 : type === "super predator" ? 0.6 : 0.3;
    this.nn = nn ? nn : new NeuralNetwork(7, 4, 2); // Update inputNodes to 7
    this.age = 0;
    this.beatEffect = 0;
    this.constructions = 0; // For builders
    this.healing = 0; // For healers
    this.validateCoordinates();
  }

  validateCoordinates() {
    if (
      isNaN(this.x) ||
      isNaN(this.y) ||
      this.x < 0 ||
      this.y < 0 ||
      this.x >= cols ||
      this.y >= rows
    ) {
      console.error(
        `Agent has invalid coordinates: ${this.type}, resetting position`
      );
      this.x = Math.floor(Math.random() * cols);
      this.y = Math.floor(Math.random() * rows);
    }
  }

  update() {
    this.updated = false;
    this.age++;

    const previousX = this.x;
    const previousY = this.y;

    const inputs = this.getInputs();
    const [movement, reproduction] = this.nn.predict(inputs);

    const movementValue = isNaN(movement) ? 0.5 : movement;
    const reproductionValue = isNaN(reproduction) ? 0.5 : reproduction;

    const randomMoveX = Math.random() - 0.5;
    const randomMoveY = Math.random() - 0.5;

    this.x = Math.max(
      0,
      Math.min(cols - 1, this.x + Math.sign(movementValue - 0.5 + randomMoveX))
    );
    this.y = Math.max(
      0,
      Math.min(
        rows - 1,
        this.y + Math.sign(reproductionValue - 0.5 + randomMoveY)
      )
    );

    if (
      this.x === 0 ||
      this.x === cols - 1 ||
      this.y === 0 ||
      this.y === rows - 1
    ) {
      this.energy -= 5;
    }

    this.validateCoordinates();

    this.energy -= 0.2;

    const key = `${this.x},${this.y}`;
    if (resources[key]) {
      if (this.type === "normal") {
        this.energy += resources[key].energy;
      }
      delete resources[key];
      this.updated = true;
    }

    agents.forEach((agent) => {
      if (agent !== this && agent.x === this.x && agent.y === this.y) {
        this.interact(agent);
      }
    });

    if (this.energy > MAX_ENERGY) {
      this.energy = MAX_ENERGY;
    }

    if (this.energy <= 0) {
      this.state = "dying";
      if (this.type === "predator") {
        resources[`${this.x},${this.y}`] = new Resource(
          this.x,
          this.y,
          Math.random() * 50
        );
      }
    } else if (this.energy > 150) {
      this.state = "reproducing";
    }

    if (this.state === "reproducing") {
      const newType =
        Math.random() < 0.1
          ? Math.random() < 0.5
            ? "predator"
            : "prey"
          : this.type;
      if (agents.length < MAX_AGENTS) {
        agents.push(
          new Agent(this.x, this.y, newType, this.nn.crossover(this.nn))
        );
      }
      this.energy -= 50;
      this.state = "moving";
      this.updated = true;

      if (newType === "predator" && Math.random() < 0.01) {
        this.type = "super predator";
        this.speed = 0.6;
        this.energy += 50;
      }
    }

    this.updated = true;
  }

  getInputs() {
    let nearestPredatorDistance = Infinity;
    let nearestPreyDistance = Infinity;
    let nearestResourceDistance = Infinity;

    agents.forEach((agent) => {
      if (agent !== this) {
        const dx = agent.x - this.x;
        const dy = agent.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (agent.type === "predator" && distance < nearestPredatorDistance) {
          nearestPredatorDistance = distance;
        } else if (agent.type === "prey" && distance < nearestPreyDistance) {
          nearestPreyDistance = distance;
        }
      }
    });

    Object.keys(resources).forEach((key) => {
      const [rx, ry] = key.split(",").map(Number);
      const dx = rx - this.x;
      const dy = ry - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < nearestResourceDistance) {
        nearestResourceDistance = distance;
      }
    });

    const distanceToLeftWall = this.x / cols;
    const distanceToRightWall = (cols - this.x) / cols;
    const distanceToTopWall = this.y / rows;
    const distanceToBottomWall = (rows - this.y) / rows;

    return [
      this.energy / 200,
      nearestPredatorDistance / Math.max(cols, rows),
      nearestPreyDistance / Math.max(cols, rows),
      nearestResourceDistance / Math.max(cols, rows),
      distanceToLeftWall,
      distanceToRightWall,
      distanceToTopWall,
      distanceToBottomWall
    ];
  }

  interact(agent) {
    if (
      (this.type === "predator" || this.type === "super predator") &&
      agent.type === "prey"
    ) {
      this.energy += agent.energy;
      agent.state = "dying";
    } else if (
      this.type === "prey" &&
      (agent.type === "predator" || agent.type === "super predator")
    ) {
      this.energy -= 10;
      if (this.energy < 0) this.state = "dying";
    } else if (this.type === "normal" && agent.type === "normal") {
      const energyTransfer = Math.min(this.energy, agent.energy) * 0.1;
      this.energy -= energyTransfer;
      agent.energy += energyTransfer;
    } else if (this.type === "prey" && agent.type === "prey") {
      const energyBoost = 5;
      this.energy += energyBoost;
      agent.energy += energyBoost;
    } else if (this.type === "scavenger" && agent.state === "dying") {
      this.energy += agent.energy;
      agent.energy = 0;
    } else if (this.type === "explorer") {
      this.energy += 0.1;
    } else if (this.type === "builder" && this.energy > 10) {
      const newResource = new Resource(this.x, this.y, 10);
      resources[`${this.x},${this.y}`] = newResource;
      this.energy -= 10;
      this.constructions += 1;
    } else if (this.type === "healer" && agent.energy < MAX_ENERGY) {
      const healingAmount = 10;
      agent.energy = Math.min(agent.energy + healingAmount, MAX_ENERGY);
      this.energy -= healingAmount;
      this.healing += 1;
    }
  }

  render() {
    this.validateCoordinates();

    if (this.updated) {
      const index = Math.floor(this.y * cols + this.x);
      if (index >= 0 && index < container.children.length) {
        const charIndex = Math.floor((this.energy / 200) * (chars.length - 1));
        const char = chars[charIndex];
        const element = container.children[index];
        let colors = normalColors;
        if (this.type === "predator") {
          colors = predatorColors;
        } else if (this.type === "super predator") {
          colors = superPredatorColors;
        } else if (this.type === "prey") {
          colors = preyColors;
        } else if (this.type === "scavenger") {
          colors = scavengerColors;
        } else if (this.type === "explorer") {
          colors = explorerColors;
        } else if (this.type === "builder") {
          colors = builderColors;
        } else if (this.type === "healer") {
          colors = healerColors;
        }

        const inverted = this.beatEffect > 0;
        const color = getGradientColor(this.energy, 200, colors, inverted);

        if (element.textContent !== char || element.style.color !== color) {
          element.textContent = char;
          element.style.color = color;
        }
      } else {
        console.error(
          `Invalid agent index during rendering: ${index}, x: ${this.x}, y: ${this.y}, cols: ${cols}, rows: ${rows}`
        );
        this.x = Math.floor(Math.random() * cols);
        this.y = Math.floor(Math.random() * rows);
        this.validateCoordinates();
      }
    }
  }
}

class Resource {
  constructor(x, y, energy) {
    this.x = Math.floor(Math.max(0, Math.min(cols - 1, x)));
    this.y = Math.floor(Math.max(0, Math.min(rows - 1, y)));
    this.energy = energy;
    this.updated = true;
  }

  render() {
    const index = Math.floor(this.y * cols + this.x);
    if (index >= 0 && index < container.children.length) {
      const element = container.children[index];
      if (
        element.textContent !== resourceChar ||
        element.style.color !== resourceColor
      ) {
        element.textContent = resourceChar;
        element.style.color = resourceColor;
      }
      this.updated = false;
    } else {
      console.error(
        `Invalid resource index during rendering: ${index}, x: ${this.x}, y: ${this.y}, cols: ${cols}, rows: ${rows}`
      );
      this.x = Math.floor(Math.random() * cols);
      this.y = Math.floor(Math.random() * rows);
    }
  }
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

class FractalEvent {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.maxIter = 50;
    this.c = this.getInterestingConstant();
    this.zoom = 0.25;
    this.active = true;
    this.iteration = 0;
    shuffleArray(fractalColors);
    this.fractalColors = fractalColors.flat();
  }

  getInterestingConstant() {
    const constants = [
      { re: -0.7, im: 0.27015 },
      { re: 0.355, im: 0.355 },
      { re: -0.70176, im: -0.3842 },
      { re: -0.835, im: -0.2321 },
      { re: -0.8, im: 0.156 },
      { re: 0.285, im: 0.01 }
    ];
    return constants[Math.floor(Math.random() * constants.length)];
  }

  calculateJulia(x, y) {
    let zx =
      (1.5 * (x - cols / 2)) / (0.5 * this.zoom * cols) +
      (this.x - cols / 2) / cols;
    let zy =
      (y - rows / 2) / (0.5 * this.zoom * rows) + (this.y - rows / 2) / rows;
    let i = this.maxIter;
    while (zx * zx + zy * zy < 4 && i > 0) {
      let tmp = zx * zx - zy * zy + this.c.re;
      zy = 2.0 * zx * zy + this.c.im;
      zx = tmp;
      i--;
    }
    return this.maxIter - i;
  }

  update() {
    if (this.iteration < this.maxIter) {
      this.iteration++;
      this.zoom *= 1.075;
    } else {
      this.active = false;
    }
  }

  render() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const n = this.calculateJulia(x, y);
        const index = y * cols + x;
        const element = container.children[index];
        const charIndex = Math.floor((n / this.maxIter) * (chars.length - 1));
        element.textContent = chars[charIndex];
      }
    }
  }
}

let agents = [];

function initializeGrid() {
  container.innerHTML = "";

  const width = window.innerWidth;
  const height = window.innerHeight;

  cols = Math.floor(width / charSize);
  rows = Math.floor(height / charSize);

  container.style.gridTemplateColumns = `repeat(${cols}, ${charSize}px)`;
  container.style.gridTemplateRows = `repeat(${rows}, ${charSize}px)`;

  for (let i = 0; i < cols * rows; i++) {
    const charElement = document.createElement("div");
    charElement.style.width = `${charSize}px`;
    charElement.style.height = `${charSize}px`;
    charElement.style.display = "flex";
    charElement.style.alignItems = "center";
    charElement.style.justifyContent = "center";
    charElement.textContent = " ";
    container.appendChild(charElement);
  }

  const initialPredators = Math.floor(populationSize * 0.01);
  const initialPrey = Math.floor(populationSize * 0.3);
  const initialNormals = Math.floor(populationSize * 0.2);
  const initialScavengers = Math.floor(populationSize * 0.1);
  const initialExplorers = Math.floor(populationSize * 0.1);
  const initialBuilders = Math.floor(populationSize * 0.1);
  const initialHealers = populationSize - initialPredators - initialPrey - initialNormals - initialScavengers - initialExplorers - initialBuilders;

  for (let i = 0; i < initialPredators; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "predator");
    agent.validateCoordinates();
    agents.push(agent);
  }

  for (let i = 0; i < initialPrey; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "prey");
    agent.validateCoordinates();
    agents.push(agent);
  }

  for (let i = 0; i < initialNormals; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "normal");
    agent.validateCoordinates();
    agents.push(agent);
  }

  for (let i = 0; i < initialScavengers; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "scavenger");
    agent.validateCoordinates();
    agents.push(agent);
  }

  for (let i = 0; i < initialExplorers; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "explorer");
    agent.validateCoordinates();
    agents.push(agent);
  }

  for (let i = 0; i < initialBuilders; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "builder");
    agent.validateCoordinates();
    agents.push(agent);
  }

  for (let i = 0; i < initialHealers; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const agent = new Agent(x, y, "healer");
    agent.validateCoordinates();
    agents.push(agent);
  }

  initializeCentralResources();

  lastGenerationAgents = [...agents];
}

function shouldAnalyzeAudio() {
  const now = performance.now();
  if (now - lastAudioAnalysisTime >= audioAnalysisThrottleInterval) {
    lastAudioAnalysisTime = now;
    return true;
  }
  return false;
}

function animateGrid(timestamp) {
  if (timestamp - lastFrameTime < 1000 / frameRate) {
    requestAnimationFrame(animateGrid);
    return;
  }
  lastFrameTime = timestamp;

  agents.forEach((agent) => {
    agent.update();
    agent.render();
  });

  agents = agents.filter((agent) => agent.state !== "dying");

  Object.values(resources).forEach((resource) => {
    resource.render();
  });

  if (fractalEvent) {
    fractalEvent.update();
    fractalEvent.render();
    if (!fractalEvent.active) {
      fractalEvent = null;
    }
  }

  if (shouldAnalyzeAudio()) {
    beatDetected = detectBeat();

    if (beatDetected) {
      agents.forEach((agent) => {
        agent.energy += 3;
        agent.speed += 0.05;
        agent.beatEffect = 1;
      });
    }
  }

  frameCount++;
  updateDebugInfo();
  if (agents.length < 10) {
    if (!fractalEvent && agents.every(agent => agent.type === "normal")) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      fractalEvent = new FractalEvent(x, y);
    }
    evolvePopulation();
  }

  requestAnimationFrame(animateGrid);
}

function setupAudio(file) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  const reader = new FileReader();
  reader.onload = (event) => {
    audioContext.decodeAudioData(event.target.result, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start();

      if (!animationStarted) {
        animationStarted = true;
        animateGrid(performance.now());
      }
    });
  };
  reader.readAsArrayBuffer(file);
}

function getAudioFeatures() {
  if (!analyser) {
    return { average: 0, isBeat: false };
  }

  if (!dataArray) {
    return { average: 0, isBeat: false };
  }

  analyser.getByteFrequencyData(dataArray);
  const lowFrequency = dataArray.slice(0, dataArray.length / 4);
  const lowFrequencyAverage =
    lowFrequency.reduce((sum, value) => sum + value, 0) / lowFrequency.length;

  beatHistory.push(lowFrequencyAverage);
  if (beatHistory.length > 20) {
    beatHistory.shift();
  }

  const average =
    dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

  const averageHistory =
    beatHistory.reduce((sum, value) => sum + value, 0) / beatHistory.length;
  const isBeat = lowFrequencyAverage > averageHistory * 1.1;

  return { average, isBeat };
}

function detectBeat() {
  const audioFeatures = getAudioFeatures();
  return audioFeatures.isBeat;
}

document
  .getElementById("audioFileInput")
  .addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      setupAudio(file);
    }
  });

document.getElementById("resetButton").addEventListener("click", () => {
  initializeGrid();
});

document
  .getElementById("saveWeightsButton")
  .addEventListener("click", saveWeights);
document
  .getElementById("loadWeightsInput")
  .addEventListener("change", loadWeights);

container.addEventListener("click", (event) => {
  const rect = container.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / charSize);
  const y = Math.floor((event.clientY - rect.top) / charSize);
  agents.push(new Agent(x, y, "prey"));
});

container.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  const rect = container.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / charSize);
  const y = Math.floor((event.clientY - rect.top) / charSize);
  agents.push(new Agent(x, y, "predator"));
});

window.onload = () => {
  initializeGrid();
  animateGrid(performance.now());

  document
    .getElementById("saveWeightsButton")
    .addEventListener("click", saveWeights);
  document
    .getElementById("loadWeightsInput")
    .addEventListener("change", loadWeights);
};

window.onresize = () => {
  initializeGrid();
};