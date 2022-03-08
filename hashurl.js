async function hash(str) {
    return (typeof require == "function" ? require("crypto").createHash('sha256').update(str).digest('hex') : Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)))).map(e => e.toString(16).padStart(2, "0")).join("")).toLowerCase();
}
module.exports=async function hashUrl(u) {
    let [match, hostname, path] = u.match(/^https:\/?\/?([^\/]+)([^#]*)/)
    hostname = hostname.replace(/\.+/g, ".").replace(/^\.+|\.+$/, "").toLowerCase()
    const normalizePath = s => s.replace(/\/\.(\/|$)/g, "$1").replace(/\/[^\/]+\/\.\.(\/|$)/g, "$1").replace(/\/+/g, "/").replace(/\/$/, "")
    while (path != normalizePath(path)) path = normalizePath(path)
    u = hostname + path
    while (u != decodeURIComponent(u)) u = decodeURIComponent(u)
    return await hash(u)
}
