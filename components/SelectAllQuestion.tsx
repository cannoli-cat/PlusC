'use client'

import { useState, useMemo } from 'react'
import MathText from './MathText'
import type { SelectAllQuestion as SelectAllQuestionType } from '@/data/questions'
import styles from './SelectAllQuestion.module.css'

interface SelectAllQuestionProps {
    question: SelectAllQuestionType
    number: number
    onAnswered: (correct: boolean, selected: string[], credit: number) => void
    reviewMode?: boolean
    selectedAnswers?: string[]
    showCorrect?: boolean
    showSolution?: boolean
    wasCorrect?: boolean
}

export default function SelectAllQuestion({ question, number, onAnswered, reviewMode, selectedAnswers, showCorrect, showSolution, wasCorrect }: SelectAllQuestionProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedAnswers ?? []))
    const sortedAnswers = useMemo(() => [...question.answers].sort(), [question.answers])
    const cardClass = wasCorrect === true ? styles.questionCorrect
        : wasCorrect === false ? styles.questionWrong
        : ''

    const toggle = (label: string) => {
        if (reviewMode) return
        const next = new Set(selected)
        if (next.has(label)) next.delete(label)
        else next.add(label)
        setSelected(next)
        const arr = [...next].sort()
        const correct = arr.length === sortedAnswers.length && arr.every((v, i) => v === sortedAnswers[i])
        const correctlySelected = arr.filter(v => sortedAnswers.includes(v)).length
        const incorrectlySelected = arr.length - correctlySelected
        const credit = arr.length === 0 ? 0 : Math.max(0, (correctlySelected - incorrectlySelected) / sortedAnswers.length)
        onAnswered(correct, arr, credit)
    }

    return (
        <div className={`${styles.question} ${cardClass}`}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>
            <div className={styles.hint}>Select all that apply</div>
            <div className={styles.choices}>
                {question.choices.map((choice) => {
                    let choiceClass = styles.choice

                    if (showCorrect) {
                        const isCorrectChoice = question.answers.includes(choice.label)
                        const wasSelected = selectedAnswers?.includes(choice.label)
                        if (isCorrectChoice) choiceClass += ` ${styles.correct}`
                        else if (wasSelected) choiceClass += ` ${styles.wrong}`
                    } else {
                        const effectiveSelected = selected.size > 0 ? selected : new Set(selectedAnswers ?? [])
                        if (effectiveSelected.has(choice.label)) {
                            choiceClass += ` ${styles.selected}`
                        }
                    }

                    return (
                        <button
                            key={choice.label}
                            className={choiceClass}
                            disabled={reviewMode}
                            onClick={() => toggle(choice.label)}
                        >
                            {choice.label}. <MathText text={choice.text} inline />
                        </button>
                    )
                })}
            </div>
            {showSolution && question.solution && (
                <div className={styles.solutionArea}>
                    <p className={styles.solutionLabel}>Solution:</p>
                    <MathText text={question.solution} />
                </div>
            )}
        </div>
    )
}
