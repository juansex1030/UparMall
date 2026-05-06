export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Divide accented characters into base + accent
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove non-word characters (except -)
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}
