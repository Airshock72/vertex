import { defineQuery } from 'groq'

export const COURSES_LIST_QUERY = defineQuery(`
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage { asset->, alt },
    level,
    price,
    popular,
    studentCount,
    "moduleCount": count(modules),
    "totalDuration": math::sum(modules[].lessons[]->duration),
    instructor->{ name, "slug": slug.current, photo { asset-> } },
    category->{ title, "slug": slug.current }
  }
`)

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] {
    "slug": slug.current
  }
`)

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage { asset->, alt },
    level,
    price,
    popular,
    studentCount,
    learningOutcomes[]{ _key, icon, title, description },
    instructor->{ _id, name, "slug": slug.current, photo { asset-> }, expertise },
    category->{ title, "slug": slug.current },
    modules[]{
      _key,
      title,
      summary,
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        duration,
        freePreview,
        studentCount,
        thumbnail { asset-> }
      }
    }
  }
`)

export const LESSON_SLUGS_QUERY = defineQuery(`
  *[_type == "lesson" && defined(slug.current)] {
    "slug": slug.current
  }
`)

export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    thumbnail { asset->, alt },
    duration,
    freePreview,
    studentCount,
    notes[],
    keyPoints,
    proTip,
    resources[]{ _key, type, title, description, url },
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      coverImage { asset->, alt },
      level,
      modules[]{
        _key,
        title,
        "durationSeconds": math::sum(lessons[]->duration),
        lessons[]->{
          _id,
          title,
          "slug": slug.current,
          duration,
          freePreview
        }
      }
    }
  }
`)

export const INSTRUCTORS_LIST_QUERY = defineQuery(`
  *[_type == "instructor"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    photo { asset-> },
    expertise
  }
`)

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo { asset->, alt },
    expertise,
    bio[],
    "courses": *[_type == "course" && references(^._id)] | order(_createdAt desc) {
      _id,
      title,
      "slug": slug.current,
      coverImage { asset-> },
      level,
      studentCount,
      summary
    }
  }
`)

export const CATEGORIES_LIST_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
`)

export const LESSONS_BY_IDS_QUERY = defineQuery(`
  *[_type == "lesson" && _id in $ids] {
    _id,
    _createdAt,
    title,
    "slug": slug.current,
    duration,
    keyPoints,
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      modules[]{
        _key,
        title,
        "lessonIds": lessons[]->._id
      }
    }
  }
`)
