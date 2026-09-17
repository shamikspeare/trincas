import DOMPurify from "dompurify";

// Only the tags/attributes RichTextEditor can actually produce.
// Anything else (script, style, event handlers, iframe, etc.) is stripped.
const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a"];
const ALLOWED_ATTR = ["href"];

export function sanitizeHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}