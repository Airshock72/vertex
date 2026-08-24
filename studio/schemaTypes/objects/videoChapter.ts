import { defineField, defineType } from 'sanity'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const videoChapter = defineType({
  name: 'videoChapter',
  title: 'Video chapter',
  type: 'object',
  fields: [
    defineField({
      name: 'startSeconds',
      title: 'Start (seconds)',
      type: 'number',
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { startSeconds: 'startSeconds', label: 'label' },
    prepare({ startSeconds, label }) {
      const ts = typeof startSeconds === 'number' ? formatTime(startSeconds) : '??:??'
      return { title: `${ts} — ${label ?? ''}` }
    },
  },
})
