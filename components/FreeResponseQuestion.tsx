'use client'

import { useState, useRef, useEffect } from 'react'
import MathText from './MathText'
import type { FreeResponseQuestion as FreeResponseQuestionType, FreeResponseAnswer } from '@/data/questions'
import styles from './FreeResponseQuestion.module.css'
import { ComputeEngine } from '@cortex-js/compute-engine'
import { parse as mathjsParse } from 'mathjs'

interface FreeResponseQuestionProps {
    question: FreeResponseQuestionType
    number: number
    onInput: (input: string) => void
    reviewMode?: boolean
    wasCorrect?: boolean
    showSolution?: boolean
    savedInput?: string
}

interface MathfieldEl extends HTMLElement {
    value: string
}

const ce = new ComputeEngine()
const INTERVAL_PATTERN = /^[\[\(].*,.*[\]\)]$/

function normalizeInterval(s: string): string {
    return s
        .replace(/\s+/g, '')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\lbrack/g, '[')
        .replace(/\\rbrack/g, ']')
        .replace(/\\infty|∞|infinity|inf/gi, 'inf')
        .replace(/\\-/g, '-')
        .toLowerCase()
}

function normalizeAsciiMath(expr: string): string {
    let s = expr

    s = s.replace(/\bln\b/g, 'log')
    s = s.replace(/\barcsin\b/g, 'asin')
    s = s.replace(/\barccos\b/g, 'acos')
    s = s.replace(/\barctan\b/g, 'atan')

    let result = ''
    let i = 0
    while (i < s.length) {
        if (s[i] === '|') {
            let j = i + 1
            while (j < s.length && s[j] !== '|') j++
            if (j < s.length) {
                result += `abs(${normalizeAsciiMath(s.slice(i + 1, j))})`
                i = j + 1
            } else {
                result += s[i]
                i++
            }
        } else {
            result += s[i]
            i++
        }
    }
    s = result

    s = s.replace(/\b(sin|cos|tan|sec|csc|cot|log|asin|acos|atan)\s*(abs\([^)]*\))/g, '$1($2)')
    s = s.replace(/(\d)(sin|cos|tan|sec|csc|cot|log|asin|acos|atan)\b/g, '$1*$2')

    s = s.replace(/\btan\^\(?-1\)?\(([^)]*)\)/g, 'atan($1)')
    s = s.replace(/\bsin\^\(?-1\)?\(([^)]*)\)/g, 'asin($1)')
    s = s.replace(/\bcos\^\(?-1\)?\(([^)]*)\)/g, 'acos($1)')

    s = s.replace(/\b(sin|cos|tan|sec|csc|cot|log|asin|acos|atan)\^(\([^)]+\)|-?\d+)\(([^)]*)\)/g, '($1($3))^$2')

    s = s.replace(/([a-dA-Df-zF-Z0-9])e\^/g, '$1*e^')

    return s
}

function asciiMathToLatex(ascii: string): string {
    try {
        return mathjsParse(normalizeAsciiMath(ascii)).toTex()
    } catch {
        return ascii
    }
}

function checkSingle(input: string, expected: string): boolean {
    if (INTERVAL_PATTERN.test(expected.trim())) {
        return normalizeInterval(input.trim()) === normalizeInterval(expected.trim())
    }
    const userExpr = ce.parse(input)
    const expectedExpr = ce.parse(asciiMathToLatex(expected))
    return userExpr.isEqual(expectedExpr) ?? false
}

export function checkAnswer(input: string, expected: string | FreeResponseAnswer[], variables: string[]): boolean {
    void variables
    try {
        if (Array.isArray(expected)) {
            let inputs: string[]
            try {
                inputs = JSON.parse(input)
            } catch {
                return false
            }
            return expected.every((field, i) => {
                const userInput = inputs[i] ?? ''
                if (!userInput.trim()) return false
                return checkSingle(userInput, field.value)
            })
        }
        return checkSingle(input, expected)
    } catch {
        return false
    }
}

function SingleField({ savedInput, onInput, mounted }: {
    savedInput?: string
    onInput: (val: string) => void
    mounted: boolean
}) {
    const mfRef = useRef<MathfieldEl>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        const mf = mfRef.current
        if (!mf || !mounted) return

        if (!initializedRef.current && savedInput) {
            mf.value = savedInput
            initializedRef.current = true
        }

        const handleInput = () => onInput(mf.value)
        mf.addEventListener('input', handleInput)
        return () => mf.removeEventListener('input', handleInput)
    }, [mounted, onInput, savedInput])

    if (!mounted) return <div style={{ height: '40px', width: '100%' }} />

    return (
        /* @ts-expect-error MathLive web component */
        <math-field
            ref={mfRef}
            style={{
                width: '100%',
                fontSize: '1.2rem',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
            }}
        >
            {/* @ts-expect-error MathLive web component */}
        </math-field>
    )
}

