import { useCallback, useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  GripVertical,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sanitizeHtml } from "../../lib/sanitize";
import {
  createBookSection,
  deleteBookSection,
  fetchBookSections,
  reorderBookSections,
  updateBookSection,
} from "../../lib/bookSections";
import ImageUploadSummaryMessage from "./ImageUploadSummaryMessage";
import ImageProcessingModal from "./ImageProcessingModal";
import RichTextEditor from "./RichTextEditor";
import {
  getImageProcessingSummary,
  IMAGE_ACCEPT,
  processImage,
  validateImage,
} from "../utils/processImage";

const BUCKET = "page-content";

function temporaryId() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createObjectPath() {
  const id = globalThis.crypto?.randomUUID?.() ?? temporaryId();
  return `book/${id}.webp`;
}

async function uploadBookImage(file, options = {}) {
  const processedFile = await processImage(file, options);
  const path = createObjectPath();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, processedFile, {
      upsert: false,
      cacheControl: "3600",
      contentType: "image/webp",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not resolve the uploaded image URL");

  return { publicUrl: data.publicUrl, summary: getImageProcessingSummary(processedFile) };
}

function getBookObjectPath(url) {
  if (typeof url !== "string") return null;

  const publicPathPrefix = `/storage/v1/object/public/${BUCKET}/`;
  const start = url.indexOf(publicPathPrefix);
  if (start < 0) return null;

  let path;
  try {
    path = decodeURIComponent(url.slice(start + publicPathPrefix.length).split("?")[0]);
  } catch {
    return null;
  }
  return path.startsWith("book/") ? path : null;
}

async function removeBookImage(url) {
  const path = getBookObjectPath(url);
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

function hasContent(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length > 0;
}

function nextDisplayOrder(sections) {
  return Math.max(-1, ...sections.map((section) => Number(section.display_order) || 0)) + 1;
}

function TextSectionEditor({ section, busy, onCancel, onSave }) {
  const [heading, setHeading] = useState(section.heading || "");
  const [body, setBody] = useState(section.body || "");

  useEffect(() => {
    setHeading(section.heading || "");
    setBody(section.body || "");
  }, [section]);

  const isNew = String(section.id).startsWith("new-");
  const dirty = heading !== (section.heading || "") || body !== (section.body || "");
  const canSave = dirty && (heading.trim() || hasContent(body));

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {isNew ? "New text section" : "Edit text section"}
        </span>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-xs text-gray-500 transition hover:text-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <input
        value={heading}
        onChange={(event) => setHeading(event.target.value)}
        placeholder="Heading (optional)"
        className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-indigo-400"
      />
      <RichTextEditor value={body} onChange={setBody} placeholder="Body text…" />

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onSave({ heading, body })}
          disabled={busy || !canSave}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save text
        </button>
      </div>
    </div>
  );
}

