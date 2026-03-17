/**
 * /nta-test — base redirect to pre-test setup.
 * The real engine lives at /nta-test/[attemptId].
 */
import { redirect } from 'next/navigation'

export default function NtaTestBasePage() {
  redirect('/pre-test')
}
