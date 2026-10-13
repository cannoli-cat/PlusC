import { courses } from '@/data/questions'
import { checkSingle } from '@/lib/checkAnswer'
import { readdirSync, readFileSync } from 'fs'

const errors: string[] = []
const seenIds = new Set<string>()
const SECTION_PATTERN = /^§\d+\.\d+\. .+/
const BOXED_TAG = '\\boxed{'

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

        if (!SECTION_PATTERN.test(q.section)) {
            errors.push(`[${course.id}] ${q.id}: invalid section "${q.section}"`)
        }

        if (q.type === 'free-response' && typeof q.answer === 'string') {
            const boxed = extractBoxed(q.solution)
            if (boxed && !checkSingle(boxed, q.answer)) {
                errors.push(`[${course.id}] ${q.id}: boxed solution "${boxed}" does not match answer "${q.answer}"`)
            }
        }

        if (q.type === 'multiple-choice') {
            if (!q.choices.map(c => c.label).includes(q.answer)) {
                errors.push(`[${course.id}] ${q.id}: answer "${q.answer}" not found in choices`)
            }
        }

        if (q.type === 'select-all') {
            if (q.answers.length === 0) {
                errors.push(`[${course.id}] ${q.id}: no answers provided`)
            }

            const choiceLabels = q.choices.map(c => c.label)

            for (const answer of q.answers) {
                if (!choiceLabels.includes(answer)) {
                    errors.push(`[${course.id}] ${q.id}: answer "${answer}" not found in choices`)
                }
            }
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

function extractBoxed(solution: string): string | null {
    const start = solution.lastIndexOf(BOXED_TAG)
    if (start === -1) return null

    let depth = 1
    const end = start + 7

    for (let i = end; i < solution.length; i++) {
        if (solution[i] === '{') {
            depth++
        } else if (solution[i] === '}') {
            depth--
            if (depth === 0) {
                return solution.substring(start + 7, i)
            }
        }
    }

    return null
}