function MultiField({ fields, savedInput, onInput, mounted }: {
    fields: FreeResponseAnswer[]
    savedInput?: string
    onInput: (val: string) => void
    mounted: boolean
}) {
    const [, setValues] = useState<string[]>(() => {
        try {
            return savedInput ? JSON.parse(savedInput) : fields.map(() => '')
        } catch {
            return fields.map(() => '')
        }
    })

    const mfRefs = useRef<(MathfieldEl | null)[]>([])
    const initializedRef = useRef(false)

    useEffect(() => {
        if (!mounted) return

        fields.forEach((_, i) => {
            const mf = mfRefs.current[i]
            if (!mf) return

            if (!initializedRef.current && savedInput) {
                try {
                    const parsed = JSON.parse(savedInput)
                    if (parsed[i]) mf.value = parsed[i]
                } catch { /* empty */ }
            }

            const handleInput = () => {
                const next = mfRefs.current.map(mf => mf?.value ?? '')
                setValues(next)
                onInput(JSON.stringify(next))
            }

            mf.addEventListener('input', handleInput)
            return () => mf.removeEventListener('input', handleInput)
        })

        initializedRef.current = true
    }, [mounted, fields, savedInput, onInput])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {fields.map((field, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontSize: '0.85rem',
                        color: 'var(--text-dim)',
                        minWidth: '80px',
                        flexShrink: 0,
                    }}>
                        {field.label}
                    </span>
                    {mounted ? (
                        /* @ts-expect-error MathLive web component */
                        <math-field
                            ref={(el: MathfieldEl | null) => { mfRefs.current[i] = el }}
                            style={{
                                flex: 1,
                                fontSize: '1.2rem',
                                padding: '8px',
                                border: '1px solid var(--border)',
                                borderRadius: '2px',
                                backgroundColor: 'var(--bg)',
                                color: 'var(--text)',
                            }}
                        >
                            {/* @ts-expect-error MathLive web component */}
                        </math-field>
                    ) : (
                        <div style={{ height: '40px', flex: 1 }} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default function FreeResponseQuestion({ question, number, onInput, reviewMode, wasCorrect, showSolution, savedInput }: FreeResponseQuestionProps) {
    const [mounted, setMounted] = useState(false)

    const cardClass = wasCorrect === true ? styles.questionCorrect
        : wasCorrect === false ? styles.questionWrong
            : ''

    const isMulti = Array.isArray(question.answer)

    useEffect(() => {
        import('mathlive').then((ml) => {
            ml.MathfieldElement.fontsDirectory = '/mathlive-fonts/'
            setMounted(true)
        })
    }, [])

    return (
        <div className={`${styles.question} ${cardClass}`}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>

            {!reviewMode ? (
                <div className={styles.inputArea}>
                    {isMulti ? (
                        <MultiField
                            fields={question.answer as FreeResponseAnswer[]}
                            savedInput={savedInput}
                            onInput={onInput}
                            mounted={mounted}
                        />
                    ) : (
                        <SingleField
                            savedInput={savedInput}
                            onInput={onInput}
                            mounted={mounted}
                        />
                    )}
                </div>
            ) : (
                savedInput && (
                    <div className={styles.inputArea}>
                        <div className={styles.savedAnswer}>
                            <span className={styles.previewLabel}>Your answer:</span>
                            {isMulti ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {(question.answer as FreeResponseAnswer[]).map((field, i) => {
                                        let val = ''
                                        try { val = JSON.parse(savedInput)[i] ?? '' } catch { /* empty */ }
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.85rem', color: 'var(--text-dim)', minWidth: '80px' }}>
                                                    {field.label}
                                                </span>
                                                <MathText text={`$$${val}$$`} />
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <MathText text={`$$${savedInput}$$`} />
                            )}
                        </div>
                    </div>
                )
            )}

            {showSolution && (
                <div className={styles.solutionArea}>
                    <p className={styles.solutionLabel}>Solution:</p>
                    <MathText text={question.solution} />
                </div>
            )}
        </div>
    )
}