'use client'

import { useState } from 'react'
import MathText from './MathText'
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/data/questions'
import styles from './MultipleChoiceQuestion.module.css'

interface MultipleChoiceQuestionProps {
    question: MultipleChoiceQuestionType
    number: number
}

export default function MultipleChoiceQuestion({ question, number }: MultipleChoiceQuestionProps) {
    const [selected, setSelected] = useState<string | null>(null)

    return (
        <div className={styles.question}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
            </div>
            <div className={styles.choices}>
                {question.choices.map((choice) => (
                    <button
                        key={choice.label}
                        className={`${styles.choice} ${selected === choice.label ? styles.selected : ''}`}
                        onClick={() => setSelected(choice.label)}
                    >
                        {choice.label}. <MathText text={choice.text} />
                    </button>
                ))}
            </div>
            {selected && (
                <p className={`${styles.feedback} ${selected === question.answer ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                    {selected === question.answer ? 'Correct!' : `Wrong. Answer is ${question.answer}`}
                </p>
            )}
        </div>
    )
}