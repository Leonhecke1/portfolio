import React, { useState, useRef, useMemo } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import ButtonBlock from './ProjectDeltaBlocks/ButtonBlock';
import TextBlock from './ProjectDeltaBlocks/TextBlock';
import ConnectionConfigModal from './ConnectionConfigModal'; // Import the new modal

// Define a type for each block
type BlockType = 'button' | 'text' | 'grid';

export interface Block {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  color?: string; // For text color, background color etc.
  bgColor?: string; // New: for background color
  props?: any;
}

export type TriggerEvent = 'onClick'; // Extendable: 'onHover', 'onDoubleClick' etc.
export type ActionType = 'changeTextColor' | 'changeBackgroundColor' | 'toggleVisibility'; // Extendable
export type ActionValue = string; // e.g., hex color code, or 'next' for cycling, or 'toggle'

// Interface for connections between blocks
export interface Connection {
  id: string; // Unique identifier for the connection
  sourceId: string;
  targetId: string;
  triggerEvent: TriggerEvent;
  actionType: ActionType;
  actionValue: ActionValue;
}

interface DraggableBlockProps {
  id: string;
  children: React.ReactNode;
  initialPosition: { x: number; y: number };
  onConnectStart: (id: string) => void;
  onRemove: (id: string) => void; // New prop
  isConnecting: boolean;
  isSourceOfConnection: boolean; // New prop to indicate if this block is a source for any connection
  blockRef: (el: HTMLDivElement | null) => void;
}

