const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
const stripped = raw.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "")
export const API_BASE = `${stripped}/api/v1`
