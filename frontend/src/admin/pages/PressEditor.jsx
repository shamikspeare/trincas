import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
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
  GripVertical
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import ImageUploadSummaryMessage from "../components/ImageUploadSummaryMessage";
import { IMAGE_ACCEPT, getImageProcessingSummary, processImage, validateImage } from "../utils/processImage";
import ImageProcessingModal from "../components/ImageProcessingModal";

const BUCKET = "press-images";

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

// Reorderable Card Component
function PressItemCard({ item, onEdit, onDelete, onDragEnd }) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 flex flex-col group w-[240px]"
    >
      <div className="aspect-[3/4] w-full bg-gray-100 relative shrink-0">
        {item.image_url ? (
          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <ImagePlus className="h-8 w-8 opacity-20" />
          </div>
        )}
        
        {/* Drag handle overlay */}
        <div 
          className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      
      <div className="p-3 flex flex-col bg-white">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">{item.title || 'Untitled'}</h3>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{item.publication || 'No publication'}</p>
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
    </Reorder.Item>
  );
}

export default function PressEditor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

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
    const { data, error } = await supabase
      .from("press_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("published_date", { ascending: false });

    if (error) {
      notify("error", "Failed to fetch press items");
      console.error(error);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openForm = (item = null) => {
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({ title: "", publication: "", image_url: "", link: "", published_date: "", sort_order: items.length });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.published_date) {
        payload.published_date = null;
      }

      if (payload.id) {
        const { error } = await supabase.from("press_items").update(payload).eq("id", payload.id);
        if (error) throw error;
        notify("success", "Press item updated successfully");
      } else {
        const { error } = await supabase.from("press_items").insert([payload]);
        if (error) throw error;
        notify("success", "Press item added successfully");
      }
      closeForm();
      fetchItems();
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

  // Drag and drop reordering
  const handleReorderChange = (newOrder) => {
    setItems(newOrder);
  };

  const handleDragEnd = async () => {
    try {
      // Create a payload array with updated sort_order based on the new array indices
      const updates = items.map((item, index) => ({
        id: item.id,
        title: item.title,
        publication: item.publication,
        link: item.link,
        image_url: item.image_url,
        published_date: item.published_date,
        sort_order: index,
      }));
      
      const { error } = await supabase.from("press_items").upsert(updates, { onConflict: 'id' });
      if (error) throw error;
      
    } catch (err) {
      console.error("Failed to save reorder", err);
      notify("error", "Failed to save new order");
      fetchItems(); // revert to original order if failed
    }
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
          <p className="mt-1 text-base text-gray-500 sm:text-lg">Manage press articles and mentions. Drag cards to reorder.</p>
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
          <Reorder.Group
            axis="x"
            values={items}
            onReorder={handleReorderChange}
            className="flex flex-wrap gap-6"
          >
            {items.map((item) => (
              <PressItemCard 
                key={item.id} 
                item={item} 
                onEdit={openForm} 
                onDelete={handleDelete}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Reorder.Group>
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
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        value={formData?.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publication</label>
                      <input
                        type="text"
                        value={formData?.publication || ""}
                        onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

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
                      <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                      <input
                        type="number"
                        value={formData?.sort_order || 0}
                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                      
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
