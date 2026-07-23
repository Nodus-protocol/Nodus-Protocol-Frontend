import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://nodusprotocol.io"

const routes = [
  { url: "/",                   changeFrequency: "monthly" as const, priority: 1.0 },
  { url: "/protocol",           changeFrequency: "monthly" as const, priority: 0.9 },
  { url: "/docs",               changeFrequency: "weekly"  as const, priority: 0.8 },
  { url: "/community",          changeFrequency: "weekly"  as const, priority: 0.7 },
  { url: "/blog",               changeFrequency: "weekly"  as const, priority: 0.7 },
  { url: "/swap",               changeFrequency: "monthly" as const, priority: 0.9 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
