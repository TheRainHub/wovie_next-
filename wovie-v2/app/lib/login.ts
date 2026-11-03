/** The login form, coming back to `returnTo` afterwards. */
export function loginHref(returnTo?: string | null) {
  const params = new URLSearchParams({ view: 'login' })
  const target = safeReturnPath(returnTo)
  if (target !== '/movies') params.set('callbackUrl', target)
  return `/?${params}`
}

/**
 * Only same-site paths are followed after login; anything else, and the
 * landing page itself, goes to the catalogue.
 */
export function safeReturnPath(value?: string | null) {
  const isLocalPath = Boolean(value) && value!.startsWith('/') && !value!.startsWith('//') && !value!.startsWith('/\\')
  return isLocalPath && value !== '/' ? value! : '/movies'
}
