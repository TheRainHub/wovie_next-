export const MAX_LIST_NAME = 60

/** A list name, trimmed; null when empty or too long. */
export function parseListName(value: unknown) {
  if (typeof value !== 'string') return null
  const name = value.trim().replace(/\s+/g, ' ')
  return name.length > 0 && name.length <= MAX_LIST_NAME ? name : null
}
