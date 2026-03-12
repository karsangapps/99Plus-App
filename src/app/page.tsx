import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-dvh p-6">
      <div className="space-y-3">
        <Link className="underline" href="/signup">
          Create your account
        </Link>
        <div>
          <Link className="underline" href="/onboarding">
            Go to Command Center
          </Link>
        </div>
      </div>
    </main>
  )
}

