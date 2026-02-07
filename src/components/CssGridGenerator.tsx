import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { produce } from 'immer';

/* ----------------------------------------
   Helpers
---------------------------------------- */

const generateAreaName = (index: number): string => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  let num = index;

  if (index === 0) return alphabet[0];

  while (num >= 0) {
    result = alphabet[num % alphabet.length] + result;
    num = Math.floor(num / alphabet.length) - 1;
  }
  return result;
};

const getNextAreaName = (matrix: string[][]): string => {
  const used = new Set<string>();
  matrix.flat().forEach(a => used.add(a));

  let i = 0;
  while (used.has(generateAreaName(i))) {
    i++;
  }
  return generateAreaName(i);
};

interface Cell {
  row: number;
  col: number;
  area: string;
}

/* ----------------------------------------
   Component
---------------------------------------- */

const CssGridGenerator: React.FC = () => {
  const [gridConfig, setGridConfig] = useState({ rows: 4, cols: 4 });
  const [gridMatrix, setGridMatrix] = useState<string[][]>([]);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [pulsingArea, setPulsingArea] = useState<string | null>(null); // New state

  /* ---------- Init ---------- */

  const initializeGrid = useCallback((rows: number, cols: number) => {
    const matrix: string[][] = [];
    let idx = 0;

    for (let r = 0; r < rows; r++) {
      matrix[r] = [];
      for (let c = 0; c < cols; c++) {
        matrix[r][c] = generateAreaName(idx++);
      }
    }

    setGridMatrix(matrix);
    setSelectedCells([]);
  }, []);

  useEffect(() => {
    initializeGrid(gridConfig.rows, gridConfig.cols);
  }, [gridConfig, initializeGrid]);

  /* ---------- Utils ---------- */

  const getCellsOfArea = (area: string): Cell[] => {
    const cells: Cell[] = [];

    gridMatrix.forEach((row, r) =>
      row.forEach((a, c) => {
        if (a === area) {
          cells.push({ row: r, col: c, area });
        }
      })
    );

    return cells;
  };

  /* ---------- Controls ---------- */

  const handleDimensionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    const num = Math.max(1, Math.min(12, parseInt(value) || 1));

    setGridConfig(prev => ({
      ...prev,
      [id === 'grid-rows' ? 'rows' : 'cols']: num
    }));
  };

  /* ---------- Selection (AREA based) ---------- */

  const handleCellClick = (
    row: number,
    col: number,
    e: React.MouseEvent
  ) => {
    const area = gridMatrix[row][col];
    const areaCells = getCellsOfArea(area);

    setSelectedCells(prev => {
      const alreadySelected = prev.some(c => c.area === area);

      if (e.ctrlKey || e.metaKey) {
        return alreadySelected
          ? prev.filter(c => c.area !== area)
          : [...prev, ...areaCells];
      }

      return areaCells;
    });
  };

  const isCellSelected = (row: number, col: number) =>
    selectedCells.some(c => c.row === row && c.col === col);

  /* ---------- Validation ---------- */

  const validateSelectionForMerge = () => {
    if (selectedCells.length < 2) return false;

    const minRow = Math.min(...selectedCells.map(c => c.row));
    const maxRow = Math.max(...selectedCells.map(c => c.row));
    const minCol = Math.min(...selectedCells.map(c => c.col));
    const maxCol = Math.max(...selectedCells.map(c => c.col));

    const expected =
      (maxRow - minRow + 1) * (maxCol - minCol + 1);

    return expected === selectedCells.length;
  };

  /* ---------- Merge ---------- */

  const mergeSelectedCells = () => {
    if (!validateSelectionForMerge()) return;

    const newArea = getNextAreaName(gridMatrix);

    const minRow = Math.min(...selectedCells.map(c => c.row));
    const maxRow = Math.max(...selectedCells.map(c => c.row));
    const minCol = Math.min(...selectedCells.map(c => c.col));
    const maxCol = Math.max(...selectedCells.map(c => c.col));

    const updated = produce(gridMatrix, draft => {
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          draft[r][c] = newArea;
        }
      }
    });

    setGridMatrix(updated);
    setSelectedCells([]);

    // Trigger pulse animation for the newly merged area
    setPulsingArea(newArea);
    setTimeout(() => {
      setPulsingArea(null);
    }, 600); // Duration matches CSS animation
  };

  const resetGrid = () =>
    initializeGrid(gridConfig.rows, gridConfig.cols);

  /* ---------- UNIQUE AREAS ---------- */

  const uniqueAreas = useMemo(() => {
    const map = new Map<string, { row: number; col: number }>();

    gridMatrix.forEach((row, r) =>
      row.forEach((area, c) => {
        if (!map.has(area)) {
          map.set(area, { row: r, col: c });
        }
      })
    );

    return Array.from(map.entries()).map(
      ([area, pos]) => ({ area, ...pos })
    );
  }, [gridMatrix]);

  /* ---------- CSS Output ---------- */

  const cssOutput = useMemo(() => {
    const rows = gridMatrix.map(
      r => `"${r.join(' ')}"`
    );

    return `
.grid-container {
  display: grid;
  grid-template-rows: repeat(${gridConfig.rows}, 1fr);
  grid-template-columns: repeat(${gridConfig.cols}, 1fr);
  grid-template-areas:
    ${rows.join('\n    ')};
  gap: 10px;
}`.trim();
  }, [gridMatrix, gridConfig]);

  const copyCssToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cssOutput);
      alert('CSS copied to clipboard!');
    } catch {
      alert('Copy failed');
    }
  };

  /* ---------- Render ---------- */

  return (
    <div className="css-grid-generator-container">
      <h2>CSS Grid Generator</h2>
      <p>Hold ctrl (or cmd) and select Cells to merge them</p>
      <div className="grid-controls">
        <label>Rows</label>
        <input
          id="grid-rows"
          type="number"
          value={gridConfig.rows}
          onChange={handleDimensionChange}
        />

        <label>Cols</label>
        <input
          id="grid-cols"
          type="number"
          value={gridConfig.cols}
          onChange={handleDimensionChange}
        />
      </div>

      <div className="grid-actions">
        <button
          className="btn-custom"
          onClick={mergeSelectedCells}
          disabled={!validateSelectionForMerge()}
        >
          Merge Selected
        </button>

        <button
          className="btn-custom"
          onClick={resetGrid}
        >
          Reset Grid
        </button>
      </div>

      <div
        className="grid-display"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateAreas: gridMatrix
            .map(r => `"${r.join(' ')}"`)
            .join(' ')
        }}
      >
        {uniqueAreas.map(({ area, row, col }) => (
          <div
            key={area}
            className={`grid-cell ${
              isCellSelected(row, col) ? 'selected' : ''
            } ${area === pulsingArea ? 'merged-pulse' : ''}`}
            style={{ gridArea: area }}
            onClick={e => handleCellClick(row, col, e)}
          >
            {area}
          </div>
        ))}
      </div>

      <div className="css-output">
        <h3>Generated CSS</h3>
        <pre>{cssOutput}</pre>

        <button
          className="btn-custom"
          onClick={copyCssToClipboard}
        >
          Copy CSS
        </button>
      </div>
    </div>
  );
};

export default CssGridGenerator;
