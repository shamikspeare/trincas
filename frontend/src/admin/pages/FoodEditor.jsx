// src/admin/pages/FoodEditor.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import ImageProcessingModal from "../components/ImageProcessingModal";
import ImageUploadSummaryMessage from "../components/ImageUploadSummaryMessage";
import { IMAGE_ACCEPT, getImageProcessingSummary, processImage } from "../utils/processImage";
import PageLayoutEditor from "../components/PageLayoutEditor";
import { getFoodPageKey } from "../../lib/pageLayouts";

const BUCKET = "food";

// Fixed cuisine set — no add/rename/delete from the dashboard.
const FIXED_CUISINES = [
  { name: "Indian", slug: "indian" },
  { name: "Chinese", slug: "chinese" },
  { name: "Continental", slug: "continental" },
  { name: "Drinks", slug: "drinks" },
  { name: "Cafe", slug: "cafe" },
];

function tempId() {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}

// Helper to extract storage path from a public URL
function getStoragePathFromPublicUrl(publicUrl) {
  const url = new URL(publicUrl);
  const marker = `/object/public/${BUCKET}/`;
  const markerIndex = url.pathname.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error("Could not resolve storage path from image URL");
  }

  return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
}

// Uploads to Storage and returns a public URL. Never touches the DB itself,
// and never produces/stores base64 — only a storage object + its public URL.
async function uploadImage(file, folder, options = {}) {
  try {
    const processedFile = await processImage(file, options);
    const summary = getImageProcessingSummary(processedFile);
    const path = `${folder}/${tempId()}.webp`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, processedFile, {
        upsert: true,
        cacheControl: "3600",
        contentType: "image/webp",
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    console.log(`[Image processing] Upload successful: ${data.publicUrl}`);
    return { publicUrl: data.publicUrl, summary };
  } catch (err) {
    console.error(`[Image processing] Error uploading image:`, err);
    throw err;
  }
}

/* ---------- Toast ---------- */
function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`fixed right-6 top-6 z-50 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium shadow-xl backdrop-blur-md max-w-md ${
        isError
          ? "border-rose-200 bg-rose-50/95 text-rose-800"
          : "border-emerald-200 bg-white/95 text-gray-800"
      }`}
    >
      {isError ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
      <div className="flex-1">{toast.message}</div>
    </motion.div>
  );
}

