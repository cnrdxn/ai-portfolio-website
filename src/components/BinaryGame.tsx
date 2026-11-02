import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { analyzeBoard, createPuzzle, difficultySettings, type Cell, type Difficulty, type Puzzle } from '../games/binary'

type GameState = { puzzle: Puzzle; board: Cell[]; history: Cell[][] }
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
function makeGame(difficulty: Difficulty, seed: number): GameState {
  const puzzle = createPuzzle(difficulty, seed)
  return { puzzle, board: [...puzzle.givens], history: [] }
}

export function BinaryGame() {
  const seed = useRef(Date.now() >>> 0)
  const [games, setGames] = useState<Record<Difficulty, GameState>>(() => ({
    easy: makeGame('easy', seed.current),
    medium: makeGame('medium', seed.current + 1),
    hard: makeGame('hard', seed.current + 2),
  }))
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [focusIndex, setFocusIndex] = useState(() => games.easy.puzzle.givens.findIndex(cell => cell === null))
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const game = games[difficulty]
  const { size, givens } = game.puzzle
  const analysis = analyzeBoard(game.board, size)
  const conflicts = new Set(analysis.conflicts)
  const filled = game.board.filter(cell => cell !== null).length
  const hasChanges = game.board.some((cell, index) => cell !== givens[index])

  function updateCell(index: number, value?: Cell) {
    if (givens[index] !== null) return
    setGames(previous => {
      const current = previous[difficulty]
      const nextValue = value === undefined ? current.board[index] === null ? 0 : current.board[index] === 0 ? 1 : null : value
      if (current.board[index] === nextValue) return previous
      const board = [...current.board]
      board[index] = nextValue
      return { ...previous, [difficulty]: { ...current, board, history: [...current.history, current.board] } }
    })
  }

  function selectDifficulty(next: Difficulty) {
    setDifficulty(next)
    setFocusIndex(games[next].puzzle.givens.findIndex(cell => cell === null))
  }

  function moveFocus(index: number, offset: number) {
    for (let step = 1; step <= size * size; step++) {
      const next = ((index + offset * step) % (size * size) + size * size) % (size * size)
      if (givens[next] === null) { setFocusIndex(next); cells.current[next]?.focus(); return }
    }
  }

  function onCellKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === '0' || event.key === '1') { event.preventDefault(); updateCell(index, Number(event.key) as Cell) }
    else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); updateCell(index, null) }
    else if (event.key === 'ArrowRight') { event.preventDefault(); moveFocus(index, 1) }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(index, -1) }
    else if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(index, size) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(index, -size) }
  }

  function undo() {
    setGames(previous => {
      const current = previous[difficulty]
      if (!current.history.length) return previous
      return { ...previous, [difficulty]: { ...current, board: current.history[current.history.length - 1], history: current.history.slice(0, -1) } }
    })
  }

  function reset() {
    setGames(previous => {
      const current = previous[difficulty]
      return { ...previous, [difficulty]: { ...current, board: [...current.puzzle.givens], history: [...current.history, current.board] } }
    })
  }

  function newPuzzle() {
    seed.current = (seed.current + 3) >>> 0
    const next = makeGame(difficulty, seed.current)
    setGames(previous => ({ ...previous, [difficulty]: next }))
    setFocusIndex(next.puzzle.givens.findIndex(cell => cell === null))
  }

  return <section className="binary-game" aria-label="Binary puzzle">
    <header className="binary-game-heading"><span className="binary-game-kicker">A SMALL DETOUR / BINARY</span><h3>Take a break from recruiting.</h3><p className="binary-game-intro">A little logic, just for fun.</p></header>
    <div className="binary-rules" id="binary-rules"><p>Fill every row and column with equal 0s and 1s. No three matching digits together, horizontally or vertically. Every row and column must be unique.</p></div>
    <div className="binary-difficulties" role="group" aria-label="Puzzle difficulty">{difficulties.map(level => <button key={level} className="binary-difficulty" aria-label={difficultySettings[level].label} aria-pressed={difficulty === level} onClick={() => selectDifficulty(level)}><span>{difficultySettings[level].label}</span><small>{difficultySettings[level].size} × {difficultySettings[level].size}</small></button>)}</div>
    <div className="binary-toolbar"><span className="binary-progress">{filled} / {size * size} filled</span><span className="binary-progress">{givens.filter(cell => cell !== null).length} clues</span></div>
    <div className={`binary-board ${analysis.complete ? 'is-solved' : ''}`} role="grid" aria-label={`${size} by ${size} Binary board`} aria-describedby="binary-rules binary-instructions" aria-rowcount={size} aria-colcount={size} style={{ '--board-size': size } as CSSProperties}>
      {Array.from({ length: size }, (_, row) => <div className="binary-row" role="row" key={row}>{Array.from({ length: size }, (_, column) => {
        const index = row * size + column
        const value = game.board[index]
        const isGiven = givens[index] !== null
        return <div role="gridcell" key={column} className="binary-cell-slot" aria-rowindex={row + 1} aria-colindex={column + 1}>
          <button ref={element => { cells.current[index] = element }} type="button" data-index={index} className={`binary-cell ${isGiven ? 'is-given' : ''} ${value === 0 ? 'is-zero' : value === 1 ? 'is-one' : ''} ${conflicts.has(index) ? 'is-conflict' : ''}`} disabled={isGiven} tabIndex={focusIndex === index ? 0 : -1} aria-label={`Row ${row + 1}, column ${column + 1}, ${value === null ? 'empty' : value}${isGiven ? ', given' : ''}`} aria-invalid={conflicts.has(index) || undefined} onFocus={() => setFocusIndex(index)} onClick={() => updateCell(index)} onKeyDown={event => onCellKey(event, index)}>{value}</button>
        </div>
      })}</div>)}
    </div>
    <small className="binary-instructions" id="binary-instructions">Tap to cycle: empty → 0 → 1. Keyboard: 0 / 1 to enter, Delete to clear.</small>
    <div className={`binary-status ${analysis.complete ? 'is-solved' : ''} ${conflicts.size ? 'has-conflicts' : ''}`} role="status" aria-live="polite">{analysis.complete ? 'Solved. Nicely done.' : analysis.message ?? `${size * size - filled} squares to go. Take your time.`}</div>
    <div className="binary-controls"><button type="button" disabled={!game.history.length} onClick={undo}>Undo</button><button type="button" disabled={!hasChanges} onClick={reset}>Reset</button><button type="button" className="is-primary" onClick={newPuzzle}>New puzzle</button></div>
  </section>
}
