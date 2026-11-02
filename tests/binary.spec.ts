import { expect, test, type Locator } from '@playwright/test';
import {
  analyzeBoard,
  createPuzzle,
  difficultySettings,
  type Cell,
  type Difficulty,
} from '../src/games/binary';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const expectedSettings: Record<Difficulty, { size: number; clues: number }> = {
  easy: { size: 6, clues: 9 },
  medium: { size: 8, clues: 12 },
  hard: { size: 10, clues: 15 },
};

function partialBoard(size: number, filled: [number, Cell][]): Cell[] {
  const board = Array<Cell>(size * size).fill(null);
  filled.forEach(([index, value]) => { board[index] = value; });
  return board;
}

function findCompletion(board: Cell[], size: number): (0 | 1)[] | null {
  const candidate = [...board];

  function search(): (0 | 1)[] | null {
    const emptyIndex = candidate.indexOf(null);
    if (emptyIndex === -1) {
      return analyzeBoard(candidate, size).complete ? candidate as (0 | 1)[] : null;
    }

    for (const value of [0, 1] as const) {
      candidate[emptyIndex] = value;
      if (analyzeBoard(candidate, size).conflicts.length === 0) {
        const solution = search();
        if (solution) return solution;
      }
    }

    candidate[emptyIndex] = null;
    return null;
  }

  return search();
}

async function readBoard(game: Locator): Promise<Cell[]> {
  return game.locator('.binary-cell').evaluateAll((cells): Cell[] => cells.map(cell => {
    const text = cell.textContent?.trim();
    return text === '0' ? 0 : text === '1' ? 1 : null;
  }));
}

async function readCluePattern(game: Locator): Promise<boolean[]> {
  return game.locator('.binary-cell').evaluateAll(cells => cells.map(cell => (cell as HTMLButtonElement).disabled));
}

test.describe('binary puzzle engine', () => {
  test('creates deterministic puzzles with valid solutions and the configured clue counts', () => {
    for (const difficulty of difficulties) {
      const expected = expectedSettings[difficulty];
      expect(difficultySettings[difficulty].size).toBe(expected.size);
      expect(difficultySettings[difficulty].clues).toBe(expected.clues);

      for (let seed = 0; seed < 20; seed += 1) {
        const puzzle = createPuzzle(difficulty, seed);
        const repeated = createPuzzle(difficulty, seed);

        expect(puzzle).toEqual(repeated);
        expect(puzzle.size).toBe(expected.size);
        expect(puzzle.givens).toHaveLength(expected.size * expected.size);
        expect(puzzle.solution).toHaveLength(expected.size * expected.size);
        expect(puzzle.givens.filter(value => value !== null)).toHaveLength(expected.clues);

        const solutionAnalysis = analyzeBoard(puzzle.solution, puzzle.size);
        expect(solutionAnalysis.complete).toBe(true);
        expect(solutionAnalysis.conflicts).toEqual([]);
        expect(solutionAnalysis.message).toBeNull();

        puzzle.givens.forEach((given, index) => {
          if (given !== null) expect(given).toBe(puzzle.solution[index]);
        });
      }
    }
  });

  test('flags row and column balance overflow on incomplete boards', () => {
    const rowOverflow = partialBoard(6, [
      [0, 0], [1, 1], [2, 0], [3, 0], [4, 1], [5, 0],
    ]);
    const rowResult = analyzeBoard(rowOverflow, 6);
    expect(rowResult.complete).toBe(false);
    expect(rowResult.conflicts).toEqual(expect.arrayContaining([0, 2, 3, 5]));

    const columnOverflow = partialBoard(6, [
      [0, 0], [6, 1], [12, 0], [18, 0], [24, 1], [30, 0],
    ]);
    const columnResult = analyzeBoard(columnOverflow, 6);
    expect(columnResult.complete).toBe(false);
    expect(columnResult.conflicts).toEqual(expect.arrayContaining([0, 12, 18, 30]));
  });

  test('flags runs of three and duplicate completed rows and columns', () => {
    const triple = analyzeBoard(partialBoard(6, [[0, 0], [1, 0], [2, 0]]), 6);
    expect(triple.complete).toBe(false);
    expect(triple.conflicts).toEqual(expect.arrayContaining([0, 1, 2]));

    const alternatingRow: (0 | 1)[] = [0, 1, 0, 1, 0, 1];
    const duplicateRows = partialBoard(6, [
      ...alternatingRow.map((value, column) => [column, value] as [number, Cell]),
      ...alternatingRow.map((value, column) => [6 + column, value] as [number, Cell]),
    ]);
    const rowsResult = analyzeBoard(duplicateRows, 6);
    expect(rowsResult.complete).toBe(false);
    expect(rowsResult.conflicts.length).toBeGreaterThan(0);
    expect(rowsResult.conflicts.every(index => index < 12)).toBe(true);

    const duplicateColumns = partialBoard(6, [
      ...alternatingRow.map((value, row) => [row * 6, value] as [number, Cell]),
      ...alternatingRow.map((value, row) => [row * 6 + 1, value] as [number, Cell]),
    ]);
    const columnsResult = analyzeBoard(duplicateColumns, 6);
    expect(columnsResult.complete).toBe(false);
    expect(columnsResult.conflicts.length).toBeGreaterThan(0);
    expect(columnsResult.conflicts.every(index => index % 6 < 2)).toBe(true);
  });

  test('accepts a conflict-free incomplete board without calling it solved', () => {
    const board = partialBoard(6, [[0, 0], [1, 1], [6, 1], [7, 0]]);
    const result = analyzeBoard(board, 6);
    expect(result.conflicts).toEqual([]);
    expect(result.complete).toBe(false);
    expect(result.message).toBeNull();
  });
});

