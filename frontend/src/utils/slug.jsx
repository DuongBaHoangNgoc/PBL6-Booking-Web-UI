export function toSlug(s = '') {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
