import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, ImagePlus, Play, Loader2, Save, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { fetchPageLayout, normalizeInstagramUrl } from "../../lib/pageLayouts";
import { sanitizeHtml } from "../../lib/sanitize";
import ImageUploadSummaryMessage from "./ImageUploadSummaryMessage";
import { IMAGE_ACCEPT, getImageProcessingSummary, processImage, validateImage } from "../utils/processImage";
import ImageProcessingModal from "./ImageProcessingModal";
import RichTextEditor from "./RichTextEditor";

const BUCKET = "page-content";

function tempId() {
  return `layout_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
}

async function uploadPageImage(file, pageKey, options = {}) {
  const processed = await processImage(file, options);
  const summary = getImageProcessingSummary(processed);
  const path = `${pageKey.replace(/[^a-z0-9-]/gi, "-")}/${tempId()}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, processed, { upsert: false, cacheControl: "3600", contentType: "image/webp" });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Could not create an image URL");
  return { publicUrl: data.publicUrl, summary };
}

function ImageSlot({ src, label, busy, onSelect, onRemove, ratio = "aspect-[16/10]" }) {
  const inputRef = useRef(null);
  return (
    <div className={`group relative w-full overflow-hidden rounded-xl bg-gray-100 ${ratio}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">{label}</span>
        </div>
      )}
      {busy ? <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-5 w-5 animate-spin text-white" /></div> : (
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow">
            {src ? "Replace" : "Upload"}
          </button>
          {src ? <button type="button" onClick={onRemove} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-rose-600 shadow">Remove</button> : null}
        </div>
      )}
      <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onSelect(file);
        event.target.value = "";
      }} />
    </div>
  );
}

function reorder(items, from, to) {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export default function PageLayoutEditor({ pageKey, title, notify }) {
  const [layout, setLayout] = useState(null);
  const [imageCards, setImageCards] = useState([]);
  const [instagramVideos, setInstagramVideos] = useState([]);
  const [draft, setDraft] = useState({ heading: "", body: "" });
  const [newInstagramUrl, setNewInstagramUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [cropTarget, setCropTarget] = useState(null);
  const [dragging, setDragging] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: ensureError } = await supabase
        .from("page_layouts")
        .upsert({ page_key: pageKey }, { onConflict: "page_key", ignoreDuplicates: true });
      if (ensureError) throw ensureError;
      const data = await fetchPageLayout(pageKey);
      setLayout(data.layout || { page_key: pageKey, heading: "", body: "", lead_image_url: null });
      setImageCards(data.imageCards);
      setInstagramVideos(data.instagramVideos);
      setDraft({ heading: data.layout?.heading || "", body: data.layout?.body || "" });
    } catch (err) {
      setError(err.message || "Failed to load page content");
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  useEffect(() => { load(); }, [load]);

  async function saveFields(fields, successMessage) {
    setSaving(true);
    try {
      const { error: updateError } = await supabase.from("page_layouts").update(fields).eq("page_key", pageKey);
      if (updateError) throw updateError;
      setLayout((current) => ({ ...current, ...fields }));
      if (successMessage) notify?.("success", successMessage);
    } catch (err) {
      notify?.("error", err.message || "Failed to save page content");
    } finally {
      setSaving(false);
    }
  }

  async function saveText() {
    await saveFields(
      { heading: draft.heading.trim() || null, body: sanitizeHtml(draft.body) || null },
      "Page content saved"
    );
  }

  function openCrop(file, target) {
    try {
      validateImage(file);
    } catch (error) {
      notify?.("error", error.message);
      return;
    }
    setCropTarget({ file, target });
  }

  async function saveProcessedImage(options) {
    if (!cropTarget) return;
    setUploading(true);
    try {
      const { publicUrl: imageUrl, summary } = await uploadPageImage(cropTarget.file, pageKey, options);
      if (cropTarget.target.kind === "lead") {
        const { error: updateError } = await supabase.from("page_layouts").update({ lead_image_url: imageUrl }).eq("page_key", pageKey);
        if (updateError) throw updateError;
      } else if (cropTarget.target.kind === "image-card-add") {
        const { error: insertError } = await supabase.from("page_image_cards").insert({
          page_key: pageKey,
          image_url: imageUrl,
          alt_text: "",
          display_order: imageCards.length,
        });
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase.from("page_image_cards").update({ image_url: imageUrl }).eq("id", cropTarget.target.id);
        if (updateError) throw updateError;
      }
      notify?.("success", <ImageUploadSummaryMessage title="Image saved" summary={summary} />);
      setCropTarget(null);
      await load();
    } catch (err) {
      notify?.("error", err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function removeLeadImage() {
    await saveFields({ lead_image_url: null }, "Lead image removed");
  }

  async function removeImageCard(id) {
    setSaving(true);
    try {
      const { error: deleteError } = await supabase.from("page_image_cards").delete().eq("id", id);
      if (deleteError) throw deleteError;
      notify?.("success", "Image card removed");
      await load();
    } catch (err) {
      notify?.("error", err.message || "Failed to remove image card");
    } finally {
      setSaving(false);
    }
  }

  async function updateImageAlt(card, altText) {
    if ((card.alt_text || "") === altText) return;
    const { error: updateError } = await supabase.from("page_image_cards").update({ alt_text: altText }).eq("id", card.id);
    if (updateError) notify?.("error", updateError.message || "Failed to save alt text");
  }

  async function persistOrder(table, orderedItems) {
    setSaving(true);
    try {
      const results = await Promise.all(orderedItems.map((item, index) =>
        supabase.from(table).update({ display_order: index }).eq("id", item.id)
      ));
      const failed = results.find((result) => result.error);
      if (failed?.error) throw failed.error;
      await load();
    } catch (err) {
      notify?.("error", err.message || "Failed to save the new order");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleImageDrop(dropIndex) {
    if (dragging?.type !== "image" || dragging.index === dropIndex) return;
    const next = reorder(imageCards, dragging.index, dropIndex);
    setImageCards(next);
    setDragging(null);
    await persistOrder("page_image_cards", next);
  }

  async function addInstagramVideo() {
    const instagramUrl = normalizeInstagramUrl(newInstagramUrl);
    if (!instagramUrl) {
      notify?.("error", "Enter a valid https://www.instagram.com/ link");
      return;
    }
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from("page_instagram_videos").insert({
        page_key: pageKey,
        instagram_url: instagramUrl,
        display_order: instagramVideos.length,
      });
      if (insertError) throw insertError;
      setNewInstagramUrl("");
      notify?.("success", "Instagram video added");
      await load();
    } catch (err) {
      notify?.("error", err.message || "Failed to add Instagram video");
    } finally {
      setSaving(false);
    }
  }

  async function updateInstagramVideo(video, value) {
    const instagramUrl = normalizeInstagramUrl(value);
    if (!instagramUrl) {
      notify?.("error", "Enter a valid https://www.instagram.com/ link");
      return;
    }
    if (instagramUrl === video.instagram_url) return;
    const { error: updateError } = await supabase.from("page_instagram_videos").update({ instagram_url: instagramUrl }).eq("id", video.id);
    if (updateError) notify?.("error", updateError.message || "Failed to update Instagram video");
    else await load();
  }

  async function removeInstagramVideo(id) {
    setSaving(true);
    try {
      const { error: deleteError } = await supabase.from("page_instagram_videos").delete().eq("id", id);
      if (deleteError) throw deleteError;
      notify?.("success", "Instagram video removed");
      await load();
    } catch (err) {
      notify?.("error", err.message || "Failed to remove Instagram video");
    } finally {
      setSaving(false);
    }
  }

  async function handleInstagramDrop(dropIndex) {
    if (dragging?.type !== "instagram" || dragging.index === dropIndex) return;
    const next = reorder(instagramVideos, dragging.index, dropIndex);
    setInstagramVideos(next);
    setDragging(null);
    await persistOrder("page_instagram_videos", next);
  }

  const isFoodPage = Boolean(pageKey?.startsWith("food:"));
  const isMusicPage = Boolean(pageKey?.startsWith("music"));
  const hideHeadingTextLead = isFoodPage || isMusicPage;

  const cardSectionTitle = isFoodPage ? "Menu cards" : isMusicPage ? "Schedule cards" : "Image cards";
  const cardItemLabel = isFoodPage ? "Menu card" : isMusicPage ? "Schedule card" : "Image card";
  const addCardLabel = isFoodPage ? "Add menu card" : isMusicPage ? "Add schedule card" : "Add image card";

  if (loading) return <div className="flex items-center gap-2 py-6 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" />Loading {title}…</div>;
  if (error) return <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{error}<button onClick={load} className="ml-3 font-medium underline">Retry</button></div>;

  return (
    <div className="space-y-8 rounded-2xl border border-black bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">Content appears in the same order on the public page.</p>
      </div>

      {!hideHeadingTextLead && (
        <section>
          <h4 className="text-lg font-semibold text-gray-900">Heading and paragraphs</h4>
          <input value={draft.heading} onChange={(event) => setDraft((current) => ({ ...current, heading: event.target.value }))} placeholder="Heading (optional)" className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
          <RichTextEditor
            value={draft.body}
            onChange={(html) => setDraft((current) => ({ ...current, body: html }))}
            placeholder="Type your content here..."
          />
          <button type="button" onClick={saveText} disabled={saving} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save text
          </button>
        </section>
      )}

      {!hideHeadingTextLead && (
        <section>
          <h4 className="text-lg font-semibold text-gray-900">Lead image</h4>
          <div className="mt-3 max-w-xl"><ImageSlot src={layout?.lead_image_url} label="Upload lead image" busy={uploading} onSelect={(file) => openCrop(file, { kind: "lead" })} onRemove={removeLeadImage} /></div>
        </section>
      )}

      <section>
        <h4 className="text-lg font-semibold text-gray-900">{cardSectionTitle}</h4>
        <p className="mt-1 text-sm text-gray-500">Drag cards to set their horizontal display order.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {imageCards.map((card, index) => (
            <div key={card.id} draggable onDragStart={() => setDragging({ type: "image", index })} onDragOver={(event) => event.preventDefault()} onDrop={() => handleImageDrop(index)} className="rounded-xl border border-gray-200 p-3">
              <GripVertical className="mb-2 h-4 w-4 cursor-grab text-gray-300" />
              <ImageSlot src={card.image_url} label={cardItemLabel} busy={uploading} ratio="aspect-square" onSelect={(file) => openCrop(file, { kind: "image-card", id: card.id })} onRemove={() => removeImageCard(card.id)} />
              <input defaultValue={card.alt_text || ""} onBlur={(event) => updateImageAlt(card, event.target.value)} placeholder="Alt text (optional)" className="mt-3 w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none" />
            </div>
          ))}
          <ImageSlot src={null} label={addCardLabel} busy={uploading} ratio="aspect-square" onSelect={(file) => openCrop(file, { kind: "image-card-add" })} />
        </div>
      </section>

      <section>
        <h4 className="text-lg font-semibold text-gray-900">Instagram videos</h4>
        <p className="mt-1 text-sm text-gray-500">Cards embed and play the reel directly on the page.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input value={newInstagramUrl} onChange={(event) => setNewInstagramUrl(event.target.value)} placeholder="https://www.instagram.com/reel/..." className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none" />
          <button type="button" onClick={addInstagramVideo} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"><Play className="h-4 w-4" />Add video</button>
        </div>
        <div className="mt-4 space-y-2">
          {instagramVideos.map((video, index) => (
            <div key={video.id} draggable onDragStart={() => setDragging({ type: "instagram", index })} onDragOver={(event) => event.preventDefault()} onDrop={() => handleInstagramDrop(index)} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300" />
              <input defaultValue={video.instagram_url} onBlur={(event) => updateInstagramVideo(video, event.target.value)} className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm focus:border-indigo-400 focus:outline-none" />
              <button type="button" onClick={() => removeInstagramVideo(video.id)} disabled={saving} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-50" aria-label="Remove Instagram video"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <ImageProcessingModal open={Boolean(cropTarget)} file={cropTarget?.file} onCancel={() => setCropTarget(null)} onSave={saveProcessedImage} />
    </div>
  );
}