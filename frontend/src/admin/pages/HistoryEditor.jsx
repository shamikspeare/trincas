import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import ImageCropperModal from "../components/ImageCropperModal";
import { compressImage } from "../utils/imageCompressor";

const decades = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];

function getYearsForDecade(decade) {
  const decadeStart = parseInt(decade, 10);
  return Array.from({ length: 10 }, (_, i) => String(decadeStart + i));
}

function getStoragePathFromUrl(publicUrl) {
  const url = new URL(publicUrl);
  const marker = "/history-images/";
  const index = url.pathname.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.pathname.slice(index + marker.length));
}

export default function HistoryEditor() {
  const [selectedDecade, setSelectedDecade] = useState(decades[0]);
  const [selectedYear, setSelectedYear] = useState(getYearsForDecade(decades[0])[0]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [newCaption, setNewCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileToCrop, setFileToCrop] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  const years = getYearsForDecade(selectedDecade);

  const fetchYearData = async (year) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const { data: contentData, error: contentError } = await supabase
        .from("history_content")
        .select("*")
        .eq("year", Number(year))
        .maybeSingle();

      if (contentError) throw contentError;

      const { data: imagesData, error: imagesError } = await supabase
        .from("history_images")
        .select("*")
        .eq("year", Number(year))
        .order("sort_order", { ascending: true });

      if (imagesError) throw imagesError;

      setDescription(contentData?.description || "");
      setImages(imagesData || []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setStatusMessage({ type: "error", text: err.message || "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearData(selectedYear);
  }, [selectedYear]);

  const handleDecadeChange = (decade) => {
    setSelectedDecade(decade);
    const firstYear = getYearsForDecade(decade)[0];
    setSelectedYear(firstYear);
  };

  const handleSaveDescription = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const { error } = await supabase.from("history_content").upsert({
        year: Number(selectedYear),
        description,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setStatusMessage({ type: "success", text: "Description saved" });
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save description" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToCrop(file);
      setCropModalOpen(true);
    }
    e.target.value = "";
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setFileToCrop(null);
  };

  const handleCropSave = (croppedFile) => {
    setSelectedFile(croppedFile);
    setCropModalOpen(false);
    setFileToCrop(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage({ type: "error", text: "Please choose an image first" });
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      // Ensure the parent history_content row exists (FK requirement) —
      // ignoreDuplicates means this is a no-op if the year already has a row,
      // so it never overwrites an existing description.
      const { error: ensureError } = await supabase
        .from("history_content")
        .upsert({ year: Number(selectedYear) }, { onConflict: "year", ignoreDuplicates: true });
      if (ensureError) throw ensureError;

      // Compress the (cropped) file before upload
      const compressedFile = await compressImage(selectedFile);

      const ext = compressedFile.name.split(".").pop();
      const filename = `${selectedYear}-${crypto.randomUUID()}.${ext}`;
      const path = filename;

      const { error: uploadError } = await supabase.storage
        .from("history-images")
        .upload(path, compressedFile, { upsert: true, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("history-images")
        .getPublicUrl(path);

      if (!publicData?.publicUrl) throw new Error("Could not get public URL");

      const { error: insertError } = await supabase.from("history_images").insert({
        year: Number(selectedYear),
        image_url: publicData.publicUrl,
        caption: newCaption,
        sort_order: images.length,
      });

      if (insertError) throw insertError;

      setSelectedFile(null);
      setNewCaption("");
      setStatusMessage({ type: "success", text: "Image uploaded" });
      await fetchYearData(selectedYear);
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleCaptionBlur = async (img, newCaption) => {
    if (img.caption === newCaption) return;
    try {
      const { error } = await supabase
        .from("history_images")
        .update({ caption: newCaption })
        .eq("id", img.id);
      if (error) throw error;
      setStatusMessage({ type: "success", text: "Caption updated" });
      await fetchYearData(selectedYear);
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to update caption" });
    }
  };

  const handleDeleteImage = async (img) => {
    if (!window.confirm("Delete this image?")) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const storagePath = getStoragePathFromUrl(img.image_url);
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("history-images")
          .remove([storagePath]);
        if (storageError) throw storageError;
      }
      const { error: deleteError } = await supabase
        .from("history_images")
        .delete()
        .eq("id", img.id);
      if (deleteError) throw deleteError;
      setStatusMessage({ type: "success", text: "Image deleted" });
      await fetchYearData(selectedYear);
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to delete image" });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveImage = async (img, direction) => {
    const index = images.findIndex((i) => i.id === img.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= images.length) return;

    const newImages = [...images];
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];

    setSaving(true);
    setStatusMessage(null);
    try {
      const updates = newImages.map((item, i) =>
        supabase
          .from("history_images")
          .update({ sort_order: i })
          .eq("id", item.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;
      setStatusMessage({ type: "success", text: "Order updated" });
      await fetchYearData(selectedYear);
    } catch (err) {
      setStatusMessage({ type: "error", text: err.message || "Failed to reorder" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">History Editor</h1>
        <p className="mt-3 text-sm text-gray-600">
          Manage the history timeline content and images for Trincas.
        </p>

        {/* Decade selector */}
        <div className="mt-8 flex flex-wrap gap-2">
          {decades.map((decade) => (
            <button
              key={decade}
              onClick={() => handleDecadeChange(decade)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                selectedDecade === decade
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {decade}
            </button>
          ))}
        </div>

        {/* Year selector */}
        <div className="mt-4 flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                selectedYear === year
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`mt-4 rounded-lg px-4 py-2 text-sm ${
              statusMessage.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="mt-6 text-sm text-gray-400">Loading…</div>
        ) : (
          <>
            {/* Description card */}
            <section className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-lg font-medium text-gray-900">Description for {selectedYear}</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-3 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none"
                placeholder="Enter description…"
              />
              <button
                onClick={handleSaveDescription}
                disabled={saving}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Description"}
              </button>
            </section>

            {/* Upload image card */}
            <section className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-lg font-medium text-gray-900">Add Image for {selectedYear}</h2>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Caption (optional)"
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
                <button
                  onClick={handleUpload}
                  disabled={saving || !selectedFile}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
              {selectedFile && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {selectedFile.name} (cropped & ready)
                </p>
              )}
            </section>

            {/* Existing images list */}
            <section className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <h2 className="text-lg font-medium text-gray-900">Images for {selectedYear}</h2>
              {images.length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">No images added yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-start"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || ""}
                        className="h-24 w-24 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500">
                            #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveImage(img, "up")}
                              disabled={idx === 0 || saving}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveImage(img, "down")}
                              disabled={idx === images.length - 1 || saving}
                              className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200 disabled:opacity-40"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleDeleteImage(img)}
                              disabled={saving}
                              className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          defaultValue={img.caption || ""}
                          onBlur={(e) => handleCaptionBlur(img, e.target.value)}
                          placeholder="Caption"
                          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Crop modal */}
      <ImageCropperModal
        open={cropModalOpen}
        file={fileToCrop}
        onCancel={handleCropCancel}
        onSave={handleCropSave}
      />
    </main>
  );
}