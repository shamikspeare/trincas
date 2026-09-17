import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Undo,
  Redo,
  X,
} from "lucide-react";

/* ---------- Constants ---------- */

const HISTORY_SECTIONS = [
  { value: "1948", label: "1948" },
  { value: "1955", label: "1955" },
  { value: "1965", label: "1965" },
  { value: "Portuguese Era", label: "Portuguese Era" },
];

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/* ---------- Helpers ---------- */

// Convert a section label ("Portuguese Era") to its anchor ("portuguese-era")
function sectionToAnchor(label) {
  return label.toLowerCase().replace(/\s+/g, "-");
}

// Try to resolve an internal link's page + section from a stored href
function parseInternalHref(href) {
  const [path, hash = ""] = href.split("#");
  const page = path === "/" || path === "" ? "home" : path.replace(/^\//, "");
  const match = HISTORY_SECTIONS.find((s) => sectionToAnchor(s.value) === hash);
  return { page, section: match ? match.value : HISTORY_SECTIONS[0].value };
}

// Build an internal href from page + section
function buildInternalHref(page, section) {
  let url = page === "home" ? "/" : `/${page}`;
  if (page === "history" && section) {
    url = `${url}#${sectionToAnchor(section)}`;
  }
  return url;
}

// Prepend https:// if no scheme, then validate against a protocol whitelist.
// Returns the normalized URL string, or null if invalid.
function normalizeExternalUrl(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;

  // If no scheme at all, assume https
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return null;
    return withScheme;
  } catch {
    return null;
  }
}

/* ---------- Link picker dialog ---------- */

