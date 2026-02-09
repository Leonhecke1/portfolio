import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import { spacestationModules, type SpacestationModule } from '../spacestationData';
import useImage from 'use-image'; // For loading images if needed for module textures/icons

// --- Constants for Module Layout ---
const CORE_SIZE = 80;
const MODULE_RADIUS = 30; // Base size for modules
const MODULE_SPACING = 80;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;
const CORE_X = CANVAS_WIDTH / 2;
const CORE_Y = CANVAS_HEIGHT / 2;

// Helper function to get color based on module type
const getModuleColor = (moduleType: SpacestationModule['moduleType'], isActive: boolean) => {
  let color = '#E07A5F'; // Default primary color
  switch (moduleType) {
    case 'command':
      color = '#F2CC8F'; // Soft light orange
      break;
    case 'habitat':
      color = '#B05B4A'; // Darker terracotta
      break;
    case 'lab':
      color = '#4CAF50'; // Greenish for labs
      break;
    case 'observatory':
      color = '#2196F3'; // Blueish for observatory
      break;
    case 'storage':
      color = '#9E9E9E'; // Grey for storage
      break;
    case 'training':
      color = '#FFC107'; // Amber for training
      break;
    case 'archive':
      color = '#607D8B'; // Blue grey for archive
      break;
  }
  return isActive ? '#E0F2F7' : color; // Lighter/brighter when active
};

interface KonvaModuleProps {
  module: SpacestationModule;
  x: number;
  y: number;
  rotation?: number;
  onNodeHover: (module: SpacestationModule | null) => void;
  isActive: boolean;
  onNodeClick: (module: SpacestationModule) => void;
}

const KonvaModule: React.FC<KonvaModuleProps> = ({ module, x, y, rotation = 0, onNodeHover, isActive, onNodeClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getShape = () => {
    switch (module.moduleType) {
      case 'command':
        return (
          <Rect
            width={MODULE_RADIUS * 2}
            height={MODULE_RADIUS * 1.2}
          />
        );
      case 'habitat':
        return (
          <Circle
            radius={MODULE_RADIUS}
          />
        );
      case 'lab':
        return (
          <Rect
            width={MODULE_RADIUS * 1.5}
            height={MODULE_RADIUS * 1.5}
            cornerRadius={MODULE_RADIUS * 0.3}
          />
        );
      case 'observatory':
        return (
          <Circle
            radius={MODULE_RADIUS * 0.8}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={MODULE_RADIUS * 0.8}
            fillRadialGradientColorStops={[0, getModuleColor(module.moduleType, isActive || isHovered), 1, 'black']}
          />
        );
      case 'storage':
        return (
          <Rect
            width={MODULE_RADIUS * 1.8}
            height={MODULE_RADIUS}
            cornerRadius={MODULE_RADIUS * 0.2}
          />
        );
      case 'training':
        return (
          <Circle
            radius={MODULE_RADIUS * 0.9}
            fillPatternImage={undefined} // Could add a pattern later
          />
        );
      case 'archive':
        return (
          <Rect
            width={MODULE_RADIUS * 1.2}
            height={MODULE_RADIUS * 1.8}
            cornerRadius={MODULE_RADIUS * 0.1}
          />
        );
      default:
        return <Circle radius={MODULE_RADIUS} />;
    }
  };

  const scale = isActive || isHovered ? 1.2 : 1;
  const fillColor = getModuleColor(module.moduleType, isActive || isHovered);

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      scaleX={scale}
      scaleY={scale}
      onMouseEnter={() => {
        setIsHovered(true);
        onNodeHover(module);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onNodeHover(null);
      }}
      onClick={() => onNodeClick(module)}
      onTap={() => onNodeClick(module)}
    >
      {getShape()}
      <Text
        text={module.type === 'experience' ? module.title : module.degree}
        fontSize={14}
        fill={isActive || isHovered ? '#3D3132' : '#F7EFE0'} // Dark text on bright hover, light otherwise
        align="center"
        verticalAlign="middle"
        width={MODULE_RADIUS * 2.5}
        height={MODULE_RADIUS * 2.5}
        offsetX={MODULE_RADIUS * 1.25}
        offsetY={MODULE_RADIUS * 1.25}
        rotation={-rotation} // Counter-rotate text to keep it horizontal
        wrap="word"
      />
    </Group>
  );
};

