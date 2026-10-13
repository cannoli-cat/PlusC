'use client'

import { useState, useRef, useEffect } from 'react'
import MathText from './MathText'
import type { FreeResponseQuestion as FreeResponseQuestionType, FreeResponseAnswer } from '@/data/questions'
import styles from './FreeResponseQuestion.module.css'
import { checkSingle } from '@/lib/checkAnswer'

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

            {reviewMode && isMulti && savedInput && showSolution && (() => {
                let inputs: string[] = []
                try { inputs = JSON.parse(savedInput) } catch { /* empty */ }
                return (
                    <div className={styles.inputArea}>
                        <div className={styles.savedAnswer}>
                            <span className={styles.previewLabel}>Your answer:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {(question.answer as FreeResponseAnswer[]).map((field, i) => {
                                    const val = inputs[i] ?? ''
                                    const correct = val.trim() ? checkSingle(val, field.value) : null
                                    const color = correct === true ? 'var(--green)' : correct === false ? 'var(--red)' : undefined
                                    return (
                                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.85rem', color: 'var(--text-dim)', minWidth: '80px' }}>
                                                {field.label}
                                            </span>
                                            <span style={{ color }}>
                                                <MathText text={`$$${val}$$`} />
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            })()}
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
                savedInput && !(isMulti && showSolution) && (
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