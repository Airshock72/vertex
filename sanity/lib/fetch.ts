import 'server-only'

import type { QueryParams } from 'next-sanity'
import { client } from './client'

type FetchOptions = {
  query: string
  params?: QueryParams
  tags?: string[]
  revalidate?: number | false
}

export async function sanityFetch<T = unknown>({
  query,
  params = {},
  tags = [],
  revalidate,
}: FetchOptions): Promise<T> {
  const nextOptions = {
    revalidate: revalidate !== undefined ? revalidate : tags.length > 0 ? false : 3600,
    ...(tags.length > 0 ? { tags } : {}),
  }
  return client.fetch<T>(query, params, { next: nextOptions })
}
