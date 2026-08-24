import { defineArrayMember, defineField, defineType } from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  readOnly: true,
  description: 'Owned by the ingestion pipeline — do not edit manually.',
  fields: [
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Bunny', value: 'bunny' },
        ],
      },
    }),
    defineField({
      name: 'chapters',
      title: 'Chapters',
      type: 'array',
      of: [defineArrayMember({ type: 'videoChapter' })],
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript chunks',
      type: 'array',
      of: [defineArrayMember({ type: 'videoChunk' })],
    }),
    defineField({
      name: 'ingestedAt',
      title: 'Ingested at',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      videoId: 'videoId',
      chapters: 'chapters',
      chunks: 'chunks',
    },
    prepare({ videoId, chapters, chunks }) {
      const chapCount = Array.isArray(chapters) ? chapters.length : 0
      const chunkCount = Array.isArray(chunks) ? chunks.length : 0
      return {
        title: videoId ?? 'Unknown',
        subtitle: `${chapCount} chapters · ${chunkCount} chunks`,
      }
    },
  },
})
