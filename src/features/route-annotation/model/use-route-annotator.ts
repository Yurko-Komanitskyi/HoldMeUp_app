import { useState, useRef, useCallback, useMemo } from 'react';
import { PanResponder, type LayoutChangeEvent } from 'react-native';
import { CIRCLE_SIZES, PATH_STROKE_WIDTH } from '../lib/constants';
import type {
  AnnotationShape,
  AnnotationCircle,
  AnnotationPath,
  Tool,
  CircleSizeLabel,
  AnnotationData,
} from './types';

let idCounter = 0;
function nextId(): string {
  return `shape-${Date.now()}-${++idCounter}`;
}

function pointsToD(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const [first, ...rest] = points;
  return (
    `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ` +
    rest.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  );
}

export function useRouteAnnotator(initialShapes: AnnotationShape[] = []) {
  const [tool, setTool] = useState<Tool>('circle');
  const [color, setColor] = useState('#3b82f6');
  const [circleSize, setCircleSize] = useState<CircleSizeLabel>('m');
  const [shapes, setShapes] = useState<AnnotationShape[]>(initialShapes);
  const [livePathD, setLivePathD] = useState<string | null>(null);

  const canvasSize = useRef({ width: 0, height: 0 });
  const livePoints = useRef<{ x: number; y: number }[]>([]);
  const isDrawing = useRef(false);

  const stateRefs = useRef({ tool, color, circleSize });
  stateRefs.current = { tool, color, circleSize };

  const onCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    canvasSize.current = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => stateRefs.current.tool === 'path',

        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          const current = stateRefs.current;

          if (current.tool === 'erase') {
            const hitRadius = 24;
            setShapes((prev) => {
              let bestIndex = -1;
              let bestDistSq = Number.POSITIVE_INFINITY;
              prev.forEach((shape, index) => {
                let dx = 0;
                let dy = 0;
                if (shape.type === 'circle') {
                  dx = shape.cx - locationX;
                  dy = shape.cy - locationY;
                } else {
                  dx = canvasSize.current.width / 2 - locationX;
                  dy = canvasSize.current.height / 2 - locationY;
                }
                const d2 = dx * dx + dy * dy;
                if (d2 < bestDistSq) {
                  bestDistSq = d2;
                  bestIndex = index;
                }
              });
              if (bestIndex === -1 || bestDistSq > hitRadius * hitRadius) return prev;
              const clone = [...prev];
              clone.splice(bestIndex, 1);
              return clone;
            });
            return;
          }

          if (current.tool === 'circle') {
            const sizeEntry = CIRCLE_SIZES.find((s) => s.label === current.circleSize);
            const circle: AnnotationCircle = {
              type: 'circle',
              id: nextId(),
              cx: locationX,
              cy: locationY,
              r: sizeEntry?.radius ?? 30,
              color: current.color,
            };
            setShapes((prev) => [...prev, circle]);
          } else {
            isDrawing.current = true;
            livePoints.current = [{ x: locationX, y: locationY }];
            setLivePathD(null);
          }
        },

        onPanResponderMove: (evt) => {
          if (stateRefs.current.tool !== 'path' || !isDrawing.current) return;
          const { locationX, locationY } = evt.nativeEvent;
          livePoints.current = [...livePoints.current, { x: locationX, y: locationY }];
          setLivePathD(pointsToD(livePoints.current));
        },

        onPanResponderRelease: () => {
          if (stateRefs.current.tool !== 'path' || !isDrawing.current) return;
          isDrawing.current = false;
          const pts = livePoints.current;
          livePoints.current = [];
          setLivePathD(null);
          if (pts.length < 2) return;
          const pathShape: AnnotationPath = {
            type: 'path',
            id: nextId(),
            d: pointsToD(pts),
            color: stateRefs.current.color,
            strokeWidth: PATH_STROKE_WIDTH,
          };
          setShapes((prev) => [...prev, pathShape]);
        },
      }),
    []
  );

  const undo = useCallback(() => setShapes((prev) => prev.slice(0, -1)), []);
  const clearAll = useCallback(() => setShapes([]), []);

  const getExportData = useCallback((): AnnotationData => {
    return {
      canvasWidth: canvasSize.current.width,
      canvasHeight: canvasSize.current.height,
      shapes,
    };
  }, [shapes]);

  return {
    tool,
    setTool,
    color,
    setColor,
    circleSize,
    setCircleSize,
    shapes,
    livePathD,
    onCanvasLayout,
    panHandlers: panResponder.panHandlers,
    undo,
    clearAll,
    getExportData,
  };
}
