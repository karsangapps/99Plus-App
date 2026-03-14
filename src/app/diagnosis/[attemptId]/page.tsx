import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getDiagnosisAction } from './actions'
import { DiagnosisShell } from '@/components/diagnosis/DiagnosisShell'
import DiagnosisLoading from './loading'

interface PageProps {
  params: Promise<{ attemptId: string }>
}

export const dynamic = 'force-dynamic'

export default async function DiagnosisPage({ params }: PageProps) {
  const { attemptId } = await params

  let payload
  try {
    payload = await getDiagnosisAction(attemptId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('not found') || msg.includes('access denied')) {
      notFound()
    }
    throw err
  }

  return (
    <Suspense fallback={<DiagnosisLoading />}>
      <DiagnosisShell payload={payload} />
    </Suspense>
  )
}
