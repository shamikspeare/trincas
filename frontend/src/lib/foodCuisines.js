export const FOOD_CUISINES = [
  { name: "Indian", slug: "indian" },
  { name: "Chinese", slug: "chinese" },
  { name: "Continental", slug: "continental" },
  { name: "Desserts", slug: "desserts" },
  { name: "Drinks", slug: "drinks" },
  { name: "Cafe", slug: "cafe" },
];

export function mergeFoodCuisines(rows = []) {
  const rowsBySlug = new Map(rows.map((row) => [row.slug, row]));

  return FOOD_CUISINES.map((cuisine, displayOrder) => ({
    ...cuisine,
    ...rowsBySlug.get(cuisine.slug),
    display_order: displayOrder,
  }));
}
