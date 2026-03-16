// © 2026 Mountain Jewels LLC. All rights reserved.

const SCRAPER_URL = process.env.NEXT_PUBLIC_SCRAPER_API_URL?.replace(/\/$/, '') ?? ''

export async function scraperFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${SCRAPER_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`Scraper API error: ${res.status} ${res.statusText}`)
  return res.json()
}
