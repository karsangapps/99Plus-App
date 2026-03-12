'use client'

type Props = {
  onError: (message: string) => void
}

export function SignupOAuthBlock({ onError }: Props) {
  return (
    <>
      <div>
        <button
          type="button"
          onClick={async () => {
            try {
              const { createClient } = await import('@insforge/sdk')
              const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL
              const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY
              if (!baseUrl || !anonKey) {
                onError('Google sign-in is not configured yet. Please use email signup.')
                return
              }
              const insforge = createClient({ baseUrl, anonKey })
              const { data, error } = await insforge.auth.signInWithOAuth({
                provider: 'google',
                skipBrowserRedirect: true
              })
              if (error || !data?.url) {
                onError(error?.message || 'Google sign-in failed.')
                return
              }
              window.location.href = data.url
            } catch (e) {
              onError(e instanceof Error ? e.message : 'Google sign-in is unavailable.')
            }
          }}
          className="w-full h-11 rounded-xl border border-[#E5E7EB] bg-white text-[#0F172A] text-sm font-semibold flex items-center justify-center gap-3 hover:border-[#C7D2FE] hover:bg-[#F8FAFF] transition-colors"
        >
          Continue with Google
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span className="text-xs font-medium text-[#9CA3AF]">or sign up with email</span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>
    </>
  )
}

