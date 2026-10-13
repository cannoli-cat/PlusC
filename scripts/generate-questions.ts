// generates practice questions for one section, verifies them, and writes them to drafts/.
//
// npm run generate -- --course 267 --section 10.2 --count 5
// npm run generate -- --course 267 --section 10.2 --count 5 --dry-run
//
// nothing goes into data/ automatically. review drafts/<course>/<file>.json,
// then move the good questions into data/<course>/ and add the import.

import Anthropic from '@anthropic-ai/sdk'
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { courses, type Question } from '@/data/questions'
import { validateQuestion } from '@/lib/validateQuestion'
import { checkSingle } from '@/lib/checkAnswer'
import { findSection, type SectionSpec } from './generate/sections'

const MODEL = 'claude-opus-5-5'
const MAX_TOKENS = 16000

const client = new Anthropic()

const Choice = z.object({ label: z.string(), text: z.string() })

const GeneratedQuestion = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('multiple-choice'),
        text: z.string(),
        choices: z.array(Choice),
        answer: z.string(),
        solution: z.string(),
    }),
    z.object({
        type: z.literal('select-all'),
        text: z.string(),
        choices: z.array(Choice),
        answers: z.array(z.string()),
        solution: z.string(),
    }),
    z.object({
        type: z.literal('free-response'),
        text: z.string(),
        answer: z.string(),
        solution: z.string(),
    }),
])

const GeneratedBatch = z.object({ questions: z.array(GeneratedQuestion) })

const VerifierAnswer = z.object({
    answer: z.string(),
    answers: z.array(z.string()),
})

const GENERATOR_SYSTEM = `You write practice questions for a university calculus study tool. Students answer them under timed conditions, and their answers are graded automatically, so every question needs exactly one correct, checkable answer.

Write all math in LaTeX: inline $...$ and display $$...$$. Plain text only otherwise: no emoji, no decorative symbols, no markdown headings.

Question types:
- multiple-choice: 4 choices labeled A-D, exactly one correct. Each wrong choice should come from a specific, realistic mistake (sign error, forgetting to normalize, mixing up dot and cross product), not a random value.
- select-all: 4 choices labeled A-D, one or more correct.
- free-response: the answer is graded by a symbolic checker that only understands a single scalar expression. Put that expression in "answer" as LaTeX (for example "\\frac{3\\sqrt{2}}{2}" or "2\\pi"), with no units, no "x =", and no vectors, points, intervals, or equations. If the natural answer to a question is a vector, point, or equation, make it multiple-choice or ask for a scalar quantity instead (a magnitude, one component, a distance).

Every solution is a complete step-by-step worked solution in LaTeX. Free-response solutions must end with the final answer inside \\boxed{...}, and the boxed content must equal "answer".

Aim for roughly half multiple-choice, a third free-response, and the rest select-all. Vary the numbers, setups, and difficulty; include a few applied problems where the topic supports them.`

function generatorPrompt(section: SectionSpec, count: number, existingTexts: string[]): string {
    const avoid = existingTexts.length > 0
        ? `\n\nThese questions already exist for this section. Do not repeat their setups:\n${existingTexts.map(t => `- ${t}`).join('\n')}`
        : ''

    return `Write ${count} questions for ${section.label}.

Topics for this section:
${section.topics}${avoid}`
}

const VERIFIER_SYSTEM = `You are checking a calculus practice question by solving it yourself. Work it out carefully from scratch.

- multiple-choice: put the single correct label in "answer" and leave "answers" empty.
- select-all: put every correct label in "answers" and leave "answer" empty.
- free-response: put the final answer as a single LaTeX expression in "answer" (no units, no "x =") and leave "answers" empty.

If the question is ambiguous or has no correct answer among the choices, put "INVALID" in "answer".`

function verifierPrompt(q: z.infer<typeof GeneratedQuestion>): string {
    const choices = q.type === 'free-response'
        ? ''
        : '\n\nChoices:\n' + q.choices.map(c => `${c.label}. ${c.text}`).join('\n')

    return `Question type: ${q.type}\n\n${q.text}${choices}`
}


async function askStructured<T extends z.ZodType>(system: string, prompt: string, schema: T): Promise<z.infer<T>> {
    const response = await client.beta.messages.parse({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {
            effort: 'high',
            format: betaZodOutputFormat(schema),
        },
        system,
        messages: [{ role: 'user', content: prompt }],
    })

    if (response.stop_reason === 'refusal') {
        throw new Error(`model declined: ${response.stop_details?.explanation ?? 'no explanation'}`)
    }
    if (response.stop_reason === 'max_tokens') {
        throw new Error(`hit max_tokens (${MAX_TOKENS}); try a smaller --count`)
    }
    if (!response.parsed_output) {
        throw new Error('response did not match the schema')
    }
    return response.parsed_output as z.infer<T>
}

