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
    z.object({
        type: z.literal('multi-part'),
        text: z.string(),
        parts: z.array(z.object({ label: z.string(), value: z.string() })),
        solution: z.string(),
    }),
])

type Generated = z.infer<typeof GeneratedQuestion>

const GeneratedBatch = z.object({ questions: z.array(GeneratedQuestion) })

const VerifierAnswer = z.object({
    answer: z.string(),
    answers: z.array(z.string()),
    parts: z.array(z.string()),
})

const GENERATOR_SYSTEM = `You write practice questions for a university calculus study tool. Students answer them under timed conditions, and their answers are graded automatically, so every question needs exactly one correct, checkable answer.

Write all math in LaTeX: inline $...$ and display $$...$$. Plain text only otherwise: no emoji, no decorative symbols, no markdown headings.

Question types:
- multiple-choice: 4 choices labeled A-D, exactly one correct. Each wrong choice should come from a specific, realistic mistake (sign error, forgetting to normalize, mixing up dot and cross product), not a random value.
- select-all: 4 choices labeled A-D, one or more correct.
- free-response: the answer is graded by a symbolic checker that only understands a single scalar expression. Put that expression in "answer" as LaTeX (for example "\\frac{3\\sqrt{2}}{2}" or "2\\pi"), with no units, no "x =", and no vectors, points, intervals, or equations.
- multi-part: for answers made of several numbers, such as a point, a vector's components, or a sphere's center and radius. Give 2 to 4 parts, each with a short plain-text label (no LaTeX, no $), for example "x:", "y:", "z:", or "Center x:", "Center y:", "Center z:", "Radius:". Each part's "value" follows the same rules as a free-response answer: a single scalar LaTeX expression. Say in the question text what each blank is for.

If the natural answer is an equation (a sphere, a plane), make it multiple-choice.

Every solution is a complete step-by-step worked solution in LaTeX. Free-response solutions must end with the final answer inside \\boxed{...}, and the boxed content must equal "answer". Multi-part solutions end by stating every part's value.

Aim for roughly 40% multiple-choice, 25% free-response, 20% multi-part, and 15% select-all. Vary which letter is correct in multiple-choice questions. Vary the numbers, setups, contexts, and difficulty; include a few applied problems where the topic supports them.`

const QUESTION_TYPES = ['multiple-choice', 'select-all', 'free-response', 'multi-part'] as const
type GeneratedType = (typeof QUESTION_TYPES)[number]

function generatorPrompt(section: SectionSpec, count: number, existingTexts: string[], onlyType?: GeneratedType): string {
    const avoid = existingTexts.length > 0
        ? `\n\nThese questions already exist for this section. Do not repeat their setups:\n${existingTexts.map(t => `- ${t}`).join('\n')}`
        : ''
    const typeRule = onlyType
        ? ` Every question must be of type "${onlyType}"; ignore the usual mix of types.`
        : ''

    return `Write ${count} questions for ${section.label}.${typeRule}

Topics for this section:
${section.topics}${avoid}`
}

const VERIFIER_SYSTEM = `You are checking a calculus practice question by solving it yourself. Work it out carefully from scratch.

- multiple-choice: put the single correct label in "answer" and leave "answers" empty.
- select-all: put every correct label in "answers" and leave "answer" empty.
- free-response: put the final answer as a single LaTeX expression in "answer" (no units, no "x =") and leave "answers" empty.
- multi-part: put one LaTeX expression per blank in "parts", in the order the blanks are listed. Leave "answer" empty unless the question is invalid.

Leave "parts" empty for every type except multi-part.

If the question is ambiguous or has no correct answer among the choices, put "INVALID" in "answer".`

function verifierPrompt(q: Generated): string {
    let extra = ''
    if (q.type === 'multiple-choice' || q.type === 'select-all') {
        extra = '\n\nChoices:\n' + q.choices.map(c => `${c.label}. ${c.text}`).join('\n')
    } else if (q.type === 'multi-part') {
        extra = '\n\nBlanks:\n' + q.parts.map(p => `- ${p.label}`).join('\n')
    }

    return `Question type: ${q.type}\n\n${q.text}${extra}`
}


interface CallSettings {
    model: string
    effort: 'low' | 'medium' | 'high'
    timeoutMs: number
    name: string
}

const GENERATOR_CALL: CallSettings = { model: 'claude-sonnet-5-5', effort: 'high', timeoutMs: 6 * 60_000, name: 'generator' }
const VERIFIER_CALL: CallSettings = { model: 'claude-opus-5-5', effort: 'medium', timeoutMs: 3 * 60_000, name: 'verifier' }

