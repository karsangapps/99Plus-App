'use client'

import { AuthTwoColumnLayout } from '@/components/auth/AuthTwoColumnLayout'
import { SignupLeftPanel } from '@/components/signup/SignupLeftPanel'
import { SignupForm } from '@/components/signup/SignupForm'

export default function SignupPage() {
  return <AuthTwoColumnLayout left={<SignupLeftPanel />} right={<SignupForm />} />
}