test.describe('binary puzzle interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('switches difficulty with the configured board sizes and clue counts', async ({ page }) => {
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    await expect(game).toBeVisible();

    for (const difficulty of difficulties) {
      const settings = expectedSettings[difficulty];
      await game.getByRole('button', { name: difficultySettings[difficulty].label, exact: true }).click();
      await expect(game.locator('.binary-cell')).toHaveCount(settings.size * settings.size);
      await expect(game.locator('.binary-cell:disabled')).toHaveCount(settings.clues);
    }

    const status = game.getByRole('status');
    await expect(status).toBeVisible();
    await expect(status).not.toHaveText('');
  });

  test('clicking an editable cell cycles blank, zero, one, and blank', async ({ page }) => {
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    const cell = game.locator('.binary-cell:not(:disabled)').first();

    await expect(cell).toHaveText('');
    await cell.click();
    await expect(cell).toHaveText('0');
    await cell.click();
    await expect(cell).toHaveText('1');
    await cell.click();
    await expect(cell).toHaveText('');
  });

  test('keyboard entry and erase keys update a focused cell', async ({ page }) => {
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    const cell = game.locator('.binary-cell:not(:disabled)').first();
    await cell.focus();

    await page.keyboard.press('0');
    await expect(cell).toHaveText('0');
    await page.keyboard.press('1');
    await expect(cell).toHaveText('1');
    await page.keyboard.press('Backspace');
    await expect(cell).toHaveText('');
    await page.keyboard.press('1');
    await expect(cell).toHaveText('1');
    await page.keyboard.press('Delete');
    await expect(cell).toHaveText('');
  });

  test('undo restores the last cell value and reset restores the initial givens', async ({ page }) => {
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    const initialBoard = await readBoard(game);
    const initialClues = await readCluePattern(game);
    const cell = game.locator('.binary-cell:not(:disabled)').first();

    await cell.click();
    await expect(cell).toHaveText('0');
    await game.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(cell).toHaveText('');

    await cell.click();
    await game.getByRole('button', { name: 'Reset', exact: true }).click();
    expect(await readBoard(game)).toEqual(initialBoard);
    expect(await readCluePattern(game)).toEqual(initialClues);
  });

  test('new puzzle clears player entries and changes the clue pattern', async ({ page }) => {
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    const initialClues = await readCluePattern(game);
    const firstEditable = game.locator('.binary-cell:not(:disabled)').first();
    await firstEditable.click();
    await expect(firstEditable).toHaveText('0');

    await game.getByRole('button', { name: 'New puzzle', exact: true }).click();
    const nextClues = await readCluePattern(game);
    expect(nextClues).not.toEqual(initialClues);
    const remainingEntries = await game.locator('.binary-cell:not(:disabled)').allTextContents();
    expect(remainingEntries.every(text => text.trim() === '')).toBe(true);
  });

  test('accepts a valid completion and announces success', async ({ page }) => {
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    const cells = game.locator('.binary-cell');
    await expect(cells).toHaveCount(36);
    const puzzle = await readBoard(game);
    const solution = findCompletion(puzzle, 6);
    expect(solution).not.toBeNull();

    for (let index = 0; index < solution!.length; index += 1) {
      const cell = cells.nth(index);
      if (await cell.isDisabled()) continue;
      await cell.focus();
      await page.keyboard.press(String(solution![index]));
    }

    await expect(game.getByRole('status')).toHaveText('Solved. Nicely done.');
  });
});

for (const width of [320, 360, 390]) {
  test(`touch controls and all board sizes fit at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 850 }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/');
    const game = page.getByRole('region', { name: 'Binary puzzle' });
    for (const difficulty of difficulties) {
      await game.getByRole('button', { name: difficultySettings[difficulty].label, exact: true }).tap();
      await expect(page.getByRole('grid')).toHaveCount(1);
      const size = expectedSettings[difficulty].size;
      await expect(game.locator('.binary-cell')).toHaveCount(size * size);
      const cell = game.locator('.binary-cell:not(:disabled)').first();
      await cell.tap();
      await expect(cell).toHaveText('0');
      await cell.tap();
      await expect(cell).toHaveText('1');
      const bounds = await game.evaluate(el => {
        const board = el.querySelector('.binary-board')!.getBoundingClientRect();
        const cells = [...el.querySelectorAll('.binary-cell')].map(cell => cell.getBoundingClientRect());
        return { left: board.left, right: board.right, lastRight: Math.max(...cells.map(cell => cell.right)), width: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(bounds.width);
      expect(bounds.lastRight).toBeLessThanOrEqual(bounds.right);
      expect(bounds.overflow).toBe(false);
    }
    await game.screenshot({ path: `test-results/binary-mobile-${width}.png` });
    await context.close();
  });
}
