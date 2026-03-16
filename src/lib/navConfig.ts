/**
 * Shared nav config for OnboardingSidebar and MobileNavDrawer.
 * Single source of truth for student app navigation.
 */

export type NavItem = {
  label: string
  href: string
  /** SVG icon identifier for consistent styling */
  icon: 'compass' | 'clipboard' | 'rectangle-list' | 'file-lines' | 'circle-dot' | 'chart-bar' | 'building' | 'pen' | 'store'
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Command Center', href: '/command-center', icon: 'compass' },
  { label: 'Pre-Test', href: '/pre-test', icon: 'clipboard' },
  { label: 'NTA Test', href: '/nta-test', icon: 'rectangle-list' },
  { label: 'Diagnosis', href: '/diagnosis', icon: 'file-lines' },
  { label: 'Surgical Drill', href: '/surgical-drill', icon: 'circle-dot' },
  { label: 'Analytics', href: '/analytics', icon: 'chart-bar' },
  { label: 'Selection Hub', href: '/selection-hub', icon: 'building' },
  { label: 'Settings', href: '/settings', icon: 'pen' },
]

export const STORE_NAV_ITEM: NavItem = {
  label: '99Plus Store',
  href: '/store',
  icon: 'store',
}
