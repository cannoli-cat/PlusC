'use client'

import { useState } from 'react'
import MathText from './MathText'
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/data/questions'
import styles from './MultipleChoiceQuestion.module.css'

interface MultipleChoiceQuestionProps {
    question: MultipleChoiceQuestionType
    number: number
    onAnswered: (correct: boolean, selected: string) => void
    reviewMode?: boolean
    selectedAnswer?: string
    showCorrect?: boolean
    wasCorrect?: boolean
}

export default function MultipleChoiceQuestion({ question, number, onAnswered, reviewMode, selectedAnswer, showCorrect, wasCorrect }: MultipleChoiceQuestionProps) {
    const [selected, setSelected] = useState<string | null>(selectedAnswer ?? null)
    const cardClass = wasCorrect === true ? styles.questionCorrect
        : wasCorrect === false ? styles.questionWrong
        : ''

    return (
        <div className={`${styles.question} ${cardClass}`}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>
            <div className={styles.choices}>
                {question.choices.map((choice) => {
                    let choiceClass = styles.choice

                    if (showCorrect) {
                        if (choice.label === question.answer) choiceClass += ` ${styles.correct}`
                        else if (choice.label === selectedAnswer && selectedAnswer !== question.answer) choiceClass += ` ${styles.wrong}`
                    } else {
                        const effectiveSelected = selected ?? selectedAnswer
                        if (choice.label === effectiveSelected) {
                            choiceClass += ` ${styles.selected}`
                        }
                    }

                    return (
                        <button
                            key={choice.label}
                            className={choiceClass}
                            disabled={reviewMode}
                            onClick={() => {
                                if (reviewMode) return
                                setSelected(choice.label)
                                onAnswered(choice.label === question.answer, choice.label)
                            }}
                        >
                            {choice.label}. <MathText text={choice.text} inline />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}