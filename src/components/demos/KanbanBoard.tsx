import React, { useEffect, useState } from 'react';
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { useLanguage } from '../../contexts/LanguageContext';

const STRINGS = {
  de: {
    columns: { todo: 'Zu erledigen', doing: 'In Arbeit', done: 'Fertig' },
    add: 'Karte hinzufügen',
    placeholder: 'Neue Aufgabe …',
    remove: 'Karte löschen',
    limit: 'WIP-Limit',
    limitHit: '„In Arbeit“ ist voll. Erst etwas fertig machen, dann Neues anfangen.',
    reset: 'Beispiel wiederherstellen',
    hint: 'Karten ziehen, oder mit Tab fokussieren und mit Leertaste und Pfeiltasten verschieben. Das Board wird in diesem Browser gespeichert.',
    empty: 'Noch keine Karten',
    seed: ['Komponenten-API entwerfen', 'Tests für den Parser schreiben', 'Lighthouse-Audit', 'Dark Mode prüfen', 'README schreiben', 'Projekt aufsetzen'],
  },
  en: {
    columns: { todo: 'To do', doing: 'In progress', done: 'Done' },
    add: 'Add card',
    placeholder: 'New task …',
    remove: 'Delete card',
    limit: 'WIP limit',
    limitHit: '“In progress” is full. Finish something before starting something new.',
    reset: 'Restore example',
    hint: 'Drag cards, or focus one with Tab and move it with Space and the arrow keys. The board is saved in this browser.',
    empty: 'No cards yet',
    seed: ['Design the component API', 'Write tests for the parser', 'Lighthouse audit', 'Check dark mode', 'Write the README', 'Set up the project'],
  },
};

type ColumnId = 'todo' | 'doing' | 'done';
interface Card { id: string; text: string; column: ColumnId }

const COLUMNS: ColumnId[] = ['todo', 'doing', 'done'];
const WIP_LIMIT = 3;
const STORAGE_KEY = 'lh-kanban';

const seedCards = (texts: string[]): Card[] => [
  { id: 'c1', text: texts[0], column: 'todo' },
  { id: 'c2', text: texts[1], column: 'todo' },
  { id: 'c3', text: texts[2], column: 'doing' },
  { id: 'c4', text: texts[3], column: 'doing' },
  { id: 'c5', text: texts[4], column: 'done' },
  { id: 'c6', text: texts[5], column: 'done' },
];

const readCards = (fallback: Card[]): Card[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Card[];
  } catch {
    // Storage blocked or corrupt: start from the example.
  }
  return fallback;
};

const CardView: React.FC<{ card: Card; onRemove: (id: string) => void; removeLabel: string }> = ({ card, onRemove, removeLabel }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `card:${card.id}` });
  return (
    <li ref={setDropRef} className={`kanban-slot${isOver ? ' is-over' : ''}`}>
      <div ref={setNodeRef} className={`kanban-card${isDragging ? ' is-dragging' : ''}`} {...listeners} {...attributes}>
        <span>{card.text}</span>
        <button
          type="button"
          className="kanban-remove"
          aria-label={`${removeLabel}: ${card.text}`}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(card.id)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8" /></svg>
        </button>
      </div>
    </li>
  );
};

const Column: React.FC<{ id: ColumnId; title: string; cards: Card[]; children: React.ReactNode; full: boolean; limitLabel: string; empty: string }> = ({
  id, title, cards, children, full, limitLabel, empty,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${id}` });
  return (
    <section ref={setNodeRef} className={`kanban-col${isOver ? ' is-over' : ''}${full ? ' is-full' : ''}`} aria-label={title}>
      <h3 className="kanban-col-title">
        {title}
        <span className="kanban-count">{id === 'doing' ? `${cards.length} / ${WIP_LIMIT} · ${limitLabel}` : cards.length}</span>
      </h3>
      <ul className="kanban-list">
        {cards.length === 0 && <li className="kanban-empty">{empty}</li>}
        {children}
      </ul>
    </section>
  );
};

const KanbanBoard: React.FC = () => {
  const { language } = useLanguage();
  const s = STRINGS[language];
  const [cards, setCards] = useState<Card[]>(() => readCards(seedCards(STRINGS.de.seed)));
  const [draft, setDraft] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // Not persisting is fine; the board still works for this visit.
    }
  }, [cards]);

  const byColumn = (col: ColumnId) => cards.filter((c) => c.column === col);

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
    setMessage('');
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const card = cards.find((c) => c.id === active.id);
    if (!card) return;
    const overId = String(over.id);
    const target = overId.startsWith('col:')
      ? { column: overId.slice(4) as ColumnId, before: null as string | null }
      : { column: cards.find((c) => `card:${c.id}` === overId)!.column, before: overId.slice(5) };
    if (target.before === card.id) return;
    if (target.column === 'doing' && card.column !== 'doing' && byColumn('doing').length >= WIP_LIMIT) {
      setMessage(s.limitHit);
      return;
    }
    setCards((prev) => {
      const rest = prev.filter((c) => c.id !== card.id);
      const moved = { ...card, column: target.column };
      if (target.before) {
        const i = rest.findIndex((c) => c.id === target.before);
        return [...rest.slice(0, i), moved, ...rest.slice(i)];
      }
      return [...rest, moved];
    });
  };

  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setCards((prev) => [...prev, { id: `c${Date.now()}`, text, column: 'todo' }]);
    setDraft('');
  };

  const active = cards.find((c) => c.id === activeId);

  return (
    <div className="demo kanban">
      <p className="demo-note">{s.hint}</p>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <Column key={col} id={col} title={s.columns[col]} cards={byColumn(col)} full={col === 'doing' && byColumn('doing').length >= WIP_LIMIT} limitLabel={s.limit} empty={s.empty}>
              {byColumn(col).map((card) => (
                <CardView key={card.id} card={card} removeLabel={s.remove} onRemove={(id) => setCards((prev) => prev.filter((c) => c.id !== id))} />
              ))}
            </Column>
          ))}
        </div>
        <DragOverlay>{active ? <div className="kanban-card is-overlay"><span>{active.text}</span></div> : null}</DragOverlay>
      </DndContext>
      <p className="demo-error" role="status">{message}</p>
      <form className="kanban-add" onSubmit={addCard}>
        <label className="sr-only" htmlFor="kanban-new">{s.add}</label>
        <input id="kanban-new" type="text" value={draft} placeholder={s.placeholder} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" className="btn">{s.add}</button>
        <button type="button" className="btn-accent" onClick={() => setCards(seedCards(s.seed))}>{s.reset}</button>
      </form>
    </div>
  );
};

export default KanbanBoard;
