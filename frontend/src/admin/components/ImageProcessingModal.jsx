import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

function centeredCrop(width, height, aspect) {
  const padding = 0.9;
  if (!aspect) return { x: (1 - padding) / 2, y: (1 - padding) / 2, width: padding, height: padding };
  const imageAspect = width / height;
  const cropAspect = aspect;
  const cropWidth = imageAspect > cropAspect ? padding * cropAspect / imageAspect : padding;
  const cropHeight = imageAspect > cropAspect ? padding : padding * imageAspect / cropAspect;
  return { x: (1 - cropWidth) / 2, y: (1 - cropHeight) / 2, width: cropWidth, height: cropHeight };
}

const RATIOS = [
  [null, "Freeform"], [1, "1:1 Square"], [4 / 3, "4:3 Landscape"], [16 / 9, "16:9 Wide"], [3 / 4, "3:4 Portrait"], [2 / 3, "2:3 Portrait"],
];

export default function ImageProcessingModal({ open, file, aspect = null, onCancel, onSave }) {
  const [src, setSrc] = useState("");
  const [dimensions, setDimensions] = useState(null);
  const [crop, setCrop] = useState(null);
  const [selectedAspect, setSelectedAspect] = useState(aspect);
  const [saving, setSaving] = useState(false);
  const drag = useRef(null);

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

  const cropStyle = useMemo(() => crop && ({ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.width * 100}%`, height: `${crop.height * 100}%` }), [crop]);

  function setRatio(nextAspect) {
    setSelectedAspect(nextAspect);
    if (dimensions) setCrop(centeredCrop(dimensions.width, dimensions.height, nextAspect));
  }

  function startDrag(event) {
    if (!crop) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, crop };
  }

  function moveCrop(event) {
    if (!drag.current) return;
    const stage = event.currentTarget.getBoundingClientRect();
    const next = drag.current.crop;
    const x = Math.min(Math.max(next.x + (event.clientX - drag.current.x) / stage.width, 0), 1 - next.width);
    const y = Math.min(Math.max(next.y + (event.clientY - drag.current.y) / stage.height, 0), 1 - next.height);
    setCrop({ ...next, x, y });
  }

  async function save() {
    if (!crop) return;
    setSaving(true);
    try {
      await onSave?.({ crop, maxWidth: 1200, maxHeight: 1200, quality: 80 });
    } finally {
      setSaving(false);
    }
  }

  return <AnimatePresence>{open && file ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-semibold text-slate-900">Prepare image</h3><p className="text-sm text-slate-500">Move the selection to choose the crop. The image is converted to WebP on upload.</p></div><button type="button" onClick={onCancel} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100" aria-label="Close image editor"><X className="h-4 w-4" /></button></div>
        <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-slate-500">Ratio:</span>{RATIOS.map(([value, label]) => <button key={label} type="button" onClick={() => setRatio(value)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selectedAspect === value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{label}</button>)}</div>
        <div className="relative flex max-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900" onPointerMove={moveCrop} onPointerUp={() => { drag.current = null; }}>
          {src && <img src={src} alt="To process" onLoad={(event) => { const next = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight }; setDimensions(next); setCrop(centeredCrop(next.width, next.height, selectedAspect)); }} style={{ maxHeight: 420, display: "block" }} />}
          {cropStyle && <div className="absolute cursor-move border-2 border-white bg-black/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]" style={cropStyle} onPointerDown={startDrag}><span className="absolute -bottom-6 left-0 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">Drag to reposition</span></div>}
        </div>
        <div className="mt-5 flex items-center justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button><button type="button" onClick={save} disabled={saving || !crop} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : <><Check className="h-4 w-4" />Crop & Save</>}</button></div>
      </motion.div>
    </motion.div>
  ) : null}</AnimatePresence>;
}
