import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, X } from "lucide-react";
import { getCroppedImg } from "../utils/cropImage";

function buildCenteredCrop(mediaWidth, mediaHeight, aspectRatio) {
  if (aspectRatio) {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspectRatio, mediaWidth, mediaHeight),
      mediaWidth,
      mediaHeight
    );
  }

  return centerCrop({ unit: "%", width: 90, height: 90 }, mediaWidth, mediaHeight);
}

export default function ImageCropperModal({
  open,
  file,
  aspect = null, // null means freeform
  onCancel,
  onSave,
}) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [saving, setSaving] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(aspect);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!open || !file) return;

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setCrop(undefined);
    setCompletedCrop(null);
    setAspectRatio(aspect);

    return () => URL.revokeObjectURL(objectUrl);
  }, [open, file, aspect]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  const onImageLoad = (event) => {
    const { width, height } = event.currentTarget;
    setCrop(buildCenteredCrop(width, height, aspectRatio));
  };

  const handleAspectChange = (newAspect) => {
    setAspectRatio(newAspect);

    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(buildCenteredCrop(width, height, newAspect));
    }
  };

  const handleSave = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) return;

    setSaving(true);

    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop, 1200);
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
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white p-4 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Crop image</h3>
                <p className="text-sm text-slate-500">
                  {aspectRatio === null
                    ? "Drag the corners to crop freely (any aspect ratio)."
                    : "Drag the corners to adjust, or pick a different ratio."}
                </p>
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

            {/* Aspect ratio presets */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Ratio:</span>
              <button
                type="button"
                onClick={() => handleAspectChange(null)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === null
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Freeform
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(1)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === 1
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                1:1 Square
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(4 / 3)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === 4 / 3
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                4:3 Landscape
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(16 / 9)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === 16 / 9
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                16:9 Wide
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(3 / 4)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === 3 / 4
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                3:4 Portrait
              </button>
              <button
                type="button"
                onClick={() => handleAspectChange(2 / 3)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  aspectRatio === 2 / 3
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                2:3 Portrait
              </button>
            </div>

            <div className="relative flex max-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                aspect={aspectRatio || undefined}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="To crop"
                  onLoad={onImageLoad}
                  style={{ maxHeight: 420, display: "block" }}
                />
              </ReactCrop>
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
                disabled={saving || !completedCrop?.width || !completedCrop?.height}
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