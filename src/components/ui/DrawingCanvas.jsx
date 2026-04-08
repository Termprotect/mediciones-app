import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Minus, Type, Undo2, Trash2, Square, Triangle, Circle } from "lucide-react";

/**
 * Drawing canvas for window/door sketches.
 * Tools: line (straight + label), rectangle (with ancho/alto), triangle, halfmoon, freehand, text.
 * Fixed 2px line width. Supports touch and mouse.
 */

const COLORS = ["#FACC15", "#FFFFFF", "#EF4444", "#3B82F6", "#22C55E"];
const LINE_W = 2;

export default function DrawingCanvas({ initialData, onChange, readOnly = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [elements, setElements] = useState(initialData || []);
  const [tool, setTool] = useState("line");
  const [color, setColor] = useState("#FACC15");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [textInput, setTextInput] = useState(null);
  const [textValue, setTextValue] = useState("");
  const [canvasSize, setCanvasSize] = useState({ w: 400, h: 300 });

  // Resize canvas to container
  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setCanvasSize({ w, h: Math.max(280, Math.round(w * 0.6)) });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Notify parent
  useEffect(() => {
    if (onChange && !readOnly) onChange(elements);
  }, [elements, onChange, readOnly]);

  /* ── Drawing helpers ── */

  function drawLine(ctx, el, isPreview = false) {
    ctx.beginPath();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width || LINE_W;
    ctx.lineCap = "round";
    if (isPreview) ctx.setLineDash([6, 4]);
    ctx.moveTo(el.x1, el.y1);
    ctx.lineTo(el.x2, el.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (el.label) drawLabel(ctx, (el.x1 + el.x2) / 2, (el.y1 + el.y2) / 2, el.label, el.color, Math.atan2(el.y2 - el.y1, el.x2 - el.x1));
  }

  function drawRect(ctx, el, isPreview = false) {
    const x = Math.min(el.x1, el.x2);
    const y = Math.min(el.y1, el.y2);
    const w = Math.abs(el.x2 - el.x1);
    const h = Math.abs(el.y2 - el.y1);
    ctx.beginPath();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width || LINE_W;
    if (isPreview) ctx.setLineDash([6, 4]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
    // Dimension labels on edges
    if (el.labelW) drawLabel(ctx, x + w / 2, y - 2, el.labelW, el.color, 0, true);
    if (el.labelH) drawLabel(ctx, x - 2, y + h / 2, el.labelH, el.color, -Math.PI / 2, true);
  }

  function drawTriangle(ctx, el, isPreview = false) {
    // Isosceles triangle inscribed in the bounding box
    const x = Math.min(el.x1, el.x2);
    const y = Math.min(el.y1, el.y2);
    const w = Math.abs(el.x2 - el.x1);
    const h = Math.abs(el.y2 - el.y1);
    ctx.beginPath();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width || LINE_W;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (isPreview) ctx.setLineDash([6, 4]);
    ctx.moveTo(x + w / 2, y);       // top center
    ctx.lineTo(x + w, y + h);        // bottom right
    ctx.lineTo(x, y + h);            // bottom left
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    if (el.label) drawLabel(ctx, x + w / 2, y + h + 4, el.label, el.color, 0, true);
  }

  function drawHalfmoon(ctx, el, isPreview = false) {
    const cx = (el.x1 + el.x2) / 2;
    const cy = Math.max(el.y1, el.y2);
    const rx = Math.abs(el.x2 - el.x1) / 2;
    const ry = Math.abs(el.y2 - el.y1);
    ctx.beginPath();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width || LINE_W;
    if (isPreview) ctx.setLineDash([6, 4]);
    ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    if (el.label) drawLabel(ctx, cx, cy + 4, el.label, el.color, 0, true);
  }

  function drawFreehand(ctx, el) {
    if (!el.points || el.points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = el.color;
    ctx.lineWidth = el.width || LINE_W;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y);
    ctx.stroke();
  }

  function drawText(ctx, el) {
    ctx.font = `bold ${el.size || 13}px 'Segoe UI', Arial, sans-serif`;
    const tw = ctx.measureText(el.text).width + 6;
    ctx.fillStyle = "rgba(15,23,42,0.8)";
    ctx.fillRect(el.x - 3, el.y - 2, tw, (el.size || 13) + 6);
    ctx.fillStyle = el.color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(el.text, el.x, el.y);
  }

  function drawLabel(ctx, x, y, label, c, angle = 0, above = false) {
    ctx.save();
    ctx.translate(x, y);
    let rot = angle;
    if (rot > Math.PI / 2 || rot < -Math.PI / 2) rot += Math.PI;
    ctx.rotate(rot);
    ctx.font = "bold 11px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = above ? "bottom" : "bottom";
    const tw = ctx.measureText(label).width + 8;
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    ctx.fillRect(-tw / 2, -16, tw, 15);
    ctx.fillStyle = c;
    ctx.fillText(label, 0, -3);
    ctx.restore();
  }

  /* ── Main draw loop ── */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(148,163,184,0.08)";
    ctx.lineWidth = 1;
    const gs = 20;
    for (let x = 0; x <= canvas.width; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // Elements
    elements.forEach((el) => {
      if (el.type === "line") drawLine(ctx, el);
      else if (el.type === "rect") drawRect(ctx, el);
      else if (el.type === "triangle") drawTriangle(ctx, el);
      else if (el.type === "halfmoon") drawHalfmoon(ctx, el);
      else if (el.type === "freehand") drawFreehand(ctx, el);
      else if (el.type === "text") drawText(ctx, el);
    });

    // Preview
    if (isDrawing && startPoint && currentPoint) {
      const preview = { x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, color, width: LINE_W };
      if (tool === "line") drawLine(ctx, preview, true);
      else if (tool === "rect") drawRect(ctx, preview, true);
      else if (tool === "triangle") drawTriangle(ctx, preview, true);
      else if (tool === "halfmoon") drawHalfmoon(ctx, preview, true);
    }
  }, [elements, isDrawing, tool, startPoint, currentPoint, color]);

  useEffect(() => { draw(); }, [draw, canvasSize]);

  /* ── Event handlers ── */

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if (e.touches) return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const freehandPoints = useRef([]);

  const handleStart = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const pos = getPos(e);

    if (tool === "text") { setTextInput(pos); setTextValue(""); return; }

    setIsDrawing(true);
    if (tool === "freehand") {
      freehandPoints.current = [pos];
    } else {
      setStartPoint(pos);
      setCurrentPoint(pos);
    }
  };

  const handleMove = (e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    const pos = getPos(e);

    if (tool === "freehand") {
      freehandPoints.current.push(pos);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const pts = freehandPoints.current;
      if (pts.length >= 2) {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = LINE_W;
        ctx.lineCap = "round"; ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y); ctx.stroke();
      }
    } else {
      setCurrentPoint(pos);
    }
  };

  const handleEnd = (e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();

    if (tool === "line" && startPoint && currentPoint) {
      const dx = currentPoint.x - startPoint.x;
      const dy = currentPoint.y - startPoint.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        const label = prompt("Medida (ej: 1200 mm). Dejar vacío si no aplica:");
        setElements((prev) => [...prev, { type: "line", x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, color, width: LINE_W, label: label || "" }]);
      }
    } else if (tool === "rect" && startPoint && currentPoint) {
      const w = Math.abs(currentPoint.x - startPoint.x);
      const h = Math.abs(currentPoint.y - startPoint.y);
      if (w > 5 && h > 5) {
        const labelW = prompt("Ancho (ej: 1200 mm). Dejar vacío si no aplica:");
        const labelH = prompt("Alto (ej: 800 mm). Dejar vacío si no aplica:");
        setElements((prev) => [...prev, { type: "rect", x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, color, width: LINE_W, labelW: labelW || "", labelH: labelH || "" }]);
      }
    } else if (tool === "triangle" && startPoint && currentPoint) {
      const w = Math.abs(currentPoint.x - startPoint.x);
      const h = Math.abs(currentPoint.y - startPoint.y);
      if (w > 5 && h > 5) {
        const label = prompt("Medida (ej: base 1200 mm). Dejar vacío si no aplica:");
        setElements((prev) => [...prev, { type: "triangle", x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, color, width: LINE_W, label: label || "" }]);
      }
    } else if (tool === "halfmoon" && startPoint && currentPoint) {
      const w = Math.abs(currentPoint.x - startPoint.x);
      const h = Math.abs(currentPoint.y - startPoint.y);
      if (w > 5 && h > 5) {
        const label = prompt("Medida (ej: radio 600 mm). Dejar vacío si no aplica:");
        setElements((prev) => [...prev, { type: "halfmoon", x1: startPoint.x, y1: startPoint.y, x2: currentPoint.x, y2: currentPoint.y, color, width: LINE_W, label: label || "" }]);
      }
    } else if (tool === "freehand" && freehandPoints.current.length > 1) {
      setElements((prev) => [...prev, { type: "freehand", points: [...freehandPoints.current], color, width: LINE_W }]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
    freehandPoints.current = [];
  };

  const handleTextSubmit = () => {
    if (textInput && textValue.trim()) {
      setElements((prev) => [...prev, { type: "text", x: textInput.x, y: textInput.y, text: textValue.trim(), color, size: 13 }]);
    }
    setTextInput(null);
    setTextValue("");
  };

  const undo = () => setElements((prev) => prev.slice(0, -1));
  const clearAll = () => setElements([]);

  // Export
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current._exportImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const tmp = document.createElement("canvas");
        tmp.width = canvas.width; tmp.height = canvas.height;
        const ctx = tmp.getContext("2d");
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(0, 0, tmp.width, tmp.height);
        ctx.drawImage(canvas, 0, 0);
        return tmp.toDataURL("image/png");
      };
    }
  });

  /* ── Tool definitions ── */

  // HalfMoon icon as inline SVG component
  const HalfMoonIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18 A8 8 0 0 1 20 18" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );

  const tools = [
    { id: "line", icon: Minus, label: "Línea" },
    { id: "rect", icon: Square, label: "Rectángulo" },
    { id: "triangle", icon: Triangle, label: "Triángulo" },
    { id: "halfmoon", icon: HalfMoonIcon, label: "Media Luna" },
    { id: "freehand", icon: Pencil, label: "Libre" },
    { id: "text", icon: Type, label: "Texto" },
  ];

  const hints = {
    line: "Arrastra para dibujar una línea recta. Al soltar se pedirá la medida.",
    rect: "Arrastra para dibujar un rectángulo. Al soltar se pedirá ancho y alto.",
    triangle: "Arrastra para dibujar un triángulo isósceles dentro del área.",
    halfmoon: "Arrastra para dibujar una media luna (arco semicircular).",
    freehand: "Dibuja libremente con el dedo o mouse.",
    text: "Toca el canvas donde quieras colocar un texto o medida.",
  };

  if (readOnly) {
    return (
      <div ref={containerRef} className="w-full">
        {elements.length > 0 && (
          <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h}
            className="w-full rounded-xl border border-border bg-background" style={{ touchAction: "none" }} />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {tools.map((t) => (
          <button key={t.id} type="button"
            onClick={() => { setTool(t.id); setTextInput(null); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
              tool === t.id ? "bg-primary text-dark border-primary" : "bg-dark text-muted border-border hover:text-white"
            }`}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}

        <div className="w-px h-6 bg-border mx-0.5" />

        {/* Colors */}
        {COLORS.map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)}
            className={`w-5.5 h-5.5 rounded-full border-2 cursor-pointer transition-all ${
              color === c ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
            }`} style={{ backgroundColor: c, width: 22, height: 22 }} />
        ))}

        <div className="flex-1" />

        <button type="button" onClick={undo} disabled={elements.length === 0}
          className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-dark transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" title="Deshacer">
          <Undo2 className="w-4 h-4" />
        </button>
        <button type="button" onClick={clearAll} disabled={elements.length === 0}
          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-dark transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" title="Limpiar todo">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h}
          className="w-full rounded-xl border-2 border-border bg-background cursor-crosshair touch-none"
          onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
          onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd} />

        {textInput && (
          <div className="absolute z-10"
            style={{ left: `${(textInput.x / canvasSize.w) * 100}%`, top: `${(textInput.y / canvasSize.h) * 100}%` }}>
            <div className="flex gap-1 items-center bg-dark border-2 border-primary rounded-lg p-1 shadow-lg">
              <input type="text" value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleTextSubmit(); if (e.key === "Escape") { setTextInput(null); setTextValue(""); } }}
                placeholder="Medida..." autoFocus
                className="bg-transparent text-white text-xs px-2 py-1 outline-none w-28" />
              <button type="button" onClick={handleTextSubmit} className="px-2 py-1 bg-primary text-dark text-xs font-bold rounded cursor-pointer">OK</button>
              <button type="button" onClick={() => { setTextInput(null); setTextValue(""); }} className="px-1.5 py-1 text-muted text-xs cursor-pointer">✕</button>
            </div>
          </div>
        )}
      </div>

      <p className="text-[10px] text-muted">{hints[tool]}</p>
    </div>
  );
}
