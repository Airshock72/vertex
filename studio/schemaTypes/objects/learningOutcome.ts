import { defineField, defineType } from 'sanity'

const ICON_OPTIONS = [
  { title: '🎯 Target', value: '🎯' },
  { title: '⚡ Lightning', value: '⚡' },
  { title: '🔧 Wrench', value: '🔧' },
  { title: '📦 Package', value: '📦' },
  { title: '🚀 Rocket', value: '🚀' },
  { title: '💡 Idea', value: '💡' },
  { title: '🛠️ Tools', value: '🛠️' },
  { title: '📊 Chart', value: '📊' },
  { title: '🔍 Search', value: '🔍' },
  { title: '✅ Check', value: '✅' },
  { title: '🔒 Lock', value: '🔒' },
  { title: '⚙️ Gear', value: '⚙️' },
]

export const learningOutcome = defineType({
  name: 'learningOutcome',
  title: 'Learning Outcome',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: { list: ICON_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required().max(200),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'icon' },
  },
})
