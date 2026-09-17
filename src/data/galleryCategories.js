export const GALLERY_CATEGORIES = ["Sports", "Visitations", "MDD", "Campus Updates"];
export const DEFAULT_GALLERY_CATEGORY = "Campus Updates";

export const normalizeGalleryCategory = (value) => {
  if (!value) return DEFAULT_GALLERY_CATEGORY;
  const match = GALLERY_CATEGORIES.find(
    (category) => category.toLowerCase() === value.trim().toLowerCase()
  );
  return match || DEFAULT_GALLERY_CATEGORY;
};

export const groupGalleryByCategory = (items) => {
  const buckets = new Map(GALLERY_CATEGORIES.map((category) => [category, []]));

  items.forEach((item) => {
    const category = normalizeGalleryCategory(item?.category);
    buckets.get(category).push(item);
  });

  return GALLERY_CATEGORIES.map((category) => ({
    category,
    items: buckets.get(category),
  }));
};
