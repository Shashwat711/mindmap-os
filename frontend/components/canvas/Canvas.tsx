"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface CanvasProps {
  children: ReactNode;
}

const MIN_SCALE = 0.3;
const MAX_SCALE = 3;
const GRID_SIZE = 24;

export function Canvas({ children }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = node!.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const delta = -e.deltaY * 0.0015;

      setScale((prev) => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + prev * delta));
        setOffset((prevOffset) => {
          const ratio = next / prev;
          return {
            x: cursorX - (cursorX - prevOffset.x) * ratio,
            y: cursorY - (cursorY - prevOffset.y) * ratio,
          };
        });
        return next;
      });
    }

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.target !== e.currentTarget) return;
    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!panning || !panStart.current) return;
    setOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.x),
      y: panStart.current.oy + (e.clientY - panStart.current.y),
    });
  }

  function endPan() {
    setPanning(false);
    panStart.current = null;
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      className={`relative h-full w-full overflow-hidden bg-background ${
        panning ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`,
        backgroundPosition: `${offset.x}px ${offset.y}px`,
      }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
    </div>
  );
}
