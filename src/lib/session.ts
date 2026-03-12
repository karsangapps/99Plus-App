import { cookies } from 'next/headers'

const UID_COOKIE = 'uid'

export async function getUidFromCookies() {
  const store = await cookies()
  const c = store.get(UID_COOKIE)
  return c?.value || null
}

export function uidCookieName() {
  return UID_COOKIE
}

