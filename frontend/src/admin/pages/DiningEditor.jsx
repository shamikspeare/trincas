// src/admin/pages/DiningEditor.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  GripVertical,
  ImagePlus,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const BUCKET = "dining";

// Fixed rooms — rows already exist in `dining`, no add/rename/delete from here.
const ROOMS = [
  { name: "Trincas", slug: "trincas" },
  { name: "The Other Room", slug: "the-other-room" },
  { name: "Ming Room", slug: "ming-room" },
  { name: "Tavern", slug: "tavern" },
];

function tempId() {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}

// Uploads to Storage under public/<room-slug>/ and returns the public URL.
// Never returns nothing, never stores base64.
async function uploadImage(file, roomSlug) {
  const ext = file.name.split(".").pop();
  const path = `public/${roomSlug}/${tempId()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not resolve public URL for uploaded image");
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
              Delete
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
   Section 1 — Dining Thumbnail Images
   Only ever touches: supabase.from("dining")
   ========================================================= */
function DiningThumbnailCard({ room, notify, onSaved }) {
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleUpload(file) {
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const publicUrl = await uploadImage(file, room.slug);

      const { error } = await supabase
        .from("dining")
        .update({ image_url: publicUrl })
        .eq("slug", room.slug);
      if (error) throw error;

      setPendingFile(null);
      setPreview(null);
      notify("success", `${room.name} thumbnail saved`);
      await onSaved();
    } catch (err) {
      notify("error", err.message || `Failed to save ${room.name} thumbnail`);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("dining")
        .update({ image_url: null })
        .eq("slug", room.slug);
      if (error) throw error;
      notify("success", `${room.name} thumbnail removed`);
      await onSaved();
    } catch (err) {
      notify("error", err.message || "Failed to remove thumbnail");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <ImageSlot
        src={preview || room.image_url}
        busy={busy}
        label={`${room.name} image`}
        onReplace={handleUpload}
        onRemove={handleDelete}
      />

      <div className="mt-3">
        <p className="font-medium text-gray-900">{room.name}</p>
        <p className="text-xs text-gray-500">/{room.slug}</p>
      </div>
    </div>
  );
}

/* =========================================================
   Carousel card — one row in dining_cards.
   Only room_slug / image_url / display_order / created_at.
   ========================================================= */
function CarouselCard({ card, index, roomSlug, onDragStart, onDrop, notify, onChanged }) {
  const [busy, setBusy] = useState(false);

  async function handleUpload(file) {
    setBusy(true);
    try {
      const publicUrl = await uploadImage(file, roomSlug);
      const { error } = await supabase
        .from("dining_cards")
        .update({ image_url: publicUrl })
        .eq("id", card.id);
      if (error) throw error;
      notify("success", "Image saved");
      await onChanged();
    } catch (err) {
      notify("error", err.message || "Failed to save image");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const { error } = await supabase.from("dining_cards").delete().eq("id", card.id);
      if (error) throw error;
      notify("success", "Image deleted");
      await onChanged();
    } catch (err) {
      notify("error", err.message || "Failed to delete image");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      className="rounded-xl border border-gray-100 p-3"
    >
      <div className="flex items-center text-gray-300">
        <GripVertical className="h-4 w-4 cursor-grab" />
      </div>
      <div className="mt-2">
        <ImageSlot
          src={card.image_url}
          ratio="aspect-square"
          busy={busy}
          label="Carousel image"
          onReplace={handleUpload}
          onRemove={handleDelete}
        />
      </div>
    </div>
  );
}

/* =========================================================
   Section 2 — Per-room collapsible editor
   Carousel (dining_cards) + Description (dining_pages_texts)
   ========================================================= */
function RoomEditorSection({ room, notify }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [cards, setCards] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [addingCard, setAddingCard] = useState(false);

  const [description, setDescription] = useState("");
  const [savedDescription, setSavedDescription] = useState("");
  const [descBusy, setDescBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data: cardRows, error: cardError } = await supabase
        .from("dining_cards")
        .select("*")
        .eq("room_slug", room.slug)
        .order("display_order", { ascending: true });
      if (cardError) throw cardError;

      const { data: textRow, error: textError } = await supabase
        .from("dining_pages_texts")
        .select("*")
        .eq("room_slug", room.slug)
        .maybeSingle();
      if (textError) throw textError;

      setCards(cardRows || []);
      setDescription(textRow?.description || "");
      setSavedDescription(textRow?.description || "");
      setLoaded(true);
    } catch (err) {
      setLoadError(err.message || `Failed to load ${room.name}`);
    } finally {
      setLoading(false);
    }
  }, [room.slug, room.name]);

  function toggleOpen() {
    setOpen((o) => !o);
    if (!loaded) load();
  }

  async function addCard() {
    setAddingCard(true);
    try {
      const { error } = await supabase.from("dining_cards").insert([
        {
          room_slug: room.slug,
          image_url: null,
          display_order: cards.length,
        },
      ]);
      if (error) throw error;
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to add card");
    } finally {
      setAddingCard(false);
    }
  }

  async function handleCardDrop(dropIndex) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }

    const reordered = [...cards];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setDragIndex(null);
    setCards(reordered); // optimistic

    setReordering(true);
    try {
      const updates = reordered.map((card, i) =>
        supabase.from("dining_cards").update({ display_order: i }).eq("id", card.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to save new order");
      await load();
    } finally {
      setReordering(false);
    }
  }

  async function saveDescription() {
    setDescBusy(true);
    try {
      const { data: existing, error: findError } = await supabase
        .from("dining_pages_texts")
        .select("id")
        .eq("room_slug", room.slug)
        .maybeSingle();
      if (findError) throw findError;

      if (existing) {
        const { error } = await supabase
          .from("dining_pages_texts")
          .update({ description, updated_at: new Date().toISOString() })
          .eq("room_slug", room.slug);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dining_pages_texts").insert([
          {
            room_slug: room.slug,
            description,
            updated_at: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
      }

      setSavedDescription(description);
      notify("success", `${room.name} description saved`);
    } catch (err) {
      notify("error", err.message || "Failed to save description");
    } finally {
      setDescBusy(false);
    }
  }

  const hasUnsavedDescription = description !== savedDescription;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button onClick={toggleOpen} className="flex w-full items-center justify-between px-6 py-4">
        <div className="text-left">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">{room.name}</h3>
          <p className="text-xs text-gray-500">/{room.slug}</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-6 py-6">
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
                  {/* Carousel */}
                  <section>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                          Carousel Images
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Drag to reorder — order saves automatically.
                          {reordering ? " Saving order…" : ""}
                        </p>
                      </div>
                      <button
                        onClick={addCard}
                        disabled={addingCard}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {addingCard ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        Add Image
                      </button>
                    </div>

                    {cards.length === 0 ? (
                      <p className="mt-4 text-sm text-gray-400">No carousel images yet.</p>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {cards.map((card, index) => (
                          <CarouselCard
                            key={card.id}
                            card={card}
                            index={index}
                            roomSlug={room.slug}
                            onDragStart={setDragIndex}
                            onDrop={handleCardDrop}
                            notify={notify}
                            onChanged={load}
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Description */}
                  <section className="border-t border-gray-100 pt-6">
                    <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                      Description
                    </h4>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder={`Write the ${room.name} description…`}
                      className="mt-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                    <button
                      onClick={saveDescription}
                      disabled={descBusy || !hasUnsavedDescription}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {descBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {descBusy ? "Saving…" : "Save Description"}
                    </button>
                  </section>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   Main editor
   ========================================================= */
export default function DiningEditor() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);

  function notify(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  const loadRooms = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from("dining")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;

      const merged = ROOMS.map((fixed) => {
        const existing = (data || []).find((row) => row.slug === fixed.slug);
        return existing || { ...fixed, id: null, image_url: null, display_order: null };
      });

      setRooms(merged);
    } catch (err) {
      setLoadError(err.message || "Failed to load dining rooms");
      notify("error", "Couldn't load dining rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <AnimatePresence>{toast ? <Toast toast={toast} /> : null}</AnimatePresence>

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-semibold text-gray-900">Dining</h1>
        <p className="mt-1 text-gray-500">
          Manage the dining landing thumbnails and each room's page content.
        </p>
      </div>

      {/* Section 1 — Dining Thumbnail Images */}
      <section className="mt-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">
          Dining Thumbnail Images
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Update the image shown for each room on the /dining landing page.
        </p>

        {loadError ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{loadError}</span>
            <button onClick={loadRooms} className="inline-flex items-center gap-1 font-medium">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading rooms…
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => (
              <DiningThumbnailCard key={room.slug} room={room} notify={notify} onSaved={loadRooms} />
            ))}
          </div>
        )}
      </section>

      {/* Section 2 — Dining Rooms */}
      {!loading && !loadError ? (
        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">Dining Rooms</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the carousel images and description for each room.
          </p>

          <div className="mt-4 space-y-3">
            {rooms.map((room) => (
              <RoomEditorSection key={room.slug} room={room} notify={notify} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}