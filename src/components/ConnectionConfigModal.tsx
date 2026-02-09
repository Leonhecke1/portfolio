import React, { useState, useEffect } from 'react';
import type { Connection, TriggerEvent, ActionType, ActionValue } from '../components/ProjectDeltaSandbox'; // Assuming these are defined there

interface ConnectionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Connection) => void;
  onDelete: (connectionId: string) => void;
  initialConnection: Partial<Connection>; // For pre-filling existing connections
  blocks: { id: string; type: string }[]; // To display source/target block info
}

const availableTriggerEvents: TriggerEvent[] = ['onClick']; // For now, only onClick
const availableActionTypes: ActionType[] = ['changeTextColor', 'changeBackgroundColor']; // Extendable

const ConnectionConfigModal: React.FC<ConnectionConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialConnection,
  blocks,
}) => {
  const [triggerEvent, setTriggerEvent] = useState<TriggerEvent>(initialConnection.triggerEvent || 'onClick');
  const [actionType, setActionType] = useState<ActionType>(initialConnection.actionType || 'changeTextColor');
  const [actionValue, setActionValue] = useState<ActionValue>(initialConnection.actionValue || '#ff0000'); // Default to red

  useEffect(() => {
    if (isOpen) {
      setTriggerEvent(initialConnection.triggerEvent || 'onClick');
      setActionType(initialConnection.actionType || 'changeTextColor');
      setActionValue(initialConnection.actionValue || '#ff0000');
    }
  }, [isOpen, initialConnection]);

  const handleSave = () => {
    if (initialConnection.sourceId && initialConnection.targetId) {
      onSave({
        id: initialConnection.id || "",
        sourceId: initialConnection.sourceId,
        targetId: initialConnection.targetId,
        triggerEvent,
        actionType,
        actionValue,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialConnection.id) {
      onDelete(initialConnection.id);
    }
    onClose();
  };

  const sourceBlock = blocks.find(b => b.id === initialConnection.sourceId);
  const targetBlock = blocks.find(b => b.id === initialConnection.targetId);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Configure Connection</h3>
        <p>From: <strong>{sourceBlock?.id} ({sourceBlock?.type})</strong></p>
        <p>To: <strong>{targetBlock?.id} ({targetBlock?.type})</strong></p>

        <div className="form-group">
          <label htmlFor="triggerEvent">Trigger Event:</label>
          <select
            id="triggerEvent"
            value={triggerEvent}
            onChange={(e) => setTriggerEvent(e.target.value as TriggerEvent)}
          >
            {availableTriggerEvents.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="actionType">Action Type:</label>
          <select
            id="actionType"
            value={actionType}
            onChange={(e) => setActionType(e.target.value as ActionType)}
          >
            {availableActionTypes.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="actionValue">Action Value:</label>
          <input
            id="actionValue"
            type="text"
            value={actionValue}
            onChange={(e) => setActionValue(e.target.value)}
            placeholder="e.g., #ff0000 or 'next'"
          />
        </div>

        <div className="modal-actions">
          <button className="btn-custom" onClick={handleSave}>Save</button>
          <button className="btn-accent" onClick={onClose}>Cancel</button>
          {initialConnection.id && <button className="btn-danger" onClick={handleDelete}>Delete</button>}
        </div>
      </div>
    </div>
  );
};

export default ConnectionConfigModal;