function TextPreviewCard({ section, busy, onDelete, onEdit }) {
  return (
    <div className="group relative max-w-2xl rounded-lg border border-gray-200 bg-gray-100 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {section.heading ? <h4 className="truncate text-sm font-semibold text-gray-900">{section.heading}</h4> : null}
          {section.body ? (
            <div
              className="prose prose-sm mt-1 max-w-none line-clamp-4 overflow-hidden text-sm text-gray-700 [&_a]:text-indigo-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.body) }}
            />
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            disabled={busy}
            className="mb-1 p-1 text-gray-500 transition hover:text-indigo-600 disabled:opacity-50"
            title="Edit text section"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="p-1 text-gray-500 transition hover:text-rose-600 disabled:opacity-50"
            title="Delete text section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImagePreviewCard({ section, busy, onDelete, onReplace, onSaveDescription }) {
  const [description, setDescription] = useState(section.alt_text || "");
  const [savingDescription, setSavingDescription] = useState(false);

  useEffect(() => {
    setDescription(section.alt_text || "");
  }, [section.alt_text]);

  async function saveDescription() {
    if (description === (section.alt_text || "")) return;
    setSavingDescription(true);
    try {
      await onSaveDescription(description);
    } finally {
      setSavingDescription(false);
    }
  }

  return (
    <div className="group relative max-w-2xl rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start gap-3">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
          {section.image_url ? (
            <img src={section.image_url} alt={section.alt_text || ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <ImagePlus className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Image section</p>
          <label className="mt-2 block text-xs text-gray-500" htmlFor={`book-image-description-${section.id}`}>
            Image description (optional)
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id={`book-image-description-${section.id}`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={saveDescription}
              disabled={busy || savingDescription}
              placeholder="Describe this image"
              className="min-w-0 flex-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-800 outline-none transition focus:border-indigo-400 disabled:bg-gray-50"
            />
            {savingDescription ? <Loader2 className="mt-1 h-4 w-4 animate-spin text-gray-400" /> : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={onReplace}
            disabled={busy}
            className="mb-1 p-1 text-gray-500 transition hover:text-indigo-600 disabled:opacity-50"
            title="Replace image"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="p-1 text-gray-500 transition hover:text-rose-600 disabled:opacity-50"
            title="Delete image section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionReorderItem({
  section,
  isEditing,
  textBusy,
  imageBusy,
  onCancelEdit,
  onDelete,
  onEdit,
  onReplace,
  onSaveDescription,
  onSaveText,
  onDragEnd,
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      className="list-none"
      whileDrag={{ scale: 1.015, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          className="mt-1 touch-none cursor-grab rounded text-gray-300 transition hover:text-gray-500 active:cursor-grabbing"
          aria-label="Drag to reorder section"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          {section.section_type === "text" ? (
            isEditing ? (
              <TextSectionEditor
                section={section}
                busy={textBusy}
                onCancel={onCancelEdit}
                onSave={(content) => onSaveText(section, content)}
              />
            ) : (
              <TextPreviewCard
                section={section}
                busy={textBusy}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            )
          ) : (
            <ImagePreviewCard
              section={section}
              busy={imageBusy}
              onDelete={onDelete}
              onReplace={onReplace}
              onSaveDescription={onSaveDescription}
            />
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function BookSectionsEditor({ notify }) {
  const [sections, setSections] = useState([]);
  const sectionsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [draftText, setDraftText] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textBusy, setTextBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [imageTargetId, setImageTargetId] = useState(null);
  const fileInputRef = useRef(null);

  const replaceSections = useCallback((nextSections) => {
    sectionsRef.current = nextSections;
    setSections(nextSections);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      replaceSections(await fetchBookSections());
    } catch (error) {
      setLoadError(error.message || "Failed to load Books page sections");
    } finally {
      setLoading(false);
    }
  }, [replaceSections]);

  useEffect(() => {
    load();
  }, [load]);

  function addText() {
    setDraftText({
      id: temporaryId(),
      section_type: "text",
      heading: "",
      body: "",
    });
    setEditingTextId(null);
  }

  function cancelTextEdit() {
    setDraftText(null);
    setEditingTextId(null);
  }

  async function saveText(section, { heading, body }) {
    setTextBusy(true);
    try {
      const cleanBody = sanitizeHtml(body);
      if (String(section.id).startsWith("new-")) {
        await createBookSection({
          section_type: "text",
          display_order: nextDisplayOrder(sectionsRef.current),
          heading: heading.trim() || null,
          body: cleanBody,
          image_url: null,
          alt_text: null,
        });
      } else {
        await updateBookSection(section.id, {
          heading: heading.trim() || null,
          body: cleanBody,
        });
      }

      await load();
      setDraftText(null);
      setEditingTextId(null);
      notify("success", "Text section saved");
    } catch (error) {
      notify("error", error.message || "Failed to save text section");
    } finally {
      setTextBusy(false);
    }
  }

  async function deleteText(sectionId) {
    setTextBusy(true);
    try {
      await deleteBookSection(sectionId);
      await load();
      notify("success", "Text section deleted");
    } catch (error) {
      notify("error", error.message || "Failed to delete text section");
    } finally {
      setTextBusy(false);
    }
  }

  function selectImage(targetId = null) {
    setImageTargetId(targetId);
    fileInputRef.current?.click();
  }

  function onFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      validateImage(file);
      setCropFile(file);
    } catch (error) {
      notify("error", error.message);
    }
  }

  function closeImageProcessor() {
    setCropFile(null);
    setImageTargetId(null);
  }

  async function saveProcessedImage(options) {
    if (!cropFile) return;

    setImageBusy(true);
    let newImageUrl = null;
    let databaseSaved = false;
    try {
      const { publicUrl, summary } = await uploadBookImage(cropFile, options);
      newImageUrl = publicUrl;
      let savedMessage;

      if (imageTargetId) {
        const existing = sectionsRef.current.find((section) => section.id === imageTargetId);
        await updateBookSection(imageTargetId, { image_url: publicUrl });
        databaseSaved = true;
        savedMessage = <ImageUploadSummaryMessage title="Image replaced" summary={summary} />;

        if (existing?.image_url) {
          try {
            await removeBookImage(existing.image_url);
          } catch {
            savedMessage = "Image replaced. The old file could not be removed from storage.";
          }
        }
      } else {
        await createBookSection({
          section_type: "image",
          display_order: nextDisplayOrder(sectionsRef.current),
          heading: null,
          body: null,
          image_url: publicUrl,
          alt_text: null,
        });
        databaseSaved = true;
        savedMessage = <ImageUploadSummaryMessage title="Image section added" summary={summary} />;
      }

      await load();
      closeImageProcessor();
      notify("success", savedMessage);
    } catch (error) {
      if (newImageUrl && !databaseSaved) {
        try {
          await removeBookImage(newImageUrl);
        } catch {
          // Keep the primary failure message focused on the database operation.
        }
      }
      notify("error", error.message || "Failed to save image");
    } finally {
      setImageBusy(false);
    }
  }

  async function deleteImage(sectionId) {
    const section = sectionsRef.current.find((item) => item.id === sectionId);
    setImageBusy(true);
    try {
      await deleteBookSection(sectionId);
      await load();

      if (section?.image_url) {
        try {
          await removeBookImage(section.image_url);
        } catch {
          notify("success", "Image section deleted. The old image file could not be removed from storage.");
          return;
        }
      }
      notify("success", "Image section deleted");
    } catch (error) {
      notify("error", error.message || "Failed to delete image section");
    } finally {
      setImageBusy(false);
    }
  }

  async function saveImageDescription(sectionId, description) {
    setImageBusy(true);
    try {
      await updateBookSection(sectionId, { alt_text: description.trim() || null });
      await load();
      notify("success", "Image description saved");
    } catch (error) {
      notify("error", error.message || "Failed to save image description");
    } finally {
      setImageBusy(false);
    }
  }

  function handleReorder(nextSections) {
    sectionsRef.current = nextSections;
    setSections(nextSections);
  }

  async function persistOrder() {
    setReordering(true);
    try {
      await reorderBookSections(sectionsRef.current.map((section) => section.id));
    } catch (error) {
      notify("error", error.message || "Failed to save the new section order");
      await load();
    } finally {
      setReordering(false);
    }
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <span>{loadError}</span>
        <button type="button" onClick={load} className="inline-flex items-center gap-1 font-medium underline">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Page sections</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add text or images, then drag sections into the order they should appear on the Books page.
              {reordering ? " Saving order…" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addText}
              disabled={loading || textBusy || imageBusy || Boolean(draftText) || Boolean(editingTextId)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Add text
            </button>
            <button
              type="button"
              onClick={() => selectImage()}
              disabled={loading || textBusy || imageBusy || Boolean(draftText) || Boolean(editingTextId)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add image
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={onFileChange}
        />

        <ImageProcessingModal
          open={Boolean(cropFile)}
          file={cropFile}
          onCancel={closeImageProcessor}
          onSave={saveProcessedImage}
        />

        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            {draftText ? (
              <div className="mb-4">
                <TextSectionEditor
                  section={draftText}
                  busy={textBusy}
                  onCancel={cancelTextEdit}
                  onSave={(content) => saveText(draftText, content)}
                />
              </div>
            ) : null}

            {sections.length === 0 && !draftText ? (
              <p className="text-sm text-gray-400">No sections yet. Add text or an image to begin.</p>
            ) : (
              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {sections.map((section) => (
                  <SectionReorderItem
                    key={section.id}
                    section={section}
                    isEditing={editingTextId === section.id}
                    textBusy={textBusy}
                    imageBusy={imageBusy}
                    onCancelEdit={cancelTextEdit}
                    onDelete={() => (
                      section.section_type === "text" ? deleteText(section.id) : deleteImage(section.id)
                    )}
                    onDragEnd={persistOrder}
                    onEdit={() => {
                      setEditingTextId(section.id);
                      setDraftText(null);
                    }}
                    onReplace={() => selectImage(section.id)}
                    onSaveDescription={(description) => saveImageDescription(section.id, description)}
                    onSaveText={saveText}
                  />
                ))}
              </Reorder.Group>
            )}
          </>
        )}
      </div>
    </section>
  );
}