async function askStructured<T extends z.ZodType>(system: string, prompt: string, schema: T, settings: CallSettings): Promise<z.infer<T>> {
    const response = await client.beta.messages.parse({
        model: settings.model,
        max_tokens: MAX_TOKENS,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {
            effort: settings.effort,
            format: betaZodOutputFormat(schema),
        },
        system,
        messages: [{ role: 'user', content: prompt }],
    }, { timeout: settings.timeoutMs })

    if (response.stop_reason === 'refusal') {
        throw new Error(`${settings.name} declined: ${response.stop_details?.explanation ?? 'no explanation'}`)
    }
    if (response.stop_reason === 'max_tokens') {
        const hint = settings === GENERATOR_CALL ? '; try a smaller --count' : ''
        throw new Error(`${settings.name} hit max_tokens (${MAX_TOKENS})${hint}`)
    }
    if (!response.parsed_output) {
        throw new Error('response did not match the schema')
    }
    return response.parsed_output as z.infer<T>
}

async function verify(q: Generated): Promise<string | null> {
    const result = await askStructured(VERIFIER_SYSTEM, verifierPrompt(q), VerifierAnswer, VERIFIER_CALL)

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

    if (q.type === 'multi-part') {
        if (result.parts.length !== q.parts.length) {
            return `verifier gave ${result.parts.length} parts, question has ${q.parts.length}`
        }
        const mismatches = q.parts
            .map((part, i) => checkSingle(result.parts[i], part.value)
                ? null
                : `${part.label} verifier got "${result.parts[i]}", generator said "${part.value}"`)
            .filter(m => m !== null)
        return mismatches.length === 0 ? null : mismatches.join('; ')
    }

    return checkSingle(result.answer, q.answer)
        ? null
        : `verifier got "${result.answer}", generator said "${q.answer}"`
}

async function verifyWithRetry(q: Generated): Promise<string | null> {
    let lastError = ''
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            return await verify(q)
        } catch (e) {
            lastError = (e as Error).message
        }
    }
    return `verifier failed twice: ${lastError}`
}

function toQuestion(generated: Generated, id: string, section: string): Question {
    if (generated.type === 'multi-part') {
        const { parts, ...rest } = generated
        return { id, section, ...rest, type: 'free-response', answer: parts }
    }
    return { id, section, ...generated }
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
    const typeFlag = getFlag('type')

    if (!courseId || !sectionId) {
        console.error(`Usage: npm run generate -- --course 267 --section 10.2 [--count 5] [--type ${QUESTION_TYPES.join('|')}] [--dry-run]`)
        process.exit(1)
    }

    if (typeFlag !== undefined && !(QUESTION_TYPES as readonly string[]).includes(typeFlag)) {
        console.error(`Unknown --type "${typeFlag}". Use one of: ${QUESTION_TYPES.join(', ')}`)
        process.exit(1)
    }
    const onlyType = typeFlag as GeneratedType | undefined

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

    const typeNote = onlyType ? ` ${onlyType}` : ''
    console.log(`Generating ${count}${typeNote} questions for ${section.label} (generator: ${GENERATOR_CALL.model}, verifier: ${VERIFIER_CALL.model})...`)
    const batch = await askStructured(
        GENERATOR_SYSTEM,
        generatorPrompt(section, count, existing.map(q => q.text), onlyType),
        GeneratedBatch,
        GENERATOR_CALL,
    )
    console.log(`  got ${batch.questions.length}, verifying...`)

    const accepted: Question[] = []
    const rejected: (Question & { reasons: string[] })[] = []

    await Promise.all(batch.questions.map(async (generated) => {
        const question = toQuestion(generated, newId(), section.label)
        const kind = generated.type

        const reasons = validateQuestion(question)
        if (onlyType && generated.type !== onlyType) {
            reasons.push(`asked for ${onlyType}, got ${generated.type}`)
        }
        if (reasons.length === 0) {
            const disagreement = await verifyWithRetry(generated)
            if (disagreement) reasons.push(disagreement)
        }

        if (reasons.length === 0) {
            accepted.push(question)
            console.log(`  ✓ ${question.id} (${kind})`)
        } else {
            rejected.push({ ...question, reasons })
            console.log(`  ✗ ${question.id} (${kind}): ${reasons.join('; ')}`)
        }
    }))

    const byId = (a: Question, b: Question) => a.id.localeCompare(b.id, undefined, { numeric: true })
    accepted.sort(byId)
    rejected.sort(byId)

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
