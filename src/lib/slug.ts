/** Lower-case, collapse non-alphanumeric runs to `_`, trim leading/trailing `_`. */
export function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
}
