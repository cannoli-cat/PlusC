'use client'

import { useState, useRef, useEffect } from 'react'
import MathText from './MathText'
import type { FreeResponseQuestion as FreeResponseQuestionType } from '@/data/questions'
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

/**
 * Normalize ascii-math (from the answer bank) so mathjs can parse it,
 * then convert to LaTeX so ComputeEngine can consume it.
 */
function normalizeAsciiMath(expr: string): string {
    let s = expr

    s = s.replace(/\bln\b/g, 'log')
    s = s.replace(/\barcsin\b/g, 'asin')
    s = s.replace(/\barccos\b/g, 'acos')
    s = s.replace(/\barctan\b/g, 'atan')

    // |x| → abs(x)
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

    // sin^-1(x) → asin(x), etc.
    s = s.replace(/\btan\^\(?-1\)?\(([^)]*)\)/g, 'atan($1)')
    s = s.replace(/\bsin\^\(?-1\)?\(([^)]*)\)/g, 'asin($1)')
    s = s.replace(/\bcos\^\(?-1\)?\(([^)]*)\)/g, 'acos($1)')

    // sin^4(x) → (sin(x))^4
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

/**
 * Check user's LaTeX answer against an ascii-math expected answer
 * using the Compute Engine for symbolic comparison.
 */
export function checkAnswer(input: string, expected: string, variables: string[]): boolean {
    void variables // kept for call-site compatibility
    try {
        const userExpr = ce.parse(input)
        const expectedExpr = ce.parse(asciiMathToLatex(expected))
        return userExpr.isEqual(expectedExpr) ?? false
    } catch {
        return false
    }
}

export default function FreeResponseQuestion({ question, number, onInput, reviewMode, wasCorrect, showSolution, savedInput }: FreeResponseQuestionProps) {
    const [mounted, setMounted] = useState(false)
    const mfRef = useRef<MathfieldEl>(null)
    const initializedRef = useRef(false)

    const cardClass = wasCorrect === true ? styles.questionCorrect
        : wasCorrect === false ? styles.questionWrong
            : ''

    // Load MathLive dynamically — it accesses the DOM at import time
    useEffect(() => {
        import('mathlive').then((ml) => {
            ml.MathfieldElement.fontsDirectory = '/mathlive-fonts/'
            setMounted(true)
        })
    }, [])

    // Wire up input listener + restore saved value (once only)
    useEffect(() => {
        const mf = mfRef.current
        if (!mf || !mounted) return

        if (!initializedRef.current && savedInput) {
            mf.value = savedInput
            initializedRef.current = true
        }

        const handleInput = () => {
            onInput(mf.value)
        }

        mf.addEventListener('input', handleInput)
        return () => mf.removeEventListener('input', handleInput)
    }, [mounted, onInput, savedInput])

    return (
        <div className={`${styles.question} ${cardClass}`}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>

            {!reviewMode ? (
                <div className={styles.inputArea}>
                    {mounted ? (
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
                    ) : (
                        <div style={{ height: '40px', width: '100%' }} />
                    )}
                </div>
            ) : (
                savedInput && (
                    <div className={styles.inputArea}>
                        <div className={styles.savedAnswer}>
                            <span className={styles.previewLabel}>Your answer:</span>
                            <MathText text={`$$${savedInput}$$`} />
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