/* ---------- Image slot (preview / replace / remove) ---------- */
// src is always either a Supabase public URL, or a transient blob: object URL
// used purely for instant preview before the real upload completes. Never base64.
function ImageSlot({ src, onReplace, onRemove, busy, ratio = "aspect-[16/10]", label = "Upload image" }) {
  const inputRef = useRef(null);
  return (
    <div className={`group relative ${ratio} w-full overflow-hidden rounded-xl bg-gray-100`}>
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">{label}</span>
        </div>
      )}

      {busy ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow"
          >
            {src ? "Replace" : "Upload"}
          </button>
          {src ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-rose-600 shadow"
            >
              Remove
            </button>
          ) : null}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onReplace(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* =========================================================
   Section 1 — Cuisines (/food landing page)
   One image per fixed cuisine. Always UPDATEs food_cuisines
   by slug (row is guaranteed to exist — see loadCuisines).
   ========================================================= */
function CuisineLandingCard({ cuisine, notify, onSaved }) {
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [processingModal, setProcessingModal] = useState({ open: false, file: null, onSave: null });

  function openProcessingModal(file, onSave) {
    try {
      validateImage(file);
      setProcessingModal({ open: true, file, onSave });
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function handleSave() {
    if (!pendingFile) return;
    setBusy(true);
    try {
      console.log(`[Cuisine Upload] Saving ${cuisine.name} cuisine image`);
      const { publicUrl, summary } = await uploadImage(pendingFile.file, "categories", pendingFile.options);

      const { error } = await supabase
        .from("food_cuisines")
        .update({ image_url: publicUrl })
        .eq("slug", cuisine.slug);

      if (error) throw error;

      setPendingFile(null);
      setPreview(null);
      notify("success", <ImageUploadSummaryMessage title={`${cuisine.name} image saved`} summary={summary} />);
      await onSaved(); // re-fetch from Supabase — it stays the source of truth
    } catch (err) {
      notify("error", err.message || `Failed to save ${cuisine.name}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (pendingFile || preview) {
      setPendingFile(null);
      setPreview(null);
      return;
    }

    if (!cuisine.image_url) return;

    setBusy(true);
    try {
      const storagePath = getStoragePathFromPublicUrl(cuisine.image_url);
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
      if (storageError) throw storageError;

      const { error } = await supabase
        .from("food_cuisines")
        .update({ image_url: null })
        .eq("slug", cuisine.slug);
      if (error) throw error;

      setPendingFile(null);
      setPreview(null);
      notify("success", `${cuisine.name} image removed`);
      await onSaved();
    } catch (err) {
      notify("error", err.message || `Failed to remove ${cuisine.name} image`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black bg-white p-4 shadow-sm">
      <ImageSlot
        src={preview || cuisine.image_url}
        busy={busy}
        label={`${cuisine.name} image`}
        onReplace={(file) =>
          openProcessingModal(file, (options) => {
            setPendingFile({ file, options });
            setPreview(URL.createObjectURL(file));
          })
        }
        onRemove={handleRemove}
      />

      <ImageProcessingModal
        open={processingModal.open}
        file={processingModal.file}
        onCancel={() => setProcessingModal({ open: false, file: null, onSave: null })}
        onSave={(options) => {
          processingModal.onSave?.(options);
          setProcessingModal({ open: false, file: null, onSave: null });
        }}
      />

      <div className="mt-3">
        <p className="text-2xl font-semibold text-gray-900 sm:text-3xl">{cuisine.name}</p>
        <p className="text-sm text-gray-500 sm:text-base">/food-{cuisine.slug}</p>
      </div>

      <button
        onClick={handleSave}
        disabled={busy || !pendingFile}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}


function CuisinePageEditor({ cuisine, notify }) {
  return (
    <PageLayoutEditor
      pageKey={getFoodPageKey(cuisine.slug)}
      title={`${cuisine.name} cuisine page`}
      notify={notify}
    />
  );
}

/* =========================================================
   Main editor
   ========================================================= */
export default function FoodEditor() {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);

  function notify(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  // Ensures all five fixed rows exist in food_cuisines (requirement 10),
  // without ever creating duplicates (requirement 3) or clobbering an
  // existing image_url — upsert only writes the columns given below.
  const loadCuisines = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const results = await Promise.all(
        FIXED_CUISINES.map((fixed, index) =>
          supabase
            .from("food_cuisines")
            .upsert(
              { name: fixed.name, slug: fixed.slug, display_order: index },
              { onConflict: "slug" }
            )
            .select()
            .single()
        )
      );

      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;

      setCuisines(results.map((r) => r.data));
    } catch (err) {
      setLoadError(err.message || "Failed to load cuisines");
      notify("error", "Couldn't load cuisines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCuisines();
  }, [loadCuisines]);

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <AnimatePresence>{toast ? <Toast toast={toast} /> : null}</AnimatePresence>

      <div>
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Food & Beverages</h1>
        <p className="mt-1 text-base text-gray-500 sm:text-lg">
          Manage the /food landing page and each cuisine's page content.
        </p>
      </div>

      {/* Section 1 — Cuisines (/food) */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Cuisines</h2>
        <p className="mt-1 text-sm text-gray-500">
          Update the image shown for each cuisine on the /food landing page.
        </p>

        {loadError ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{loadError}</span>
            <button onClick={loadCuisines} className="inline-flex items-center gap-1 font-medium">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading cuisines…
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cuisines.map((cuisine) => (
              <CuisineLandingCard
                key={cuisine.slug}
                cuisine={cuisine}
                notify={notify}
                onSaved={loadCuisines}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2 — Per-cuisine page editors */}
      {!loading && !loadError ? (
        <section className="mt-10">
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Cuisine Pages</h2>
          <p className="mt-1 text-lg text-gray-500 sm:text-xl">
            Manage the menu cards and Instagram videos for each cuisine page.
          </p>

          <div className="mt-4 space-y-3">
            {cuisines.map((cuisine) => (
              <CuisinePageEditor key={cuisine.slug} cuisine={cuisine} notify={notify} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
