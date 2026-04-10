'use client'

import { useState } from 'react'
import MathText from './MathText'
import type { FreeResponseQuestion as FreeResponseQuestionType } from '@/data/questions'
import styles from './FreeResponseQuestion.module.css'
import { parse } from 'mathjs'

interface FreeResponseQuestionProps {
    question: FreeResponseQuestionType
    number: number
    onInput: (input: string) => void
    reviewMode?: boolean
    wasCorrect?: boolean
    showSolution?: boolean
    savedInput?: string
}

function normalizeMath(expr: string): string {
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
                result += `abs(${normalizeMath(s.slice(i + 1, j))})`
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

export function checkAnswer(input: string, expected: string, variables: string[]): boolean {
    try {
        const parsedInput = parse(normalizeMath(input))
        const parsedExpected = parse(normalizeMath(expected))

        const testPoints: Record<string, number>[] = []
        for (let i = 0; i < 20; i++) {
            const scope: Record<string, number> = {}
            for (const v of variables) {
                scope[v] = Math.random() * 1.4 + 0.1
            }
            testPoints.push(scope)
        }

        let validComparisons = 0
        for (const scope of testPoints) {
            const v1 = parsedInput.evaluate({ ...scope })
            const v2 = parsedExpected.evaluate({ ...scope })

            if (typeof v1 !== 'number' || typeof v2 !== 'number') continue
            if (!isFinite(v1) || !isFinite(v2)) continue

            if (Math.abs(v1 - v2) > 1e-4 * Math.max(1, Math.abs(v2))) return false

            validComparisons++
        }
        return validComparisons >= 5
    } catch {
        return false
    }
}

export default function FreeResponseQuestion({ question, number, onInput, reviewMode, wasCorrect, showSolution, savedInput }: FreeResponseQuestionProps) {
    const [input, setInput] = useState(savedInput ?? '')
    const cardClass = wasCorrect === true ? styles.questionCorrect
        : wasCorrect === false ? styles.questionWrong
            : ''

    const handleChange = (value: string) => {
        setInput(value)
        onInput(value)
    }

    return (
        <div className={`${styles.question} ${cardClass}`}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>
            {!reviewMode ? (
                <div className={styles.inputArea}>
                    <input
                        type="text"
                        className={styles.mathInput}
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="e.g. (1/4)*tan(4*x)+C"
                    />
                    {input.trim() && (
                        <div className={styles.preview}>
                            <span className={styles.previewLabel}>Preview:</span>
                            <MathText text={`$${formatPreview(input)}$`} />
                        </div>
                    )}
                </div>
            ) : (
                savedInput && (
                    <div className={styles.inputArea}>
                        <div className={styles.savedAnswer}>
                            <span className={styles.previewLabel}>Your answer:</span>
                            <MathText text={`$${formatPreview(savedInput)}$`} />
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

function formatPreview(input: string): string {
    try {
        return parse(input).toTex()
    } catch {
        return input
    }
}
