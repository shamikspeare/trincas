// src/admin/pages/DiningEditor.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
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
  Pencil,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { compressImage } from "../utils/imageCompressor";
import {
  fetchPageSections,
  updateSection,
  deleteSection,
  reorderSections,
} from "../utils/diningSections";
import ImageCropperModal from "../components/ImageCropperModal";

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
async function uploadImage(file, roomSlug) {
  const compressedFile = await compressImage(file);
  const ext = compressedFile.name?.includes(".")
    ? compressedFile.name.split(".").pop()
    : compressedFile.type.split("/").pop();
  const path = `public/${roomSlug}/${tempId()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressedFile, { upsert: true, cacheControl: "3600" });
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
   Text Section Editor (inline, appears at top when creating)
   ========================================================= */
function TextSectionEditor({ section, onSave, onCancel, busy }) {
  const [heading, setHeading] = useState(section.heading || "");
  const [body, setBody] = useState(section.body || "");
  const textareaRef = useRef(null);

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Update local state if the section prop changes (e.g., editing a different section)
    setHeading(section.heading || "");
    setBody(section.body || "");
  }, [section]);

  const dirty = heading !== (section.heading || "") || body !== (section.body || "");

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {String(section.id).startsWith("tmp_") ? "New Text Section" : "Edit Text Section"}
        </span>
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700"
          disabled={busy}
        >
          Cancel
        </button>
      </div>

      <input
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        placeholder="Heading (optional)"
        className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium focus:border-indigo-400 focus:outline-none"
      />
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        placeholder="Body text…"
        className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
      />

      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={() => onSave({ heading, body })}
          disabled={busy || !dirty}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Preview Cards (compact, left-aligned, with border)
   ========================================================= */
function TextPreviewCard({ section, onEdit, onDelete, busy }) {
  return (
    <div className="group relative rounded-lg border border-gray-200 bg-gray-200 p-3 max-w-2xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {section.heading && (
            <h4 className="text-sm font-semibold text-gray-900 truncate">{section.heading}</h4>
          )}
          <p className="text-sm text-gray-700 line-clamp-4 overflow-hidden">
            {section.body || ""}
          </p>
        </div>
        <div className="ml-3 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="mb-1 p-1 text-gray-500 hover:text-indigo-600"
            title="Edit"
            disabled={busy}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-rose-600"
            title="Delete"
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewCard({ section, onReplace, onDelete, busy }) {
  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-3 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
          {section.image_url ? (
            <img
              src={section.image_url}
              alt={section.alt_text || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {section.alt_text && (
            <p className="text-sm text-gray-700 truncate">{section.alt_text}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Image</p>
        </div>
        <div className="ml-3 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onReplace}
            className="mb-1 p-1 text-gray-500 hover:text-indigo-600"
            title="Replace image"
            disabled={busy}
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-rose-600"
            title="Delete section"
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Section Reorder Item (with drag controls)
   ========================================================= */
function SectionReorderItem({
  section,
  isEditing,
  onStartDrag,
  onEdit,
  onDelete,
  onReplace,
  onSaveText,
  onCancelEdit,
  busyText,
  busyImage,
}) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onStartDrag}
      className="list-none"
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <div className="flex items-start gap-2">
        <GripVertical
          className="h-5 w-5 mt-1 cursor-grab touch-none active:cursor-grabbing text-gray-300"
          onPointerDown={(e) => dragControls.start(e)}
        />
        <div className="flex-1">
          {section.section_type === "text" ? (
            isEditing ? (
              <TextSectionEditor
                section={section}
                onSave={(content) => onSaveText(section, content)}
                onCancel={onCancelEdit}
                busy={busyText}
              />
            ) : (
              <TextPreviewCard
                section={section}
                onEdit={onEdit}
                onDelete={onDelete}
                busy={busyText}
              />
            )
          ) : (
            <ImagePreviewCard
              section={section}
              onReplace={onReplace}
              onDelete={onDelete}
              busy={busyImage}
            />
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

/* =========================================================
   Section 2 — Per-room collapsible editor
   ========================================================= */
function RoomEditorSection({ room, notify }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [sections, setSections] = useState([]);
  const [reordering, setReordering] = useState(false);
  const [draftText, setDraftText] = useState(null); // temp section for new text
  const [editingTextId, setEditingTextId] = useState(null); // existing section id being edited
  const [textBusy, setTextBusy] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [imageEditTarget, setImageEditTarget] = useState(null); // section id or null for new
  const [imageBusy, setImageBusy] = useState(false);
  const hiddenFileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchPageSections(room.slug);
      setSections(rows);
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

  // ---- Text Section Handlers ----

  const handleAddText = () => {
    setDraftText({
      id: `tmp_${Date.now()}`,
      section_type: "text",
      heading: "",
      body: "",
    });
    setEditingTextId(null);
  };

  const handleEditText = (section) => {
    setEditingTextId(section.id);
    setDraftText(null);
  };

  const handleTextCancel = () => {
    setDraftText(null);
    setEditingTextId(null);
  };

  const handleTextSave = async (section, { heading, body }) => {
    setTextBusy(true);
    try {
      if (String(section.id).startsWith("tmp_")) {
        const { data: existing, error: fetchError } = await supabase
          .from("dining_page_sections")
          .select("id")
          .eq("page_slug", room.slug)
          .order("display_order", { ascending: true });
        if (fetchError) throw fetchError;

        const updates = (existing || []).map((row, idx) =>
          supabase
            .from("dining_page_sections")
            .update({ display_order: idx + 1 })
            .eq("id", row.id)
        );
        const insert = supabase.from("dining_page_sections").insert([
          {
            page_slug: room.slug,
            section_type: "text",
            display_order: 0,
            heading,
            body,
            image_url: null,
            alt_text: null,
          },
        ]);
        const results = await Promise.all([insert, ...updates]);
        const failed = results.find((r) => r.error);
        if (failed) throw failed.error;
      } else {
        await updateSection(section.id, { heading, body });
      }
      notify("success", "Text section saved");
      await load();
      setDraftText(null);
      setEditingTextId(null);
    } catch (err) {
      notify("error", err.message || "Failed to save text section");
    } finally {
      setTextBusy(false);
    }
  };

  const handleDeleteText = async (sectionId) => {
    setTextBusy(true);
    try {
      await deleteSection(sectionId);
      notify("success", "Text section deleted");
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to delete text section");
    } finally {
      setTextBusy(false);
    }
  };

  // ---- Image Section Handlers ----

  const handleAddImageClick = () => {
    setImageEditTarget(null);
    hiddenFileInputRef.current?.click();
  };

  const handleReplaceImageClick = (sectionId) => {
    setImageEditTarget(sectionId);
    hiddenFileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file);
      setImageModalOpen(true);
    }
    e.target.value = "";
  };

  const handleCroppedImage = async (croppedFile) => {
    setImageBusy(true);
    try {
      const publicUrl = await uploadImage(croppedFile, room.slug);
      if (imageEditTarget) {
        await updateSection(imageEditTarget, { image_url: publicUrl });
        notify("success", "Image updated");
      } else {
        const { data: existing, error: fetchError } = await supabase
          .from("dining_page_sections")
          .select("id")
          .eq("page_slug", room.slug)
          .order("display_order", { ascending: true });
        if (fetchError) throw fetchError;

        const newOrder = (existing?.length || 0);
        const { error: insertError } = await supabase.from("dining_page_sections").insert([
          {
            page_slug: room.slug,
            section_type: "image",
            display_order: newOrder,
            image_url: publicUrl,
            alt_text: "",
          },
        ]);
        if (insertError) throw insertError;
        notify("success", "Image section added");
      }
      await load();
      setImageModalOpen(false);
      setCropFile(null);
    } catch (err) {
      notify("error", err.message || "Failed to save image");
    } finally {
      setImageBusy(false);
    }
  };

  const handleDeleteImage = async (sectionId) => {
    setImageBusy(true);
    try {
      await deleteSection(sectionId);
      notify("success", "Image section deleted");
      await load();
    } catch (err) {
      notify("error", err.message || "Failed to delete image section");
    } finally {
      setImageBusy(false);
    }
  };

  // ---- Reorder ----

  function handleReorderChange(newOrder) {
    setSections(newOrder);
  }

  async function handleDragEnd() {
    setReordering(true);
    try {
      await reorderSections(room.slug, sections.map((s) => s.id));
    } catch (err) {
      notify("error", err.message || "Failed to save new order");
      await load();
    } finally {
      setReordering(false);
    }
  }

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
                <section>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                        Page Sections
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Drag to reorder — order saves automatically.
                        {reordering ? " Saving order…" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddText}
                        disabled={textBusy || imageBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Text
                      </button>
                      <button
                        onClick={handleAddImageClick}
                        disabled={textBusy || imageBusy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        Add Image
                      </button>
                    </div>
                  </div>

                  {/* Hidden file input for image selection */}
                  <input
                    ref={hiddenFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Image cropper modal */}
                  <ImageCropperModal
                    open={imageModalOpen}
                    file={cropFile}
                    onCancel={() => {
                      setImageModalOpen(false);
                      setCropFile(null);
                    }}
                    onSave={handleCroppedImage}
                  />

                  {/* Content area */}
                  {draftText && (
                    <div className="mt-4">
                      <TextSectionEditor
                        section={draftText}
                        onSave={(content) => handleTextSave(draftText, content)}
                        onCancel={handleTextCancel}
                        busy={textBusy}
                      />
                    </div>
                  )}

                  {sections.length === 0 && !draftText ? (
                    <p className="mt-4 text-sm text-gray-400">No sections yet.</p>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={sections}
                      onReorder={handleReorderChange}
                      className="mt-4 space-y-3"
                    >
                      {sections.map((section) => (
                        <SectionReorderItem
                          key={section.id}
                          section={section}
                          isEditing={editingTextId === section.id}
                          onStartDrag={handleDragEnd}
                          onEdit={() => handleEditText(section)}
                          onDelete={() =>
                            section.section_type === "text"
                              ? handleDeleteText(section.id)
                              : handleDeleteImage(section.id)
                          }
                          onReplace={() => handleReplaceImageClick(section.id)}
                          onSaveText={handleTextSave}
                          onCancelEdit={handleTextCancel}
                          busyText={textBusy}
                          busyImage={imageBusy}
                        />
                      ))}
                    </Reorder.Group>
                  )}
                </section>
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
            Manage the page sections for each room.
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