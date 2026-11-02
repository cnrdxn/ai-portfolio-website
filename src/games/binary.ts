export type Difficulty = "easy" | "medium" | "hard";
export type Cell = 0 | 1 | null;

type BinaryValue = 0 | 1;

export type Puzzle = {
  size: number;
  givens: Cell[];
  solution: BinaryValue[];
};

export const difficultySettings: Record<
  Difficulty,
  { label: string; size: number; clues: number }
> = {
  easy: { label: "Easy", size: 6, clues: 9 },
  medium: { label: "Medium", size: 8, clues: 12 },
  hard: { label: "Hard", size: 10, clues: 15 },
};

/**
 * Each pattern is balanced, has no three equal adjacent bits (including across
 * its ends), and has distinct rotations. Its cyclic-shift board therefore has
 * balanced, unique rows and columns with no three equal adjacent values.
 */
const solutionPatterns: Record<Difficulty, readonly string[]> = {
  easy: ["110100", "101001"],
  medium: ["11010100", "10110100"],
  hard: ["1101100100", "1101010100"],
};

function createRandom(seed: number): () => number {
  let state = (Number.isFinite(seed) ? Math.trunc(seed) : 0) >>> 0;
  if (state === 0) state = 0xa341316c;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function createBaseBoard(pattern: string): BinaryValue[][] {
  const size = pattern.length;
  const bits = Array.from(pattern, (bit) => Number(bit) as BinaryValue);

  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => bits[(row + column) % size]),
  );
}

function transpose(board: BinaryValue[][]): BinaryValue[][] {
  return board.map((_, column) => board.map((row) => row[column]));
}

function reverseRows(board: BinaryValue[][]): BinaryValue[][] {
  return [...board].reverse();
}

function reverseColumns(board: BinaryValue[][]): BinaryValue[][] {
  return board.map((row) => [...row].reverse());
}

function rotateRows(
  board: BinaryValue[][],
  offset: number,
): BinaryValue[][] {
  const size = board.length;

  return Array.from(
    { length: size },
    (_, row) => board[(row - offset + size) % size],
  );
}

function rotateColumns(
  board: BinaryValue[][],
  offset: number,
): BinaryValue[][] {
  const size = board.length;

  return board.map((row) =>
    Array.from(
      { length: size },
      (_, column) => row[(column - offset + size) % size],
    ),
  );
}

function createSolutionBoard(
  difficulty: Difficulty,
  random: () => number,
): BinaryValue[][] {
  const patterns = solutionPatterns[difficulty];
  const pattern = patterns[Math.floor(random() * patterns.length)];
  const size = pattern.length;
  let board = createBaseBoard(pattern);

  // These seeded symmetries and inversions preserve every Takuzu rule.
  if (random() < 0.5) board = transpose(board);
  if (random() < 0.5) board = reverseRows(board);
  if (random() < 0.5) board = reverseColumns(board);
  board = rotateRows(board, Math.floor(random() * size));
  board = rotateColumns(board, Math.floor(random() * size));
  if (random() < 0.5) {
    board = board.map((row) =>
      row.map((bit) => (bit === 0 ? 1 : 0) as BinaryValue),
    );
  }

  return board;
}

function createGivens(
  solution: BinaryValue[][],
  clueCount: number,
  random: () => number,
): Cell[] {
  const size = solution.length;
  const rowOrder = shuffle(
    Array.from({ length: size }, (_, index) => index),
    random,
  );
  const cluesPerRow = Array<number>(size).fill(0);

  // Distributing clues round-robin keeps the rows balanced; these settings
  // give every row one or two clues, so no row is fully revealed.
  for (let clue = 0; clue < clueCount; clue += 1) {
    cluesPerRow[rowOrder[clue % size]] += 1;
  }

  const givens: Cell[] = Array<Cell>(size * size).fill(null);

  for (let row = 0; row < size; row += 1) {
    const columns = shuffle(
      Array.from({ length: size }, (_, index) => index),
      random,
    );

    for (const column of columns.slice(0, cluesPerRow[row])) {
      givens[row * size + column] = solution[row][column];
    }
  }

  return givens;
}

