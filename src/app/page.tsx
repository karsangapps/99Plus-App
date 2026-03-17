/**
 * Root page — middleware handles the redirect:
 * logged-out → /signup | logged-in → /command-center
 */
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/signup')
}
