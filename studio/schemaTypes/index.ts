import { course } from './documents/course'
import { instructor } from './documents/instructor'
import { category } from './documents/category'
import { lesson } from './documents/lesson'
import { video } from './documents/video'
import { blockContent } from './objects/blockContent'
import { learningOutcome } from './objects/learningOutcome'
import { module } from './objects/module'
import { resource } from './objects/resource'
import { videoChapter } from './objects/videoChapter'
import { videoChunk } from './objects/videoChunk'

export const schema = {
  types: [
    course,
    lesson,
    instructor,
    category,
    video,
    module,
    learningOutcome,
    resource,
    blockContent,
    videoChapter,
    videoChunk,
  ],
}
