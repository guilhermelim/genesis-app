import { listMembersPage } from '@/infrastructure/member/member.actions'
import MembersPageClient from './members-page.client'

type MembersSearchParams = {
  page?: string | string[]
  pageSize?: string | string[]
}

const getPositiveInteger = (
  value: string | string[] | undefined,
  fallback: number,
  maximum = Number.MAX_SAFE_INTEGER,
) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback
}

export default async function MembersPage({ searchParams }: { searchParams: Promise<MembersSearchParams> }) {
  const params = await searchParams
  const page = getPositiveInteger(params.page, 1)
  const pageSize = getPositiveInteger(params.pageSize, 10, 100)

  return <MembersPageClient initialPage={await listMembersPage({ page, pageSize })} />
}
