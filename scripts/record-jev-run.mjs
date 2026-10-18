#!/usr/bin/env bun
/**
 * Record one full Snake run as a lightweight structured trace.
 *
 *   TYPESAFE_API_KEY=... bun run record:snake
 *   bun run record:snake:mock
 *
 * The page replays the resulting JSON in the browser. No Worker, CORS
 * proxy, or visitor API key is needed. The mock mode is useful for local
 * layout work and for keeping a deterministic trace in the repository.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const COLS = 10;
const ROWS = 9;
const MODEL = "jev-latest";
const START_SEED = 20261018;
const MAX_STEPS = 500;
const API_URL = "https://api.typesafe.ai/v1/systemone";
const OUT = resolve("public/data/jev-snake-replay.json");

const DELTA = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1]
};

const MOVE_DESC = {
  up: "Move one cell up. Row decreases by 1.",
  right: "Move one cell right. Column increases by 1.",
  down: "Move one cell down. Row increases by 1.",
  left: "Move one cell left. Column decreases by 1."
};

const MOVE_ORDER = ["up", "right", "down", "left"];
const mock = process.argv.includes("--mock");
const key = process.env.TYPESAFE_API_KEY || "";

if (!mock && !key) {
  console.error(
    "Missing TYPESAFE_API_KEY. Use --mock for a scripted trace, or export a key to record with Jev."
  );
  process.exit(1);
}

let seed = START_SEED;
let snake = [
  { r: 4, c: 3 },
  { r: 4, c: 2 },
  { r: 4, c: 1 }
];
let direction = "right";
let score = 0;
let steps = 0;
let food = null;
let gameOver = false;
let lastModel = MODEL;
const trace = [];

function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

function placeFood() {
  const occupied = new Set(snake.map((point) => point.r + "," + point.c));
  const empty = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (!occupied.has(r + "," + c)) empty.push({ r, c });
    }
  }
  if (!empty.length) {
    food = null;
    gameOver = true;
    return;
  }
  food = empty[Math.floor(rand() * empty.length)];
}

function gridRows() {
  const map = new Map();
  snake.forEach((point, index) => {
    map.set(point.r + "," + point.c, index === 0 ? 1 : 2);
  });
  if (food) map.set(food.r + "," + food.c, 3);

  const rows = [];
  for (let r = 0; r < ROWS; r += 1) {
    let row = "";
    for (let c = 0; c < COLS; c += 1) {
      row += String(map.has(r + "," + c) ? map.get(r + "," + c) : 0);
    }
    rows.push(row);
  }
  return rows;
}

function legalMoves() {
  const head = snake[0];
  const body = new Set(snake.slice(0, -1).map((point) => point.r + "," + point.c));
  return MOVE_ORDER.filter((move) => {
    const [dr, dc] = DELTA[move];
    const r = head.r + dr;
    const c = head.c + dc;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    return !body.has(r + "," + c);
  });
}

function payload(legal) {
  const head = snake[0];
  return {
    model: MODEL,
    state: {
      grid: gridRows(),
      legend: {
        0: "empty",
        1: "snake head",
        2: "snake body",
        3: "food"
      },
      head: { row: head.r, col: head.c },
      direction,
      food: food ? { row: food.r, col: food.c } : null,
      score,
      steps,
      legal_moves: legal
    },
    questions: {
      move: {
        type: "choice",
        instructions:
          "You are the snake head (1). The snake is moving " +
          direction +
          ". Choose the next move that keeps the snake alive and moves toward the food (3). " +
          "The grid is 9 rows by 10 columns: row 0 is the top row, column 0 is the left column. " +
          "Only choose from `legal_moves`.",
        criteria: Object.fromEntries(legal.map((move) => [move, MOVE_DESC[move]]))
      }
    }
  };
}

function greedy(state) {
  const legal = state.legal_moves || [];
  const head = state.head;
  const target = state.food;
  const distance = (move) => {
    const [dr, dc] = DELTA[move];
    return (
      Math.abs(head.row + dr - target.row) +
      Math.abs(head.col + dc - target.col)
    );
  };
  return [...legal].sort((a, b) => distance(a) - distance(b))[0];
}

async function askJev(body) {
  let last;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    if (res.ok) {
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error("Jev returned non-JSON: " + text.slice(0, 200));
      }
    }
    last = new Error("Jev returned " + res.status + ": " + text.slice(0, 300));
    if (res.status !== 429 && res.status < 500) break;
    await new Promise((resolveDelay) =>
      setTimeout(resolveDelay, 600 * Math.pow(2, attempt))
    );
  }
  throw last;
}

function applyMove(move) {
  const [dr, dc] = DELTA[move];
  const head = snake[0];
  const next = { r: head.r + dr, c: head.c + dc };
  snake.unshift(next);

  const ate = food && next.r === food.r && next.c === food.c;
  if (ate) {
    score += 1;
    placeFood();
  } else {
    snake.pop();
  }

  direction = move;
  steps += 1;
}

placeFood();

while (!gameOver && steps < MAX_STEPS) {
  const legal = legalMoves();
  if (!legal.length) {
    gameOver = true;
    break;
  }

  const body = payload(legal);
  let choice;
  let confidence = null;
  let probabilities = {};
  let inputTokens = 0;
  let model = mock ? "scripted-greedy" : MODEL;
  let corrected = false;

  if (mock) {
    choice = greedy(body.state);
    probabilities = Object.fromEntries(
      legal.map((move) => [move, move === choice ? 0.94 : 0.03])
    );
    confidence = 0.88;
    inputTokens = 612;
  } else {
    const data = await askJev(body);
    const answer = data && data.answers && data.answers.move;
    if (!answer) throw new Error("Jev did not return a move answer.");
    choice = answer.choice;
    confidence = answer.confidence == null ? null : Number(answer.confidence);
    probabilities = answer.probabilities || {};
    inputTokens = Number((data.usage && data.usage.input_tokens) || 0);
    model = data.model || MODEL;
    lastModel = model;
    if (!legal.includes(choice)) {
      corrected = true;
      choice = legal[0];
    }
  }

  applyMove(choice);
  trace.push({
    step: steps,
    move: choice,
    confidence,
    probabilities,
    input_tokens: inputTokens,
    ...(corrected ? { corrected: true } : {})
  });

  process.stdout.write(
    "\rSTEP " + String(steps).padStart(3, "0") + " · SCORE " + String(score).padStart(2, "0")
  );
}

const result = {
  source: mock ? "scripted-greedy" : "jev",
  model: mock ? "scripted-greedy" : lastModel,
  generatedAt: new Date().toISOString(),
  seed: START_SEED,
  rules: {
    cols: COLS,
    rows: ROWS,
    initialSnake: [
      { r: 4, c: 3 },
      { r: 4, c: 2 },
      { r: 4, c: 1 }
    ],
    initialDirection: "right"
  },
  outcome: {
    state: gameOver ? (food ? "GAME OVER" : "BOARD FULL") : "STEP LIMIT",
    score,
    steps,
    inputTokens: trace.reduce((sum, step) => sum + (step.input_tokens || 0), 0)
  },
  steps: trace
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(result, null, 2) + "\n", "utf8");

console.log(
  "\nWrote " +
    OUT +
    "\n" +
    result.source +
    " · " +
    result.outcome.state +
    " · score " +
    score +
    " · " +
    steps +
    " steps · " +
    result.outcome.inputTokens +
    " input tokens"
);
