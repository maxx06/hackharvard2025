import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, Position } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) => {
  // Smart edge positioning based on relative positions
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  // Determine best source and target positions based on relative positions
  let smartSourcePosition = sourcePosition;
  let smartTargetPosition = targetPosition;

  // If positions aren't explicitly set, calculate smart positions
  if (!sourcePosition || !targetPosition) {
    // Horizontal distance is greater - use left/right
    if (Math.abs(dx) > Math.abs(dy)) {
      smartSourcePosition = dx > 0 ? Position.Right : Position.Left;
      smartTargetPosition = dx > 0 ? Position.Left : Position.Right;
    }
    // Vertical distance is greater - use top/bottom
    else {
      smartSourcePosition = dy > 0 ? Position.Bottom : Position.Top;
      smartTargetPosition = dy > 0 ? Position.Top : Position.Bottom;
    }
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: smartSourcePosition,
    targetX,
    targetY,
    targetPosition: smartTargetPosition,
  });

  // Get edge color from style or default
  const edgeColor = (style?.stroke as string) || '#3b82f6';

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="px-2.5 py-1 rounded-md text-xs font-semibold shadow-md backdrop-blur-sm"
              style={{
                backgroundColor: edgeColor,
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;
