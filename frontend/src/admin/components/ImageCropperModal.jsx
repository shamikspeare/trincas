import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { Check, X, ZoomIn } from "lucide-react";
import { getCroppedImg } from "../utils/cropImage";

export default function ImageCropperModal({ open, file, aspect = 1, onCancel, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    return () => URL.revokeObjectURL(objectUrl);
  }, [open, file]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setSaving(true);

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, 1200);
      const baseName = (file?.name || "cropped-image").replace(/\.[^/.]+$/, "");
      const croppedFile = new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      onSave?.(croppedFile);
    } catch (error) {
      console.error("Failed to crop image:", error);
      onCancel?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && file ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Crop image</h3>
                <p className="text-sm text-slate-500">Adjust position and zoom before saving.</p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                aria-label="Close crop modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-slate-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixelsValue) => setCroppedAreaPixels(croppedAreaPixelsValue)}
                cropShape="rect"
                showGrid
                objectFit="contain"
              />
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <ZoomIn className="h-4 w-4 text-slate-600" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="h-2 w-full accent-indigo-600"
                aria-label="Zoom image"
              />
              <span className="w-10 text-right text-xs font-medium text-slate-600">{zoom.toFixed(1)}x</span>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !croppedAreaPixels}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Crop & Save
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
