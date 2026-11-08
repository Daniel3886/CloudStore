export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: Record<string, string>
}

export function extractErrorMessage(responseText: string, fallback: string): string {
  const text = responseText?.trim()
  if (!text) return fallback

  try {
    const body = JSON.parse(text) as ApiErrorBody
    return body.message || body.error || fallback
  } catch {
    return text
  }
}

export async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const text = await response.text().catch(() => "")
  return extractErrorMessage(text, fallback)
}
