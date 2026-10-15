// React Router adds its basename to Link destinations; plain URLs need it here.
export function sitePath(path: string): string {
  return path.startsWith('/') && !path.startsWith('//')
    ? import.meta.env.BASE_URL + path.slice(1)
    : path;
}
