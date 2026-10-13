import { courses } from '@/data/questions'

const errors: string[] = []
const seenIds = new Set<string>()
const SECTION_PATTERN = /^§\d+\.\d+\. .+/

for (const course of courses) {
    for (const q of course.questions) {
        if (seenIds.has(q.id)) {
            errors.push(`[${course.id}] ${q.id}: duplicate id`)
        }
        seenIds.add(q.id)

        if (!SECTION_PATTERN.test(q.section)) {
            errors.push(`[${course.id}] ${q.id}: invalid section "${q.section}"`)
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
