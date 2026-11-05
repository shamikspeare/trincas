import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
  X,
  Newspaper,
  GripVertical,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Tag,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import {
  buildPublicationOptions,
  cleanPublicationName,
  getPressItemPublicationName,
  normalizePublicationName,
} from "../../lib/pressPublications";
import ImageUploadSummaryMessage from "../components/ImageUploadSummaryMessage";
import { IMAGE_ACCEPT, getImageProcessingSummary, processImage, validateImage } from "../utils/processImage";
import ImageProcessingModal from "../components/ImageProcessingModal";

const BUCKET = "press-images";
const MISSING_PUBLICATION_SCHEMA_CODES = ["42703", "42P01", "PGRST200", "PGRST205"];

function publicationRelation(item) {
  return Array.isArray(item?.publication_record)
    ? item.publication_record[0]
    : item?.publication_record;
}

function mergePublications(registeredPublications, items) {
  const publications = new Map();

  registeredPublications.forEach((publication) => {
    publications.set(publication.normalized_name, publication);
  });

  buildPublicationOptions(items).forEach((publication) => {
    if (!publications.has(publication.key)) {
      publications.set(publication.key, {
        id: null,
        name: publication.name,
        normalized_name: publication.key,
      });
    }
  });

  return Array.from(publications.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

function reorder(items, from, to) {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function PublicationField({
  publications,
  value,
  publicationId,
  deletingPublicationId,
  onChange,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const selectedName = cleanPublicationName(value);
  const normalizedSelectedName = normalizePublicationName(selectedName);
  const cleanedQuery = cleanPublicationName(query);
  const normalizedQuery = normalizePublicationName(query);

  const filteredPublications = useMemo(() => {
    if (!normalizedQuery) return publications;
    return publications.filter((publication) =>
      publication.normalized_name.includes(normalizedQuery)
    );
  }, [normalizedQuery, publications]);

  const exactQueryMatch = publications.find(
    (publication) => publication.normalized_name === normalizedQuery
  );

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const selectPublication = (publication) => {
    onChange(publication.name, publication.id);
    setQuery("");
    setOpen(false);
  };

  const chooseNewPublication = () => {
    if (!cleanedQuery) return;
    onChange(cleanedQuery, null);
    setQuery("");
    setOpen(false);
  };

  const clearPublication = () => {
    onChange("", null);
    setQuery("");
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="press-publication" className="block text-sm font-medium text-gray-700">
        Publication Name
      </label>
      <div
        className="mt-1 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500"
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        {selectedName && !query ? (
          <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
            <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{selectedName}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                clearPublication();
              }}
              className="rounded-full p-0.5 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700"
              aria-label={`Remove ${selectedName} publication tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ) : (
          <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
        )}
        <input
          ref={inputRef}
          id="press-publication"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="press-publication-options"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event.target.value, null);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") setOpen(true);
            if (event.key === "Backspace" && !query && selectedName) clearPublication();
            if (event.key === "Enter" && cleanedQuery) {
              event.preventDefault();
              if (exactQueryMatch) selectPublication(exactQueryMatch);
              else chooseNewPublication();
            }
          }}
          placeholder={selectedName && !query ? "Search or replace publication" : "Search or create a publication"}
          maxLength={160}
          className="min-w-[10rem] flex-1 border-0 bg-transparent p-0.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Toggle publication names"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open ? (
        <div
          id="press-publication-options"
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
        >
          {filteredPublications.map((publication) => (
            <div
              key={publication.normalized_name}
              className="group flex w-full items-center rounded-md text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <button
                type="button"
                role="option"
                aria-selected={publicationId === publication.id || normalizedSelectedName === publication.normalized_name}
                onClick={() => selectPublication(publication)}
                className="flex min-w-0 flex-1 items-center justify-between px-3 py-2 text-left"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Tag className="h-4 w-4 shrink-0 text-indigo-400" aria-hidden="true" />
                  <span className="truncate">{publication.name}</span>
                </span>
                {(publicationId === publication.id || normalizedSelectedName === publication.normalized_name) ? (
                  <Check className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                ) : null}
              </button>
              {publication.id ? (
                <button
                  type="button"
                  onClick={() => onDelete(publication)}
                  disabled={deletingPublicationId === publication.id}
                  className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-rose-100 hover:text-rose-600 disabled:cursor-wait disabled:opacity-60"
                  aria-label={`Delete ${publication.name} publication from the database`}
                  title="Delete publication name"
                >
                  {deletingPublicationId === publication.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              ) : null}
            </div>
          ))}

          {cleanedQuery && !exactQueryMatch ? (
            <button
              type="button"
              onClick={chooseNewPublication}
              className="flex w-full items-center gap-2 rounded-md border-t border-gray-100 px-3 py-2 text-left text-sm text-indigo-700 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Create publication <span className="font-semibold">“{cleanedQuery}”</span></span>
            </button>
          ) : null}

          {!filteredPublications.length && (!cleanedQuery || exactQueryMatch) ? (
            <p className="px-3 py-2 text-sm text-gray-500">No publications found.</p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-1.5 text-xs text-gray-500">
        Select a publication or type a new one. Use the trash icon to remove an existing publication from the database and its linked press items.
      </p>
    </div>
  );
}

async function uploadImage(file, options = {}) {
  const processedFile = await processImage(file, options);
  const summary = getImageProcessingSummary(processedFile);
  const path = `public/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, processedFile, { upsert: true, cacheControl: "3600", contentType: "image/webp" });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not resolve public URL for uploaded image");
  return { publicUrl: data.publicUrl, summary };
}

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

function PressItemCard({ item, index, itemCount, disabled, onEdit, onDelete, onDragStart, onDragEnd, onDrop, onMove }) {
  return (
    <article
      draggable={!disabled}
      onDragStart={() => onDragStart(index)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(index)}
      className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition ${disabled ? "cursor-wait opacity-70" : "cursor-grab active:cursor-grabbing"}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
          <GripVertical className="h-4 w-4" aria-hidden="true" />
          <span>Drag to reorder</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={disabled || index === 0}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            aria-label={`Move ${item.title || "press item"} earlier`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={disabled || index === itemCount - 1}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            aria-label={`Move ${item.title || "press item"} later`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative aspect-[3/4] w-full shrink-0 bg-gray-100">
        {item.image_url ? (
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <ImagePlus className="h-8 w-8 opacity-20" />
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col bg-white">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">{item.title || 'Untitled'}</h3>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{getPressItemPublicationName(item) || 'No publication'}</p>
        </div>
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors flex-1 justify-center"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex-1 justify-center"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PressEditor() {
  const [items, setItems] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [deletingPublicationId, setDeletingPublicationId] = useState(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Image Upload State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [fileToCrop, setFileToCrop] = useState(null);
  const [imageBusy, setImageBusy] = useState(false);
  const fileInputRef = useRef(null);

  function notify(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
  }

  const fetchItems = async () => {
    setLoading(true);
    let itemsResult = await supabase
      .from("press_items")
      .select("*, publication_record:press_publications(id, name, normalized_name)")
      .order("sort_order", { ascending: true })
      .order("published_date", { ascending: false });

    if (MISSING_PUBLICATION_SCHEMA_CODES.includes(itemsResult.error?.code)) {
      itemsResult = await supabase
        .from("press_items")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("published_date", { ascending: false });
    }

    const publicationResult = await supabase
      .from("press_publications")
      .select("id, name, normalized_name")
      .order("name", { ascending: true });

    if (itemsResult.error) {
      notify("error", "Failed to fetch press items");
      console.error(itemsResult.error);
    } else {
      const nextItems = itemsResult.data || [];
      setItems(nextItems);

      if (publicationResult.error && !MISSING_PUBLICATION_SCHEMA_CODES.includes(publicationResult.error.code)) {
        notify("error", "Failed to fetch publication names");
        console.error(publicationResult.error);
      }

      setPublications(mergePublications(publicationResult.data || [], nextItems));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openForm = (item = null) => {
    if (item) {
      const relation = publicationRelation(item);
      setFormData({
        ...item,
        publication: getPressItemPublicationName(item),
        publication_id: item.publication_id || relation?.id || null,
      });
    } else {
      const nextSortOrder = items.reduce(
        (highest, item) => Math.max(highest, item.sort_order ?? -1),
        -1
      ) + 1;
      setFormData({ title: "", publication: "", publication_id: null, image_url: "", link: "", published_date: "", sort_order: nextSortOrder });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(null);
  };

  const resolvePublication = async (value) => {
    const name = cleanPublicationName(value);
    const normalizedName = normalizePublicationName(name);
    if (!normalizedName) return null;

    const cached = publications.find(
      (publication) => publication.normalized_name === normalizedName && publication.id
    );
    if (cached) return cached;

    const { data: existing, error: existingError } = await supabase
      .from("press_publications")
      .select("id, name, normalized_name")
      .eq("normalized_name", normalizedName)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return existing;

    const { data: created, error: createError } = await supabase
      .from("press_publications")
      .insert({ name, normalized_name: normalizedName })
      .select("id, name, normalized_name")
      .single();

    if (!createError) return created;

    // Another admin may have created the same normalized name between the
    // lookup and insert. Reuse that row instead of creating a duplicate.
    if (createError.code === "23505") {
      const { data: concurrent, error: concurrentError } = await supabase
        .from("press_publications")
        .select("id, name, normalized_name")
        .eq("normalized_name", normalizedName)
        .single();
      if (concurrentError) throw concurrentError;
      return concurrent;
    }

    throw createError;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData?.title?.trim()) {
      notify("error", "Add a title before saving this press item");
      return;
    }

    if (!formData?.image_url) {
      notify("error", "Upload an image before saving this press item");
      return;
    }

    setSaving(true);
    try {
      const publication = await resolvePublication(formData.publication);
      const {
        id,
        created_at: _createdAt,
        publication_record: _publicationRecord,
        ...editableFields
      } = formData;
      const payload = {
        ...editableFields,
        title: formData.title.trim(),
        publication: publication?.name || null,
        publication_id: publication?.id || null,
      };
      if (!payload.published_date) {
        payload.published_date = null;
      }

      if (id) {
        const { error } = await supabase.from("press_items").update(payload).eq("id", id);
        if (error) throw error;
        notify("success", "Press item updated successfully");
      } else {
        const { error } = await supabase.from("press_items").insert([payload]);
        if (error) throw error;
        notify("success", "Press item added successfully");
      }
      closeForm();
      await fetchItems();
    } catch (err) {
      console.error(err);
      notify("error", err.message || "Failed to save press item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this press item?")) return;
    try {
      const { error } = await supabase.from("press_items").delete().eq("id", id);
      if (error) throw error;
      notify("success", "Press item deleted");
      fetchItems();
    } catch (err) {
      console.error(err);
      notify("error", "Failed to delete press item");
    }
  };

  const handleDeletePublication = async (publication) => {
    if (!publication?.id || deletingPublicationId) return;

    const linkedItemCount = items.filter((item) => {
      const relation = publicationRelation(item);
      return (
        item.publication_id === publication.id
        || relation?.id === publication.id
        || normalizePublicationName(getPressItemPublicationName(item)) === publication.normalized_name
      );
    }).length;
    const linkedItemMessage = linkedItemCount
      ? ` It will also remove this publication from ${linkedItemCount} linked press ${linkedItemCount === 1 ? "item" : "items"}.`
      : "";

    if (!window.confirm(
      `Delete the publication “${publication.name}” from the database?${linkedItemMessage} The press items themselves will not be deleted.`
    )) return;

    setDeletingPublicationId(publication.id);
    try {
      const { data, error } = await supabase
        .from("press_publications")
        .delete()
        .eq("id", publication.id)
        .select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("The publication was not deleted");

      setFormData((current) => {
        if (!current) return current;
        const currentMatches = (
          current.publication_id === publication.id
          || normalizePublicationName(current.publication) === publication.normalized_name
        );
        return currentMatches
          ? { ...current, publication: "", publication_id: null }
          : current;
      });
      notify("success", `Publication “${publication.name}” deleted`);
      await fetchItems();
    } catch (err) {
      console.error(err);
      notify("error", err.message || "Failed to delete publication");
    } finally {
      setDeletingPublicationId(null);
    }
  };

  const persistOrder = async (orderedItems) => {
    const nextItems = orderedItems.map((item, index) => ({ ...item, sort_order: index }));
    setItems(nextItems);
    setReordering(true);
    try {
      const results = await Promise.all(nextItems.map((item) =>
        supabase
          .from("press_items")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
      ));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      notify("success", "Press order saved");
    } catch (err) {
      console.error("Failed to save reorder", err);
      notify("error", "Failed to save new order");
      await fetchItems();
    } finally {
      setReordering(false);
    }
  };

  const handleDrop = async (dropIndex) => {
    if (draggingIndex === null || draggingIndex === dropIndex || reordering) {
      setDraggingIndex(null);
      return;
    }
    const next = reorder(items, draggingIndex, dropIndex);
    setDraggingIndex(null);
    await persistOrder(next);
  };

  const moveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length || reordering) return;
    await persistOrder(reorder(items, index, targetIndex));
  };

  // Image Handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      validateImage(file);
      setFileToCrop(file);
      setImageModalOpen(true);
    } catch (err) {
      notify("error", err.message);
    }
    // reset input so the same file can be selected again if modal is closed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleProcessedImage = async (options) => {
    setImageBusy(true);
    try {
      const { publicUrl, summary } = await uploadImage(fileToCrop, options);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      notify("success", <ImageUploadSummaryMessage title="Image uploaded" summary={summary} />);
    } catch (err) {
      console.error(err);
      notify("error", "Failed to upload image");
    } finally {
      setImageBusy(false);
      setImageModalOpen(false);
      setFileToCrop(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-8">
      <AnimatePresence>{toast && <Toast toast={toast} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Press</h1>
          <p className="mt-1 text-base text-gray-500 sm:text-lg">Add a titled image for each press article or mention, then drag cards to reorder them.</p>
        </div>
        <button
          onClick={() => openForm()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex py-10 justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <Newspaper className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No press items</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new press article.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <PressItemCard 
                key={item.id} 
                item={item}
                index={index}
                itemCount={items.length}
                disabled={reordering}
                onEdit={openForm} 
                onDelete={handleDelete}
                onDragStart={setDraggingIndex}
                onDragEnd={() => setDraggingIndex(null)}
                onDrop={handleDrop}
                onMove={moveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
              onClick={closeForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-50 w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {formData?.id ? "Edit Press Item" : "Add Press Item"}
                </h2>
                <button
                  onClick={closeForm}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 flex-1">
                <form id="press-form" onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Title <span className="text-rose-600">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData?.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <PublicationField
                      publications={publications}
                      value={formData?.publication || ""}
                      publicationId={formData?.publication_id || null}
                      deletingPublicationId={deletingPublicationId}
                      onChange={(publication, publicationId) => setFormData({
                        ...formData,
                        publication,
                        publication_id: publicationId,
                      })}
                      onDelete={handleDeletePublication}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Published Date</label>
                      <input
                        type="date"
                        value={formData?.published_date ? formData.published_date.split('T')[0] : ""}
                        onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Link URL</label>
                      <input
                        type="url"
                        value={formData?.link || ""}
                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image <span className="text-rose-600">*</span></label>
                      <p className="mb-3 text-xs text-gray-500">This image and title appear together on the public Press page.</p>
                      
                      <div className="relative aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-xl bg-gray-100 border border-gray-200 group">
                        {formData?.image_url ? (
                          <>
                            <img src={formData.image_url} alt="" className="h-full w-full object-cover" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-lg bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
                                title="Replace image"
                              >
                                <ImagePlus className="h-5 w-5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="rounded-lg bg-rose-500/80 p-2 text-white backdrop-blur-sm hover:bg-rose-500"
                                title="Remove image"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <ImagePlus className="h-6 w-6" />
                            <span className="text-sm font-medium">Upload Image</span>
                          </button>
                        )}
                        
                        {imageBusy && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept={IMAGE_ACCEPT}
                        className="hidden"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="press-form"
                  disabled={saving || imageBusy}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImageProcessingModal
        open={imageModalOpen}
        onCancel={() => {
          setImageModalOpen(false);
          setFileToCrop(null);
        }}
        file={fileToCrop}
        onSave={handleProcessedImage}
        aspect={3/4}
      />
    </div>
  );
}
