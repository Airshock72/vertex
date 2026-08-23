import { BookIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const LEVELS = [
  { title: 'Beginner', value: 'beginner' },
  { title: 'Intermediate', value: 'intermediate' },
  { title: 'Advanced', value: 'advanced' },
]

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'Short marketing description shown in catalog cards (max 200 chars)',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: { list: LEVELS, layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      description: 'Set to 0 for free courses',
      type: 'number',
      initialValue: 0,
      validation: (rule) =>
        rule
          .required()
          .min(0)
          .custom((value) => {
            if (value === undefined || value === null) return true
            // parseFloat(toFixed(2)) recovers the same binary float for valid 2-decimal
            // values; a third decimal place produces a difference of at least 0.001,
            // well above the 1e-9 tolerance used here.
            return Math.abs(parseFloat(value.toFixed(2)) - value) < 1e-9
              ? true
              : 'Price cannot have more than two decimal places'
          }),
    }),
    defineField({
      name: 'popular',
      title: 'Popular',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Student count',
      description: 'Display only — updated externally',
      type: 'number',
      validation: (rule) => rule.min(0).integer(),
    }),
    defineField({
      name: 'learningOutcomes',
      title: 'Learning outcomes',
      description: 'What learners will take away (max 6)',
      type: 'array',
      of: [defineArrayMember({ type: 'learningOutcome' })],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'instructor',
      title: 'Instructor',
      type: 'reference',
      to: [{ type: 'instructor' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [defineArrayMember({ type: 'module' })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      instructor: 'instructor.name',
      media: 'coverImage',
      level: 'level',
    },
    prepare({ title, instructor, media, level }) {
      return {
        title,
        subtitle: [level, instructor].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