async function verify(q: z.infer<typeof GeneratedQuestion>): Promise<string | null> {
    const result = await askStructured(VERIFIER_SYSTEM, verifierPrompt(q), VerifierAnswer)

    if (result.answer.trim() === 'INVALID') {
        return 'verifier says the question is ambiguous or has no correct answer'
    }

    if (q.type === 'multiple-choice') {
        return result.answer.trim() === q.answer.trim()
            ? null
            : `verifier chose ${result.answer}, generator said ${q.answer}`
    }

    if (q.type === 'select-all') {
        const mine = [...q.answers].sort().join(',')
        const theirs = [...result.answers].map(a => a.trim()).sort().join(',')
        return mine === theirs ? null : `verifier chose [${theirs}], generator said [${mine}]`
    }

    return checkSingle(result.answer, q.answer)
        ? null
        : `verifier got "${result.answer}", generator said "${q.answer}"`
}

function sectionFileName(label: string): string {
    const match = label.match(/^§(\d+\.\d+)\. (.+)$/)
    if (!match) throw new Error(`bad section label "${label}"`)
    const slug = match[2].toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return `${match[1]}-${slug}`
}

function readJsonArray<T>(path: string): T[] {
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : []
}

function writeJsonArray(path: string, items: unknown[]) {
    writeFileSync(path, JSON.stringify(items, null, 2) + '\n', 'utf-8')
}

function getFlag(name: string): string | undefined {
    const i = process.argv.indexOf(`--${name}`)
    return i === -1 ? undefined : process.argv[i + 1]
}

async function main() {
    const courseId = getFlag('course')
    const sectionId = getFlag('section')
    const count = Number(getFlag('count') ?? 5)
    const dryRun = process.argv.includes('--dry-run')

    if (!courseId || !sectionId) {
        console.error('Usage: npm run generate -- --course 267 --section 10.2 [--count 5] [--dry-run]')
        process.exit(1)
    }

    const section = findSection(courseId, sectionId)
    if (!section) {
        console.error(`No section ${sectionId} for course ${courseId} in scripts/generate/sections.ts`)
        process.exit(1)
    }

    const fileName = sectionFileName(section.label)
    const draftDir = `drafts/${courseId}`
    const draftPath = `${draftDir}/${fileName}.json`
    const rejectedPath = `${draftDir}/${fileName}.rejected.json`

    const bankQuestions = courses.flatMap(c => c.questions)
    const drafts = readJsonArray<Question>(draftPath)
    const existing = [...bankQuestions.filter(q => q.section === section.label), ...drafts]
    const takenIds = new Set([...bankQuestions, ...drafts].map(q => q.id))

    const idPrefix = `${courseId}-${sectionId}-`
    let nextNumber = 1
    const newId = () => {
        while (takenIds.has(idPrefix + nextNumber)) nextNumber++
        takenIds.add(idPrefix + nextNumber)
        return idPrefix + nextNumber
    }

    console.log(`Generating ${count} questions for ${section.label} with ${MODEL}...`)
    const batch = await askStructured(
        GENERATOR_SYSTEM,
        generatorPrompt(section, count, existing.map(q => q.text)),
        GeneratedBatch,
    )
    console.log(`  got ${batch.questions.length}, verifying...`)

    const accepted: Question[] = []
    const rejected: (Question & { reasons: string[] })[] = []

    await Promise.all(batch.questions.map(async (generated) => {
        const question = { id: newId(), section: section.label, ...generated } as Question

        const reasons = validateQuestion(question)
        if (reasons.length === 0) {
            try {
                const disagreement = await verify(generated)
                if (disagreement) reasons.push(disagreement)
            } catch (e) {
                reasons.push(`verifier failed: ${(e as Error).message}`)
            }
        }

        if (reasons.length === 0) {
            accepted.push(question)
        } else {
            rejected.push({ ...question, reasons })
        }
    }))

    const byId = (a: Question, b: Question) => a.id.localeCompare(b.id, undefined, { numeric: true })
    accepted.sort(byId)
    rejected.sort(byId)

    for (const q of accepted) console.log(`  ✓ ${q.id} (${q.type})`)
    for (const q of rejected) console.log(`  ✗ ${q.id} (${q.type}): ${q.reasons.join('; ')}`)

    if (dryRun) {
        console.log('\n--dry-run: nothing written.')
        console.log(JSON.stringify({ accepted, rejected }, null, 2))
        return
    }

    mkdirSync(draftDir, { recursive: true })
    if (accepted.length > 0) {
        writeJsonArray(draftPath, [...drafts, ...accepted])
    }
    if (rejected.length > 0) {
        writeJsonArray(rejectedPath, [...readJsonArray(rejectedPath), ...rejected])
    }

    console.log(`\n${accepted.length} accepted → ${draftPath}`)
    if (rejected.length > 0) console.log(`${rejected.length} rejected → ${rejectedPath}`)
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
