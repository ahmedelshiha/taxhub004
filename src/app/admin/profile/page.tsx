import ProfileManagementPanel from '@/components/admin/profile/ProfileManagementPanel'

type PagePropsWithSearchParams = {
  searchParams?: Promise<Record<string, string | string[]>>
}

export default async function AdminProfilePage({ searchParams }: PagePropsWithSearchParams) {
  // Normalize searchParams which may be a Promise in Next's routing
  const resolvedSearchParams = (await Promise.resolve(searchParams)) as Record<string, string | string[]> | undefined
  const tabParam = String(resolvedSearchParams?.tab ?? '').toLowerCase()
  const allowed = ['profile', 'security', 'booking', 'localization', 'notifications'] as const
  const isAllowed = (allowed as readonly string[]).includes(tabParam)
  const defaultTab = (isAllowed ? (tabParam as typeof allowed[number]) : 'profile')
  return (
    <ProfileManagementPanel isOpen={true} defaultTab={defaultTab} inline fullPage />
  )
}