const SpaceStationTimeline: React.FC = () => {
  const [activeModule, setActiveModule] = useState<SpacestationModule | null>(null);
  const [clickedModule, setClickedModule] = useState<SpacestationModule | null>(null);

  const handleNodeClick = (module: SpacestationModule) => {
    setClickedModule(module);
  };

  const handleNodeHover = (module: SpacestationModule | null) => {
    setActiveModule(module);
  };

  // --- Module Layout Calculation ---
  const modulesWithPositions = spacestationModules.map((module, index) => {
    const angle = (index / spacestationModules.length) * Math.PI * 2; // Distribute modules in a circle
    const distance = CORE_SIZE + MODULE_RADIUS + (MODULE_SPACING * (index % 2 + 1)); // Stagger distances
    const x = CORE_X + distance * Math.cos(angle);
    const y = CORE_Y + distance * Math.sin(angle);
    const rotation = (angle * 180 / Math.PI) + 90; // Rotate to face outwards

    return { ...module, calculatedPosition: { x, y, rotation } };
  });

  return (
    <section id="spacestation-timeline" className="spacestation-timeline-section">
      <div className="section-container">
        <h2 className="section-title">Mein Werdegang: Die Raumstation</h2>
        <p className="section-subtitle">Erkunde die Module meiner beruflichen und akademischen Reise.</p>
        
        <div className="spacestation-container">
          <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="konva-stage">
            <Layer>
              {/* Central Core */}
              <Circle
                x={CORE_X}
                y={CORE_Y}
                radius={CORE_SIZE}
                fill="#3D3132" // Dark
                stroke="#E07A5F" // Primary
                strokeWidth={3}
                shadowColor="#E07A5F"
                shadowBlur={10}
                shadowOpacity={0.8}
                draggable
              />
              <Text
                x={CORE_X}
                y={CORE_Y}
                text="Station Core"
                fontSize={18}
                fill="#F7EFE0" // Light
                align="center"
                verticalAlign="middle"
                width={CORE_SIZE * 2}
                height={CORE_SIZE * 2}
                offsetX={CORE_SIZE}
                offsetY={CORE_SIZE}
              />

              {/* Connection Lines from Core to Modules */}
              {modulesWithPositions.map((module, index) => (
                <Line
                  key={`conn-${module.id}`}
                  points={[CORE_X, CORE_Y, module.calculatedPosition.x, module.calculatedPosition.y]}
                  stroke="#E07A5F"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.5}
                  dash={[10, 5]}
                  opacity={0.7}
                />
              ))}

              {/* Modules */}
              {modulesWithPositions.map((module) => (
                <KonvaModule
                  key={module.id}
                  module={module}
                  x={module.calculatedPosition.x}
                  y={module.calculatedPosition.y}
                  rotation={module.calculatedPosition.rotation}
                  onNodeHover={handleNodeHover}
                  isActive={activeModule?.id === module.id}
                  onNodeClick={handleNodeClick}
                />
              ))}
            </Layer>
          </Stage>

          {/* Details Panel */}
          {clickedModule && (
            <div
              className="spacestation-details-panel"
              style={{
                left: `${clickedModule.calculatedPosition.x + 50}px`,
                top: `${clickedModule.calculatedPosition.y}px`,
              }}
            >
              <h3>{clickedModule.type === 'experience' ? clickedModule.title : clickedModule.degree}</h3>
              <h4>{clickedModule.type === 'experience' ? clickedModule.company : clickedModule.institution}</h4>
              <p className="date">{clickedModule.date}</p>
              {clickedModule.type === 'experience' && (
                <ul>
                  {clickedModule.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
              <button className="close-panel-btn" onClick={() => setClickedModule(null)}>X</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SpaceStationTimeline;
