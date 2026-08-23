import 'server-only'

import type { QueryParams } from 'next-sanity'
import { client } from './client'

type FetchOptions<Q extends string> = {
  query: Q
  params?: QueryParams
  tags?: string[]
  revalidate?: number | false
}

export async function sanityFetch<Q extends string>({
  query,
  params = {},
  tags = [],
  revalidate,
}: FetchOptions<Q>) {
  const nextOptions = {
    revalidate: revalidate !== undefined ? revalidate : tags.length > 0 ? false : 3600,
    ...(tags.length > 0 ? { tags } : {}),
  }
  return client.fetch(query, params, { next: nextOptions })
}
