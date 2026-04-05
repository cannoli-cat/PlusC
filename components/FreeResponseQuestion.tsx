'use client'

import { useState } from 'react'
import MathText from './MathText'
import type { FreeResponseQuestion as FreeResponseQuestionType } from '@/data/questions'
import styles from './FreeResponseQuestion.module.css'

interface FreeResponseQuestionProps {
    question: FreeResponseQuestionType
    number: number
    onAnswered: (correct: boolean) => void
    reviewMode?: boolean
}

export default function FreeResponseQuestion({ question, number, onAnswered, reviewMode }: FreeResponseQuestionProps) {
    const [revealed, setRevealed] = useState(reviewMode ?? false)

    return (
        <div className={styles.question}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
                {!reviewMode && (
                    <button className={styles.revealBtn} onClick={() => {
                        setRevealed(!revealed)
                        onAnswered(true)
                    }}>
                        {revealed ? 'Hide Solution' : 'Show Solution'}
                    </button>
                )}
            </div>
            {(revealed || reviewMode) && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    <p>Solution:</p>
                    <MathText text={question.solution} />
                </div>
            )}
        </div>
    )
}