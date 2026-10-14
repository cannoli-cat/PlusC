import type { Question } from '@/data/questions'
import { checkSingle } from '@/lib/checkAnswer'

const SECTION_PATTERN = /^§\d+\.\d+\. .+/
const BOXED_TAG = '\\boxed{'
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u

export function validateQuestion(q: Question): string[] {
    const problems: string[] = []

    if (!SECTION_PATTERN.test(q.section)) {
        problems.push(`invalid section "${q.section}"`)
    }

    if (!q.text.trim()) {
        problems.push('question text is empty')
    }

    if (EMOJI_PATTERN.test(JSON.stringify(q))) {
        problems.push('contains an emoji')
    }

    if (q.type === 'multiple-choice' || q.type === 'select-all') {
        const labels = q.choices.map(c => c.label)

        if (q.choices.length < 2) {
            problems.push(`only ${q.choices.length} choice(s)`)
        }
        if (new Set(labels).size !== labels.length) {
            problems.push('two choices share the same label')
        }
        if (new Set(q.choices.map(c => c.text.trim())).size !== q.choices.length) {
            problems.push('two choices have the same text')
        }

        if (q.type === 'multiple-choice' && !labels.includes(q.answer)) {
            problems.push(`answer "${q.answer}" not found in choices`)
        }

        if (q.type === 'select-all') {
            if (q.answers.length === 0) {
                problems.push('no answers provided')
            }
            for (const answer of q.answers) {
                if (!labels.includes(answer)) {
                    problems.push(`answer "${answer}" not found in choices`)
                }
            }
        }
    }

    if (q.type === 'free-response' && Array.isArray(q.answer)) {
        const labels = q.answer.map(part => part.label.trim())

        if (q.answer.length < 2) {
            problems.push('multi-part answer has fewer than 2 parts')
        }
        if (labels.some(label => !label)) {
            problems.push('a multi-part answer has an empty label')
        }
        if (new Set(labels).size !== labels.length) {
            problems.push('two parts share the same label')
        }
        if (labels.some(label => label.includes('$') || label.includes('\\'))) {
            problems.push('a part label contains LaTeX')
        }
        if (q.answer.some(part => !part.value.trim())) {
            problems.push('a part has an empty answer')
        }
    }

    if (q.type === 'free-response' && typeof q.answer === 'string') {
        if (q.solution.includes(BOXED_TAG)) {
            const boxed = extractBoxed(q.solution)
            if (boxed === null) {
                problems.push('\\boxed{ in the solution is never closed')
            } else if (!checkSingle(boxed, q.answer)) {
                problems.push(`boxed solution "${boxed}" does not match answer "${q.answer}"`)
            }
        }
    }

    return problems
}

export function extractBoxed(solution: string): string | null {
    const start = solution.lastIndexOf(BOXED_TAG)
    if (start === -1) return null

    const contentStart = start + BOXED_TAG.length
    let depth = 1

    for (let i = contentStart; i < solution.length; i++) {
        if (solution[i] === '{') {
            depth++
        } else if (solution[i] === '}') {
            depth--
            if (depth === 0) {
                return solution.substring(contentStart, i)
            }
        }
    }

    return null
}
