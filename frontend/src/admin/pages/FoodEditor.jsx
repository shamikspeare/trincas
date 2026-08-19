// src/admin/pages/FoodEditor.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import ImageCropperModal from "../components/ImageCropperModal";

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

// Uploads to Storage and returns a public URL. Never touches the DB itself,
// and never produces/stores base64 — only a storage object + its public URL.
async function uploadImage(file, folder) {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${tempId()}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

    return data.publicUrl;
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
      className={`fixed right-6 top-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${
        isError
          ? "border-rose-100 bg-rose-50 text-rose-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      {toast.message}
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
        accept="image/*"
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
  const [cropModal, setCropModal] = useState({ open: false, file: null, onCropped: null });

  function openCropModal(file, onCropped) {
    setCropModal({ open: true, file, onCropped });
  }

  async function handleSave() {
    if (!pendingFile) return;
    setBusy(true);
    try {
      const publicUrl = await uploadImage(pendingFile, "categories");

      const { error } = await supabase
        .from("food_cuisines")
        .update({ image_url: publicUrl })
        .eq("slug", cuisine.slug);

      if (error) throw error;

      setPendingFile(null);
      setPreview(null);
      notify("success", `${cuisine.name} image saved`);
      await onSaved(); // re-fetch from Supabase — it stays the source of truth
    } catch (err) {
      notify("error", err.message || `Failed to save ${cuisine.name}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <ImageSlot
        src={preview || cuisine.image_url}
        busy={busy}
        label={`${cuisine.name} image`}
        onReplace={(file) =>
          openCropModal(file, (croppedFile) => {
            setPendingFile(croppedFile);
            setPreview(URL.createObjectURL(croppedFile));
          })
        }
        onRemove={() => {
          setPendingFile(null);
          setPreview(null);
        }}
      />

      <ImageCropperModal
        open={cropModal.open}
        file={cropModal.file}
        aspect={1}
        onCancel={() => setCropModal({ open: false, file: null, onCropped: null })}
        onSave={(croppedFile) => {
          cropModal.onCropped?.(croppedFile);
          setCropModal({ open: false, file: null, onCropped: null });
        }}
      />

      <div className="mt-3">
        <p className="font-medium text-gray-900">{cuisine.name}</p>
        <p className="text-xs text-gray-500">/food-{cuisine.slug}</p>
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

/* =========================================================
   Section 2 — Per-cuisine page editor
   Menu image (food_pages) + featured dishes (food_dishes).
   Loads its own data on mount; every mutation writes straight
   to Supabase and then re-fetches.
   ========================================================= */
function CuisinePageEditor({ cuisine, notify }) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [menuBusy, setMenuBusy] = useState(false);
  const [savingDishes, setSavingDishes] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [cropModal, setCropModal] = useState({ open: false, file: null, onCropped: null });

  const [page, setPage] = useState(null); // row from food_pages
  const [dishes, setDishes] = useState([]); // rows from food_dishes
  const [draftDishes, setDraftDishes] = useState({}); // unsaved field edits keyed by dish id

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // Ensure a food_pages row exists for this cuisine (requirement 10),
      // without touching menu_image_url if it already exists.
      const { data: pageRow, error: pageError } = await supabase
        .from("food_pages")
        .upsert({ slug: cuisine.slug }, { onConflict: "slug" })
        .select()
        .single();
      if (pageError) throw pageError;

      const { data: dishRows, error: dishError } = await supabase
        .from("food_dishes")
        .select("*")
        .eq("slug", cuisine.slug)
        .order("display_order", { ascending: true });
      if (dishError) throw dishError;

      setPage(pageRow);
      setDishes(dishRows || []);
      setDraftDishes({});
    } catch (err) {
      setLoadError(err.message || `Failed to load ${cuisine.name} page`);
    } finally {
      setLoading(false);
    }
  }, [cuisine.slug, cuisine.name]);

  useEffect(() => {
    load();
  }, [load]);

  function openCropModal(file, onCropped) {
    setCropModal({ open: true, file, onCropped });
  }

  async function handleMenuImageReplace(file) {
    setMenuBusy(true);
    try {
      const publicUrl = await uploadImage(file, "menu");
      const { error } = await supabase
        .from("food_pages")
        .update({ menu_image_url: publicUrl })
        .eq("slug", cuisine.slug);
      if (error) throw error;
      notify("success", "Menu image saved");
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to save menu image");
    } finally {
      setMenuBusy(false);
    }
  }

  async function handleMenuImageRemove() {
    setMenuBusy(true);
    try {
      const { error } = await supabase
        .from("food_pages")
        .update({ menu_image_url: null })
        .eq("slug", cuisine.slug);
      if (error) throw error;
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to remove menu image");
    } finally {
      setMenuBusy(false);
    }
  }

  function patchDraft(id, patch) {
    setDraftDishes((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function fieldValue(dish, field) {
    return draftDishes[dish.id]?.[field] ?? dish[field];
  }

  async function addDish() {
    setSavingDishes(true);
    try {
      const { error } = await supabase.from("food_dishes").insert([
        {
          slug: cuisine.slug,
          name: "",
          image_url: null,
          display_order: dishes.length,
        },
      ]);
      if (error) throw error;
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to add dish");
    } finally {
      setSavingDishes(false);
    }
  }

  async function removeDish(id) {
    setSavingDishes(true);
    try {
      const { error } = await supabase.from("food_dishes").delete().eq("id", id);
      if (error) throw error;
      notify("success", "Dish deleted");
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to delete dish");
    } finally {
      setSavingDishes(false);
    }
  }

  async function saveDish(dish) {
    setSavingDishes(true);
    try {
      const draft = draftDishes[dish.id] || {};
      let image_url = dish.image_url;
      if (draft._file) image_url = await uploadImage(draft._file, `dishes/${cuisine.slug}`);

      const { error } = await supabase
        .from("food_dishes")
        .update({
          name: draft.name ?? dish.name,
          image_url,
          display_order: dish.display_order,
        })
        .eq("id", dish.id);
      if (error) throw error;

      notify("success", "Dish saved");
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to save dish");
    } finally {
      setSavingDishes(false);
    }
  }

  // Requirement 5: as soon as a drag finishes, persist display_order to Supabase.
  async function handleDishDrop(dropIndex) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }

    const reordered = [...dishes];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setDragIndex(null);
    setDishes(reordered); // optimistic UI update

    setReordering(true);
    try {
      const updates = reordered.map((dish, index) =>
        supabase.from("food_dishes").update({ display_order: index }).eq("id", dish.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;
      await load(); // re-sync from Supabase, the source of truth
    } catch (err) {
      notify("error", err.message || "Failed to save new order");
      await load(); // roll back to server state on failure
    } finally {
      setReordering(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{cuisine.name}</h3>
          <p className="text-xs text-gray-500">/food-{cuisine.slug}</p>
        </div>
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : null}
      </div>

      {loadError ? (
        <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{loadError}</span>
          <button onClick={load} className="inline-flex items-center gap-1 font-medium">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-8">
          {/* Menu image — saves immediately on upload/remove without cropping */}
          <section>
            <h4 className="text-sm font-semibold text-gray-900">Menu Image</h4>
            <p className="mt-0.5 text-xs text-gray-500">
              Full menu shown at the top of the {cuisine.name} page.
            </p>
            <div className="mt-3 max-w-md">
              <ImageSlot
                src={page?.menu_image_url}
                busy={menuBusy}
                label="Upload menu image"
                onReplace={handleMenuImageReplace}
                onRemove={handleMenuImageRemove}
              />
            </div>
          </section>

          {/* Featured dishes */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Dishes</h4>
                <p className="mt-0.5 text-xs text-gray-500">
                  Drag to reorder — order saves automatically.
                  {reordering ? " Saving order…" : ""}
                </p>
              </div>
              <button
                onClick={addDish}
                disabled={savingDishes}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Dish
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dishes.map((dish, index) => {
                const draft = draftDishes[dish.id] || {};
                const hasUnsaved = draft.name !== undefined || draft._file !== undefined;

                return (
                  <div
                    key={dish.id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDishDrop(index)}
                    className="rounded-xl border border-gray-100 p-3"
                  >
                    <div className="flex items-center justify-between text-gray-300">
                      <GripVertical className="h-4 w-4 cursor-grab" />
                    </div>
                    <div className="mt-2">
                      <ImageSlot
                        src={draft._preview || dish.image_url}
                        ratio="aspect-square"
                        label="Dish photo"
                        onReplace={(file) =>
                          openCropModal(file, (croppedFile) =>
                            patchDraft(dish.id, {
                              _file: croppedFile,
                              _preview: URL.createObjectURL(croppedFile),
                            })
                          )
                        }
                        onRemove={() => patchDraft(dish.id, { _file: null, _preview: null })}
                      />
                    </div>
                    <input
                      value={fieldValue(dish, "name") ?? ""}
                      onChange={(e) => patchDraft(dish.id, { name: e.target.value })}
                      placeholder="Dish name"
                      className="mt-3 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                    />

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => saveDish(dish)}
                        disabled={savingDishes || !hasUnsaved}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                      >
                        {savingDishes ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => removeDish(dish.id)}
                        disabled={savingDishes}
                        className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <ImageCropperModal
              open={cropModal.open}
              file={cropModal.file}
              aspect={1}
              onCancel={() => setCropModal({ open: false, file: null, onCropped: null })}
              onSave={(croppedFile) => {
                cropModal.onCropped?.(croppedFile);
                setCropModal({ open: false, file: null, onCropped: null });
              }}
            />
          </section>
        </div>
      )}
    </div>
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
        <h1 className="text-2xl font-semibold text-gray-900" style={{fontSize: '3em'}}>Food & Beverages</h1>
        <p className="mt-1 text-gray-500" style={{fontSize: '3em'}}>
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
          <h2 className="text-lg font-semibold text-gray-900">Cuisine Pages</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the menu image and featured dishes for each cuisine page.
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