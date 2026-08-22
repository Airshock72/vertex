import 'server-only'

if (!process.env.SANITY_API_READ_TOKEN) {
  throw new Error('Missing environment variable: SANITY_API_READ_TOKEN')
}

export const serverToken: string = process.env.SANITY_API_READ_TOKEN
