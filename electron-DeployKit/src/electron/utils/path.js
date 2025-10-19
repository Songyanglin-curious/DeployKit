export function formatPath(path) {
    return path.replace(/\\/g, '/').replace(/\/+$/, '').replace(/^\/+/, '/')
}