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
}

export default function MultipleChoiceQuestion({ question, number, onAnswered, reviewMode, selectedAnswer }: MultipleChoiceQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null)

    return (
        <div className={styles.question}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>
            <div className={styles.choices}>
                {question.choices.map((choice) => {
                    let choiceClass = styles.choice

                    if (reviewMode) {
                        if (choice.label === question.answer) {
                            choiceClass += ` ${styles.correct}`
                        } else if (choice.label === selectedAnswer) {
                            choiceClass += ` ${styles.wrong}`
                        }
                    } else {
                        if (selected === choice.label) {
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
                            {choice.label}. <MathText text={choice.text} />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}