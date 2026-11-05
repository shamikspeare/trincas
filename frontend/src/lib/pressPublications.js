export function cleanPublicationName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function normalizePublicationName(value) {
  return cleanPublicationName(value).toLowerCase();
}

export function getPressItemPublicationName(item) {
  const relation = Array.isArray(item?.publication_record)
    ? item.publication_record[0]
    : item?.publication_record;

  // The card's own publication text is the display value and the source for
  // public filter options. The relation is only a compatibility fallback for
  // entries that were saved without the legacy text field populated.
  return cleanPublicationName(item?.publication || relation?.name);
}

export function buildPublicationOptions(items = []) {
  const publications = new Map();

  items.forEach((item) => {
    const name = getPressItemPublicationName(item);
    const key = normalizePublicationName(name);
    if (key && !publications.has(key)) publications.set(key, name);
  });

  return Array.from(publications, ([key, name]) => ({ key, name })).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}