function LinkPickerDialog({
  isOpen,
  onClose,
  onInsert,
  onRemove,
  initialText = "",
  initialUrl = "",
  isEditing = false,
}) {
  const [linkText, setLinkText] = useState("");
  const [linkType, setLinkType] = useState("internal");
  const [externalUrl, setExternalUrl] = useState("");
  const [page, setPage] = useState("home");
  const [section, setSection] = useState(HISTORY_SECTIONS[0].value);
  const [error, setError] = useState("");

  // Sync state whenever the dialog is opened
  useEffect(() => {
    if (!isOpen) return;

    setLinkText(initialText || "");
    setError("");

    if (initialUrl) {
      if (initialUrl.startsWith("/")) {
        const { page: p, section: s } = parseInternalHref(initialUrl);
        setLinkType("internal");
        setPage(p);
        setSection(s);
        setExternalUrl("");
      } else {
        setLinkType("external");
        setExternalUrl(initialUrl);
        setPage("home");
        setSection(HISTORY_SECTIONS[0].value);
      }
    } else {
      setLinkType("internal");
      setExternalUrl("");
      setPage("home");
      setSection(HISTORY_SECTIONS[0].value);
    }
  }, [isOpen, initialText, initialUrl]);

  if (!isOpen) return null;

  const trimmedText = linkText.trim();
  const canInsert =
    trimmedText !== "" &&
    (linkType === "internal" || externalUrl.trim() !== "");

  const handleInsert = () => {
    if (!trimmedText) {
      setError("Please enter link text.");
      return;
    }

    let url;
    if (linkType === "external") {
      const normalized = normalizeExternalUrl(externalUrl);
      if (!normalized) {
        setError("Please enter a valid URL (e.g. https://example.com).");
        return;
      }
      url = normalized;
    } else {
      url = buildInternalHref(page, section);
    }

    onInsert({ text: trimmedText, url });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {isEditing ? "Edit Link" : "Insert Link"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Link text */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Link Text
          </label>
          <input
            type="text"
            autoFocus
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="Text to display"
            value={linkText}
            onChange={(e) => {
              setLinkText(e.target.value);
              if (error) setError("");
            }}
          />
        </div>

        {/* Link type */}
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              checked={linkType === "internal"}
              onChange={() => {
                setLinkType("internal");
                if (error) setError("");
              }}
            />
            Internal Page
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              checked={linkType === "external"}
              onChange={() => {
                setLinkType("external");
                if (error) setError("");
              }}
            />
            External URL
          </label>
        </div>

        {/* Destination */}
        {linkType === "external" ? (
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              URL
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="https://example.com"
              value={externalUrl}
              onChange={(e) => {
                setExternalUrl(e.target.value);
                if (error) setError("");
              }}
            />
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Page
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={page}
                onChange={(e) => setPage(e.target.value)}
              >
                <option value="home">Home</option>
                <option value="dining">Dining</option>
                <option value="food">Food</option>
                <option value="music">Music</option>
                <option value="history">History</option>
                <option value="gallery">Gallery</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            {page === "history" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Section
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                >
                  {HISTORY_SECTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {error ? (
          <p className="mb-3 text-xs text-rose-600">{error}</p>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <div>
            {isEditing ? (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
              >
                Remove Link
              </button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!canInsert}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? "Update" : "Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Menu bar ---------- */

const MenuBar = ({ editor }) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({
    initialText: "",
    initialUrl: "",
    isEditing: false,
    range: null,
  });

  if (!editor) return null;

  const openLinkDialog = () => {
    if (editor.isActive("link")) {
      // Expand to the entire link, read text + href, then remember the range
      editor.chain().extendMarkRange("link").run();
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      const href = editor.getAttributes("link").href || "";

      setDialogData({
        initialText: text,
        initialUrl: href,
        isEditing: true,
        range: { from, to },
      });
    } else {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;
      const selectedText = hasSelection
        ? editor.state.doc.textBetween(from, to, " ")
        : "";

      setDialogData({
        initialText: selectedText,
        initialUrl: "",
        isEditing: false,
        range: hasSelection ? { from, to } : null,
      });
    }
    setLinkDialogOpen(true);
  };

  const handleInsertLink = ({ text, url }) => {
    const range = dialogData.range;

    if (range) {
      const currentText = editor.state.doc.textBetween(range.from, range.to, " ");
      if (currentText === text) {
        // Same visible text → just (re)apply the link mark on the whole range
        editor
          .chain()
          .focus()
          .setTextSelection(range)
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      } else {
        // Visible text changed → replace the range with new text + link
        editor
          .chain()
          .focus()
          .setTextSelection(range)
          .insertContent({
            type: "text",
            text,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .unsetMark("link")
          .run();
      }
    } else {
      // No selection → insert the text and mark it as a link in one step
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .unsetMark("link")
        .run();
    }

    setLinkDialogOpen(false);
  };

  const handleRemoveLink = () => {
    const range = dialogData.range;
    if (range) {
      editor.chain().focus().setTextSelection(range).unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border-b border-gray-200 bg-gray-50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`rounded-md p-1.5 ${editor.isActive("bold")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-200"}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`rounded-md p-1.5 ${editor.isActive("italic")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-200"}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`rounded-md p-1.5 ${editor.isActive("underline")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-200"}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded-md p-1.5 ${editor.isActive("bulletList")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-200"}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded-md p-1.5 ${editor.isActive("orderedList")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-200"}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300"></div>

        <button
          type="button"
          onClick={openLinkDialog}
          className={`rounded-md p-1.5 ${editor.isActive("link")
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-200"}`}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-gray-300"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="rounded-md p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      <LinkPickerDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onInsert={handleInsertLink}
        onRemove={handleRemoveLink}
        initialText={dialogData.initialText}
        initialUrl={dialogData.initialUrl}
        isEditing={dialogData.isEditing}
      />
    </>
  );
};

/* ---------- Editor ---------- */

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Type your content here...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,

        // Registered separately below with custom configuration
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html === "<p></p>") {
        onChange("");
      } else {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-editor focus:outline-none min-h-[120px] px-4 py-3 text-sm text-gray-800",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (!value && editor.getHTML() === "<p></p>") return;
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <div className="mt-2 w-full rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="rounded-b-lg" />
    </div>
  );
}