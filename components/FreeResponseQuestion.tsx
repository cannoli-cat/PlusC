'use client'

import { useState } from 'react'
import MathText from './MathText'
import type { FreeResponseQuestion as FreeResponseQuestionType } from '@/data/questions'
import styles from './FreeResponseQuestion.module.css'

interface FreeResponseQuestionProps {
    question: FreeResponseQuestionType
    number: number
}

export default function FreeResponseQuestion({ question, number }: FreeResponseQuestionProps) {
    const [revealed, setRevealed] = useState(false)

    return (
        <div className={styles.question}>
            <div className={styles.header}>
                <span className={styles.number}>{number}</span>
                <MathText text={question.text} />
                <button className={styles.revealBtn} onClick={() => setRevealed(!revealed)}>
                    {revealed ? 'Hide Solution' : 'Show Solution'}
                </button>
            </div>
            {revealed && (
                <p style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px' }}>
                    <MathText text={question.solution} />
                </p>
            )}
        </div>
    )
}