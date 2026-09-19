import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

const MIN_CROP_SIZE = 0.05; // minimum 5% of stage

// 8 resize handle positions
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

function centeredCrop(width, height, aspect) {
  const padding = 0.9;
  if (!aspect) return { x: (1 - padding) / 2, y: (1 - padding) / 2, width: padding, height: padding };
  const imageAspect = width / height;
  const cropWidth = imageAspect > aspect ? padding * aspect / imageAspect : padding;
  const cropHeight = imageAspect > aspect ? padding : padding * imageAspect / aspect;
  return { x: (1 - cropWidth) / 2, y: (1 - cropHeight) / 2, width: cropWidth, height: cropHeight };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const HANDLE_STYLE = {
  nw: { top: -5, left: -5, cursor: "nw-resize" },
  n:  { top: -5, left: "calc(50% - 5px)", cursor: "n-resize" },
  ne: { top: -5, right: -5, cursor: "ne-resize" },
  e:  { top: "calc(50% - 5px)", right: -5, cursor: "e-resize" },
  se: { bottom: -5, right: -5, cursor: "se-resize" },
  s:  { bottom: -5, left: "calc(50% - 5px)", cursor: "s-resize" },
  sw: { bottom: -5, left: -5, cursor: "sw-resize" },
  w:  { top: "calc(50% - 5px)", left: -5, cursor: "w-resize" },
};

const RATIOS = [
  [null, "Freeform"], [1, "1:1 Square"], [4 / 3, "4:3 Landscape"],
  [16 / 9, "16:9 Wide"], [3 / 4, "3:4 Portrait"], [2 / 3, "2:3 Portrait"],
];

export default function ImageProcessingModal({ open, file, aspect = null, onCancel, onSave }) {
  const [src, setSrc] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [crop, setCrop] = useState(null);
  const [selectedAspect, setSelectedAspect] = useState(aspect);
  const [saving, setSaving] = useState(false);

  // drag.current holds the active interaction state:
  // { type: "move" | "resize", handle, startX, startY, startCrop, stageRect }
  const interaction = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    if (!open || !file) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    setDimensions(null);
    setCrop(null);
    setSelectedAspect(aspect);
    return () => URL.revokeObjectURL(objectUrl);
  }, [open, file, aspect]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => event.key === "Escape" && onCancel?.();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onCancel]);

  const cropStyle = useMemo(() => crop && ({
    left: `${crop.x * 100}%`,
    top: `${crop.y * 100}%`,
    width: `${crop.width * 100}%`,
    height: `${crop.height * 100}%`,
  }), [crop]);

  function setRatio(nextAspect) {
    setSelectedAspect(nextAspect);
    if (dimensions) setCrop(centeredCrop(dimensions.width, dimensions.height, nextAspect));
  }

  // ── Move ──────────────────────────────────────────────────────────────────
  function startMove(event) {
    if (!crop || !stageRef.current) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    interaction.current = {
      type: "move",
      startX: event.clientX,
      startY: event.clientY,
      startCrop: { ...crop },
      stageRect: stageRef.current.getBoundingClientRect(),
    };
  }

  // ── Resize ─────────────────────────────────────────────────────────────────
  function startResize(event, handle) {
    if (!crop || !stageRef.current) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    interaction.current = {
      type: "resize",
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startCrop: { ...crop },
      stageRect: stageRef.current.getBoundingClientRect(),
    };
  }

  // ── Pointer move ──────────────────────────────────────────────────────────
  const onPointerMove = useCallback((event) => {
    const ia = interaction.current;
    if (!ia) return;

    const { stageRect } = ia;
    const dx = (event.clientX - ia.startX) / stageRect.width;
    const dy = (event.clientY - ia.startY) / stageRect.height;
    const sc = ia.startCrop;

    if (ia.type === "move") {
      const x = clamp(sc.x + dx, 0, 1 - sc.width);
      const y = clamp(sc.y + dy, 0, 1 - sc.height);
      setCrop({ ...sc, x, y });
      return;
    }

    // resize
    const h = ia.handle;
    let { x, y, width, height } = sc;

    // horizontal
    if (h.includes("e")) {
      width = clamp(sc.width + dx, MIN_CROP_SIZE, 1 - sc.x);
    } else if (h.includes("w")) {
      const newW = clamp(sc.width - dx, MIN_CROP_SIZE, sc.x + sc.width);
      x = sc.x + sc.width - newW;
      width = newW;
    }

    // vertical
    if (h.includes("s")) {
      height = clamp(sc.height + dy, MIN_CROP_SIZE, 1 - sc.y);
    } else if (h.includes("n")) {
      const newH = clamp(sc.height - dy, MIN_CROP_SIZE, sc.y + sc.height);
      y = sc.y + sc.height - newH;
      height = newH;
    }

    // lock aspect if a ratio is selected
    if (selectedAspect && (h.length === 2)) { // corner handles
      // use width as source of truth for aspect ratio
      const naturalW = dimensions?.width || 1;
      const naturalH = dimensions?.height || 1;
      const stageAspect = stageRect.width / stageRect.height;
      const imageAspect = naturalW / naturalH;
      // crop coords are relative to image, so ratio in crop-space needs adjusting for stage distortion
      const aspectInCropSpace = selectedAspect / imageAspect;
      if (h.includes("e") || h.includes("w")) {
        height = clamp(width / aspectInCropSpace, MIN_CROP_SIZE, 1 - y);
        if (h.includes("n")) y = sc.y + sc.height - height;
      } else {
        width = clamp(height * aspectInCropSpace, MIN_CROP_SIZE, 1 - x);
        if (h.includes("w")) x = sc.x + sc.width - width;
      }
    }

    setCrop({ x, y, width, height });
  }, [selectedAspect, dimensions]);

  const onPointerUp = useCallback(() => {
    interaction.current = null;
  }, []);

  async function save() {
    if (!crop) return;
    setSaving(true);
    try {
      await onSave?.({ crop, maxWidth: 1200, maxHeight: 1200, quality: 80 });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && file ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white p-4 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Prepare image</h3>
                <p className="text-sm text-slate-500">
                  Drag to move · Drag corners/edges to resize. Converts to WebP on upload.
                </p>
              </div>
              <button
                type="button" onClick={onCancel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                aria-label="Close image editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Ratio selector */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Ratio:</span>
              {RATIOS.map(([value, label]) => (
                <button
                  key={label} type="button" onClick={() => setRatio(value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    selectedAspect === value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stage */}
            <div
              ref={stageRef}
              className="relative flex max-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 select-none"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {src && (
                <img
                  src={src}
                  alt="To process"
                  draggable={false}
                  onLoad={(event) => {
                    const next = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
                    setDimensions(next);
                    setCrop(centeredCrop(next.width, next.height, selectedAspect));
                  }}
                  style={{ maxHeight: 420, display: "block", pointerEvents: "none", userSelect: "none" }}
                />
              )}

              {/* Crop overlay: darken outside selection */}
              {cropStyle && (
                <>
                  {/* Dark overlay via box-shadow so inside is clear */}
                  <div
                    className="absolute border-2 border-white"
                    style={{
                      ...cropStyle,
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.46)",
                      cursor: "move",
                    }}
                    onPointerDown={startMove}
                  >
                    {/* Rule-of-thirds grid */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)",
                      backgroundSize: "33.33% 33.33%",
                    }} />

                    {/* Resize handles */}
                    {HANDLES.map((handle) => (
                      <div
                        key={handle}
                        className="absolute h-[10px] w-[10px] rounded-sm bg-white shadow-md z-10"
                        style={{ ...HANDLE_STYLE[handle], touchAction: "none" }}
                        onPointerDown={(e) => startResize(e, handle)}
                      />
                    ))}

                    <span className="absolute -bottom-6 left-0 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white pointer-events-none whitespace-nowrap">
                      Drag to move · handles to resize
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                type="button" onClick={onCancel}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button" onClick={save} disabled={saving || !crop}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving…" : <><Check className="h-4 w-4" />Crop &amp; Save</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
