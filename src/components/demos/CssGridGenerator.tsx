import React, { useState, useMemo } from 'react';
import { produce } from 'immer';
import { useLanguage } from '../../contexts/LanguageContext';

const STRINGS = {
  de: {
    hint: 'Zellen auswählen und zusammenführen. Mit Strg/Cmd-Klick oder der Mehrfachauswahl wählst du mehrere Bereiche.',
    rows: 'Zeilen',
    cols: 'Spalten',
    multi: 'Mehrfachauswahl',
    merge: 'Auswahl zusammenführen',
    reset: 'Raster zurücksetzen',
    output: 'Erzeugtes CSS',
    copy: 'CSS kopieren',
    copied: 'In die Zwischenablage kopiert.',
    copyFailed: 'Kopieren ging nicht; bitte markieren und selbst kopieren.',
    cell: 'Bereich',
    notRect: 'Die Auswahl muss ein lückenloses Rechteck bilden.',
  },
  en: {
    hint: 'Select cells and merge them. Ctrl/Cmd-click or multi-select picks several areas.',
    rows: 'Rows',
    cols: 'Columns',
    multi: 'Multi-select',
    merge: 'Merge selection',
    reset: 'Reset grid',
    output: 'Generated CSS',
    copy: 'Copy CSS',
    copied: 'Copied to the clipboard.',
    copyFailed: 'Copying failed; please select and copy it yourself.',
    cell: 'Area',
    notRect: 'The selection has to form a gap-free rectangle.',
  },
};

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

const buildMatrix = (rows: number, cols: number): string[][] => {
  let idx = 0;
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => generateAreaName(idx++)));
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
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [multi, setMulti] = useState(false);
  const [status, setStatus] = useState('');
  const [gridConfig, setGridConfig] = useState({ rows: 4, cols: 4 });
  const [gridMatrix, setGridMatrix] = useState<string[][]>(() => buildMatrix(4, 4));
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [pulsingArea, setPulsingArea] = useState<string | null>(null); // New state

  /* ---------- Init ---------- */

  // The grid is rebuilt in the handlers that change it, not in an effect.
  const initializeGrid = (rows: number, cols: number) => {
    setGridMatrix(buildMatrix(rows, cols));
    setSelectedCells([]);
  };

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

    const next = { ...gridConfig, [id === 'grid-rows' ? 'rows' : 'cols']: num };
    setGridConfig(next);
    initializeGrid(next.rows, next.cols);
  };

  /* ---------- Selection (AREA based) ---------- */

  const handleCellClick = (
    row: number,
    col: number,
    additive: boolean
  ) => {
    const area = gridMatrix[row][col];
    const areaCells = getCellsOfArea(area);

    setSelectedCells(prev => {
      const alreadySelected = prev.some(c => c.area === area);

      if (additive) {
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
      setStatus(s.copied);
    } catch {
      setStatus(s.copyFailed);
    }
  };

  /* ---------- Render ---------- */

  const canMerge = validateSelectionForMerge();

  return (
    <div className="css-grid-generator-container">
      <p>{s.hint}</p>
      <div className="grid-controls">
        <label htmlFor="grid-rows">{s.rows}</label>
        <input id="grid-rows" type="number" min={1} max={12} value={gridConfig.rows} onChange={handleDimensionChange} />
        <label htmlFor="grid-cols">{s.cols}</label>
        <input id="grid-cols" type="number" min={1} max={12} value={gridConfig.cols} onChange={handleDimensionChange} />
        <label className="toggle">
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} /> {s.multi}
        </label>
      </div>

      <div className="grid-actions">
        <button type="button" className="btn-custom" onClick={mergeSelectedCells} disabled={!canMerge}>{s.merge}</button>
        <button type="button" className="btn-accent" onClick={resetGrid}>{s.reset}</button>
      </div>
      {selectedCells.length > 1 && !canMerge && <p className="demo-note">{s.notRect}</p>}

      <div
        className="grid-display"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateAreas: gridMatrix.map(r => `"${r.join(' ')}"`).join(' ')
        }}
      >
        {uniqueAreas.map(({ area, row, col }) => (
          <button
            type="button"
            key={area}
            className={`grid-cell ${isCellSelected(row, col) ? 'selected' : ''} ${area === pulsingArea ? 'merged-pulse' : ''}`}
            style={{ gridArea: area }}
            aria-pressed={isCellSelected(row, col)}
            aria-label={`${s.cell} ${area}`}
            onClick={e => handleCellClick(row, col, multi || e.ctrlKey || e.metaKey)}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="css-output">
        <h3>{s.output}</h3>
        <pre>{cssOutput}</pre>
        <div className="demo-actions">
          <button type="button" className="btn-custom" onClick={copyCssToClipboard}>{s.copy}</button>
          <span className="demo-note" role="status">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default CssGridGenerator;