/**
 * Creates a reproducible puzzle. The sparse clue counts intentionally allow
 * multiple valid completions; the returned solution is one completion and is
 * used only to ensure the generated clues are consistent.
 */
export function createPuzzle(
  difficulty: Difficulty,
  seed = 0,
): Puzzle {
  const settings = difficultySettings[difficulty];
  if (!settings) {
    throw new RangeError("Choose easy, medium, or hard difficulty.");
  }

  const random = createRandom(seed);
  const solutionBoard = createSolutionBoard(difficulty, random);
  const solution: BinaryValue[] = solutionBoard.flat();

  return {
    size: settings.size,
    givens: createGivens(solutionBoard, settings.clues, random),
    solution,
  };
}

function isFilled(cell: Cell): cell is BinaryValue {
  return cell === 0 || cell === 1;
}

/**
 * Reports rule violations using row-major indexes. It checks only the visible
 * board, so any full board that satisfies the rules counts as a completion.
 */
export function analyzeBoard(
  board: Cell[],
  size: number,
): { conflicts: number[]; complete: boolean; message: string | null } {
  if (!Number.isInteger(size) || size < 2 || size % 2 !== 0 || board.length !== size * size) {
    return {
      conflicts: [],
      complete: false,
      message: "This board does not match its grid size.",
    };
  }

  const conflicts = new Set<number>();
  let message: string | null = null;
  const setMessage = (ruleMessage: string) => {
    if (message === null) message = ruleMessage;
  };
  const half = size / 2;
  const rows = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => row * size + column),
  );
  const columns = Array.from({ length: size }, (_, column) =>
    Array.from({ length: size }, (_, row) => row * size + column),
  );

  const checkBalance = (
    lines: number[][],
    direction: "row" | "column",
  ) => {
    for (const indices of lines) {
      for (const value of [0, 1] as const) {
        const matching = indices.filter((index) => board[index] === value);
        if (matching.length > half) {
          setMessage(
            direction === "row"
              ? "A row has more than half of one value."
              : "A column has more than half of one value.",
          );
          matching.forEach((index) => conflicts.add(index));
        }
      }
    }
  };

  const checkTriples = (
    lines: number[][],
    direction: "row" | "column",
  ) => {
    for (const indices of lines) {
      for (let offset = 0; offset <= size - 3; offset += 1) {
        const triple = indices.slice(offset, offset + 3);
        const value = board[triple[0]];
        if (isFilled(value) && triple.every((index) => board[index] === value)) {
          setMessage(
            direction === "row"
              ? "A row cannot have three matching values in a row."
              : "A column cannot have three matching values in a column.",
          );
          triple.forEach((index) => conflicts.add(index));
        }
      }
    }
  };

  const checkFullDuplicates = (
    lines: number[][],
    direction: "row" | "column",
  ) => {
    const firstLineByPattern = new Map<string, number[]>();

    for (const indices of lines) {
      if (!indices.every((index) => isFilled(board[index]))) continue;

      const pattern = indices.map((index) => board[index]).join("");
      const first = firstLineByPattern.get(pattern);
      if (first) {
        setMessage(
          direction === "row"
            ? "Completed rows must be unique."
            : "Completed columns must be unique.",
        );
        first.forEach((index) => conflicts.add(index));
        indices.forEach((index) => conflicts.add(index));
      } else {
        firstLineByPattern.set(pattern, indices);
      }
    }
  };

  checkBalance(rows, "row");
  checkTriples(rows, "row");
  checkFullDuplicates(rows, "row");
  checkBalance(columns, "column");
  checkTriples(columns, "column");
  checkFullDuplicates(columns, "column");

  const isComplete = board.every(isFilled);
  return {
    conflicts: [...conflicts].sort((a, b) => a - b),
    complete: isComplete && conflicts.size === 0,
    message,
  };
}