function Draggable(props: DraggableBlockProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
    disabled: props.isConnecting || props.isSourceOfConnection, // Disable drag when connecting or if it's a source of a connection
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    position: 'absolute' as const,
    left: props.initialPosition.x,
    top: props.initialPosition.y,
    zIndex: 1, // Ensure dragged item is on top
    cursor: (props.isConnecting || props.isSourceOfConnection) ? 'not-allowed' : 'grab', // Changed cursor
  } : {
    position: 'absolute' as const,
    left: props.initialPosition.x,
    top: props.initialPosition.y,
    cursor: (props.isConnecting || props.isSourceOfConnection) ? 'not-allowed' : 'grab', // Changed cursor
  };

  return (
    <div ref={(el) => { setNodeRef(el); props.blockRef(el); }} style={style} {...listeners} {...attributes}>
      {props.children}
      <button 
        className="connect-button" 
        onClick={(e) => {
          e.stopPropagation(); // Prevent click from bubbling
          props.onConnectStart(props.id);
        }}
        onPointerDown={(e) => {
          e.stopPropagation(); // Prevent pointerdown from initiating drag
        }}
      >+
      </button>
      <button 
        className="remove-button" 
        onClick={(e) => {
          e.stopPropagation();
          props.onRemove(props.id);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >-
      </button>
    </div>
  );
}

const availableColors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

const ProjectDeltaSandbox: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connecting, setConnecting] = useState<{ sourceId: string | null }>({ sourceId: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentConnectionToConfigure, setCurrentConnectionToConfigure] = useState<Partial<Connection> | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const memoizedIsSourceOfConnection = useMemo(() => {
    const sourceIds = new Set(connections.map(conn => conn.sourceId));
    return new Map(blocks.map(block => [block.id, sourceIds.has(block.id)]));
  }, [connections, blocks]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      x: 50 + blocks.length * 20,
      y: 50 + blocks.length * 20,
      color: '#ffffff', // Default text color
      bgColor: '#3D3132' // Default background color
    };
    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
  };
  
  const handleDragEnd = ({delta, active}) => {
    console.log('Drag End:', { delta, active });
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id === active.id) {
          return { ...block, x: block.x + delta.x, y: block.y + delta.y };
        }
        return block;
      })
    );
  };
  
  const handleConnectStart = (sourceId: string) => {
    console.log('Connecting started from:', sourceId);
    // Check if this sourceId already has an outgoing connection
    const existingConnection = connections.find(conn => conn.sourceId === sourceId);

    if (existingConnection) {
      // If an existing connection is found, pre-fill the modal for editing
      setCurrentConnectionToConfigure(existingConnection);
      setIsModalOpen(true);
      setConnecting({ sourceId: null }); // Exit connecting mode, as we're now editing
    } else {
      // Otherwise, proceed with initiating a new connection
      setConnecting({ sourceId });
    }
  };
  
  const handleBlockClick = (blockId: string) => {
    // console.log('Block clicked (for connection):', blockId, 'Connecting state:', connecting.sourceId);
    if (connecting.sourceId && connecting.sourceId !== blockId) {
      // Temporarily store connection details and open modal for configuration
      setCurrentConnectionToConfigure({
        sourceId: connecting.sourceId,
        targetId: blockId,
        triggerEvent: 'onClick', // Default for now
        actionType: 'changeTextColor', // Default for now
        actionValue: '#ff0000', // Default for now
      });
      setIsModalOpen(true);
      setConnecting({ sourceId: null }); // Exit connecting mode
    } else if (connecting.sourceId === blockId) {
      // console.log('Clicked on source block again, cancelling connection.');
      setConnecting({ sourceId: null });
    }
  };

  const handleSaveConnectionConfig = (configuredConnection: Connection) => {
    if (configuredConnection.id) {
      // If the connection has an ID, it means we are editing an existing one
      setConnections(prev =>
        prev.map(conn =>
          conn.id === configuredConnection.id ? configuredConnection : conn
        )
      );
    } else {
      // Otherwise, it's a new connection, assign a new ID
      setConnections(prev => [...prev, { ...configuredConnection, id: `conn-${Date.now()}` }]);
    }
    setIsModalOpen(false);
    setCurrentConnectionToConfigure(null);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    setIsModalOpen(false);
    setCurrentConnectionToConfigure(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentConnectionToConfigure(null);
    setConnecting({ sourceId: null }); // Ensure connecting mode is off if modal cancelled
  };

  const handleBlockAction = (sourceId: string) => {
    connections
      .filter(c => c.sourceId === sourceId && c.triggerEvent === 'onClick')
      .forEach(connection => {
        const { targetId, actionType, actionValue } = connection;

        setBlocks(prevBlocks =>
          prevBlocks.map(block => {
            if (block.id === targetId) {
              if (actionType === 'changeTextColor') {
                const currentColorIndex = availableColors.indexOf(block.color || '#ffffff');
                const nextColorIndex = (currentColorIndex + 1) % availableColors.length;
                return { ...block, color: actionValue === 'next' ? availableColors[nextColorIndex] : actionValue };
              } else if (actionType === 'changeBackgroundColor') {
                const currentBgColorIndex = availableColors.indexOf(block.bgColor || '#3D3132'); // Use block.bgColor
                const nextBgColorIndex = (currentBgColorIndex + 1) % availableColors.length;
                return { ...block, bgColor: actionValue === 'next' ? availableColors[nextBgColorIndex] : actionValue };
              }
            }
            return block;
          })
        );
      });
  };

  const getLineCoordinates = (connection: Connection) => { // Accept full connection object
    const sourceEl = blockRefs.current.get(connection.sourceId);
    const targetEl = blockRefs.current.get(connection.targetId);
    const sourceBlock = blocks.find(b => b.id === connection.sourceId);
    const targetBlock = blocks.find(b => b.id === connection.targetId);

    if (sourceEl && targetEl && sourceBlock && targetBlock) {
      // Calculate center points relative to the sandbox-canvas
      const sourceCenterX = sourceBlock.x + (sourceEl.offsetWidth / 2);
      const sourceCenterY = sourceBlock.y + (sourceEl.offsetHeight / 2);
      const targetCenterX = targetBlock.x + (targetEl.offsetWidth / 2);
      const targetCenterY = targetBlock.y + (targetEl.offsetHeight / 2);
      
      return {
        connectionId: connection.id, // Include the connection ID
        x1: sourceCenterX,
        y1: sourceCenterY,
        x2: targetCenterX,
        y2: targetCenterY,
      };
    }
    return null;
  };

  const lineCoordinates = useMemo(() => {
    // Map connections and pass the full connection object to getLineCoordinates
    return connections.map(conn => getLineCoordinates(conn)).filter(Boolean);
  }, [connections, blocks]);


  const handleRemoveBlock = (blockId: string) => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
    setConnections(prevConnections =>
      prevConnections.filter(
        conn => conn.sourceId !== blockId && conn.targetId !== blockId
      )
    );
  };

  const handleLineClick = (connectionId: string) => {
    const connectionToEdit = connections.find(conn => conn.id === connectionId);
    if (connectionToEdit) {
      setCurrentConnectionToConfigure(connectionToEdit);
      setIsModalOpen(true);
      setConnecting({ sourceId: null }); // Exit connection mode if active
    }
  };

  const handleReset = () => {
    setBlocks([]);
    setConnections([]);
    setConnecting({ sourceId: null });
  }

  const renderBlockContent = (block: Block, isSourceOfConnection: boolean) => {
    const commonProps = {
      id: block.id,
      onClick: connecting.sourceId ? () => handleBlockClick(block.id) : undefined, // Only enable if connecting
      style: connecting.sourceId ? { cursor: 'crosshair' } : {}, // Change cursor when connecting, ensure it's an object
    };

    const newOnClick = isSourceOfConnection
      ? () => handleBlockAction(block.id)
      : commonProps.onClick;

    switch (block.type) {
      case 'button':
        // If this button is a source of a connection, its click should trigger the action.
        // Otherwise, it participates in connection targeting if connecting.sourceId is active.
        return <ButtonBlock
                  {...block.props}
                  onClick={newOnClick}
                  style={commonProps.style} // Apply cursor style if connecting
                />;
      case 'text':
        return <TextBlock
                {...block.props}
                {...commonProps} // Pass all common props
                onClick={newOnClick} // Override onClick
                content={`Text Block (ID: ${block.id})`}
                style={{ ...commonProps.style, color: block.color, backgroundColor: block.bgColor }}
              />;
      default:
        return null;
    }
  };
  
  return (
    <div className="project-delta-sandbox">
      <h2>Project Delta Sandbox</h2>
      <p>This is where users can combine different building blocks.</p>

      {connecting.sourceId && (
        <div className="connection-status">
          Connecting from {connecting.sourceId}. Click a target block.
          <button onClick={() => setConnecting({ sourceId: null })}>Cancel</button>
        </div>
      )}

      <div className="toolbar">
        <h3>Add Blocks:</h3>
        <button onClick={() => addBlock('button')}>Add Button</button>
        <button onClick={() => addBlock('text')}>Add Text Block</button>
        <button onClick={handleReset}>Reset</button>
      </div>
      
      <DndContext onDragEnd={handleDragEnd}>
        <div className="sandbox-canvas" style={{ position: 'relative', minHeight: '500px' }}>
          <svg className="connection-lines" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'auto', cursor: 'pointer' }}>
            {lineCoordinates.map((coords) => (
              // Ensure key includes connectionId for unique identification
              <line 
                key={coords.connectionId} 
                x1={coords.x1} y1={coords.y1} 
                x2={coords.x2} y2={coords.y2} 
                stroke="white" 
                strokeWidth="2" 
                onClick={() => handleLineClick(coords.connectionId)} 
              />
            ))}
          </svg>
          {blocks.length === 0 ? (
            <p>Click a button above to add blocks to the sandbox. Then drag them around!</p>
          ) : (
            blocks.map((block) => (
              <Draggable 
                key={block.id} 
                id={block.id} 
                initialPosition={{ x: block.x, y: block.y }}
                onConnectStart={handleConnectStart}
                onRemove={handleRemoveBlock}
                isConnecting={!!connecting.sourceId}
                isSourceOfConnection={memoizedIsSourceOfConnection.get(block.id) || false} // Pass the new prop
                blockRef={(el) => blockRefs.current.set(block.id, el)}
              >
                {renderBlockContent(block, memoizedIsSourceOfConnection.get(block.id) || false)}
              </Draggable>
            ))
          )}
        </div>
      </DndContext>

      {isModalOpen && currentConnectionToConfigure && (
        <ConnectionConfigModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveConnectionConfig}
          onDelete={handleDeleteConnection}
          initialConnection={currentConnectionToConfigure}
          blocks={blocks.map(b => ({ id: b.id, type: b.type }))}
        />
      )}
    </div>
  );
};

export default ProjectDeltaSandbox;
