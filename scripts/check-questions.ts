import { courses } from '@/data/questions'
import { validateQuestion } from '@/lib/validateQuestion'
import { readdirSync, readFileSync } from 'fs'

const errors: string[] = []
const seenIds = new Set<string>()

for (const course of courses) {
    const loadedIds = new Set(course.questions.map(q => q.id))

    for (const file of readdirSync(`data/${course.id}`)) {
        if (!file.endsWith('.json')) continue

        const fileQuestions = JSON.parse(readFileSync(`data/${course.id}/${file}`, 'utf-8'))

        if (fileQuestions.length > 0 && !loadedIds.has(fileQuestions[0].id)) {
            errors.push(`[${course.id}] ${file}: is not imported in data/${course.id}/index.ts`)
        }
    }
}

for (const course of courses) {
    for (const q of course.questions) {
        if (seenIds.has(q.id)) {
            errors.push(`[${course.id}] ${q.id}: duplicate id`)
        }
        seenIds.add(q.id)

        for (const problem of validateQuestion(q)) {
            errors.push(`[${course.id}] ${q.id}: ${problem}`)
        }
    }
}

if (errors.length > 0) {
    console.error(`${errors.length} error(s) found:`)
    for (const error of errors) {
        console.error(error)
    }

    process.exit(1)
} else {
    console.log(`All ${seenIds.size} questions OK`)
}
