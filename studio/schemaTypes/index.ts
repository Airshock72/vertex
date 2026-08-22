import { course } from './documents/course'
import { instructor } from './documents/instructor'
import { category } from './documents/category'
import { lesson } from './documents/lesson'
import { blockContent } from './objects/blockContent'
import { learningOutcome } from './objects/learningOutcome'
import { module } from './objects/module'
import { resource } from './objects/resource'

export const schema = {
  types: [
    course,
    lesson,
    instructor,
    category,
    module,
    learningOutcome,
    resource,
    blockContent,
  ],
}
