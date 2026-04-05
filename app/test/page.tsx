'use client'

import { useSearchParams } from 'next/navigation'
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType, FreeResponseQuestion as FreeResponseQuestionType } from '@/data/questions'
import { questions } from '@/data/questions'
import MultipleChoiceQuestion from "@/components/MultipleChoiceQuestion"
import FreeResponseQuestion from "@/components/FreeResponseQuestion"
import Timer from "@/components/Timer"
import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import styles from './page.module.css'

interface AnswerRecord {
    correct: boolean
    selected?: string
}

export default function TestPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const sections = useMemo(() =>
        searchParams.get('sections')?.split(',').filter(Boolean) ?? []
        , [searchParams])

    const time = Number(searchParams.get('time'))
    const mcCount = Number(searchParams.get('mc'))
    const frCount = Number(searchParams.get('fr'))

    const allQuestions = useMemo(() => {
        const filtered = questions.filter((q) => sections.includes(q.section))
        const mc = shuffle(filtered.filter((q): q is MultipleChoiceQuestionType => q.type === 'multiple-choice')).slice(0, mcCount)
        const fr = shuffle(filtered.filter((q): q is FreeResponseQuestionType => q.type === 'free-response')).slice(0, frCount)
        return shuffle([...mc, ...fr])
    }, [sections, mcCount, frCount])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [answered, setAnswered] = useState<Map<number, AnswerRecord>>(new Map())
    const [submitted, setSubmitted] = useState(false)

    const current = allQuestions[currentIndex]

    const markAnswered = (index: number, correct: boolean, selected?: string) => {
        setAnswered(prev => new Map(prev).set(index, { correct, selected }))
    }

    if (submitted) {
        const correct = [...answered.values()].filter(v => v.correct).length
        const total = allQuestions.length
        const score = Math.round((correct / total) * 100)
        const currentQ = allQuestions[currentIndex]

        return (
            <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 32px' }}>
                <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '28px', marginBottom: '40px' }}>
                    <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        by Tyler Wolfe
                    </p>
                    <h1 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.01em' }}>By Parts</h1>
                    <p style={{ fontSize: '16px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '4px' }}>
                        A calculus study tool
                    </p>
                </header>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '8px' }}>Results</h2>
                    <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '28px', color: score >= 70 ? 'var(--green)' : 'var(--red)' }}>
                        {score}%
                    </p>
                    <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>
                        {correct} correct, {total - correct} incorrect out of {total} questions
                    </p>
                </div>
                <div className={styles.grid} style={{ marginBottom: '28px' }}>
                    {allQuestions.map((_, i) => {
                        const record = answered.get(i)
                        return (
                            <button
                                key={i}
                                className={`${styles.gridBtn} ${!record ? '' : record.correct ? styles.gridBtnCorrect : styles.gridBtnWrong} ${i === currentIndex ? styles.gridBtnCurrent : ''}`}
                                onClick={() => setCurrentIndex(i)}
                            >
                                {i + 1}
                            </button>
                        )
                    })}
                </div>
                {currentQ.type === 'multiple-choice' ? (
                    <MultipleChoiceQuestion
                        question={currentQ}
                        number={currentIndex + 1}
                        onAnswered={() => { }}
                        reviewMode
                        selectedAnswer={answered.get(currentIndex)?.selected}
                    />
                ) : (
                    <FreeResponseQuestion
                        question={currentQ}
                        number={currentIndex + 1}
                        onAnswered={() => { }}
                        reviewMode
                    />
                )}
                <button className={styles.btn} onClick={() => router.push('/')}>
                    ← Back to Home
                </button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 32px' }}>
            <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '28px', marginBottom: '40px' }}>
                <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    by Tyler Wolfe
                </p>
                <h1 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.01em' }}>By Parts</h1>
                <p style={{ fontSize: '16px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '4px' }}>
                    A calculus study tool
                </p>
            </header>
            <h2>Practice Test</h2>
            <div>Sections: {sections.join(', ')}</div>
            <Timer totalSeconds={time} onTimeUp={() => console.log('time up')} onStop={() => router.push('/')} />
            <div className={styles.grid}>
                {getPageNumbers(currentIndex, allQuestions.length).map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className={styles.ellipsis}>...</span>
                    ) : (
                        <button
                            key={page}
                            className={`${styles.gridBtn} ${answered.has(page) ? styles.gridBtnAnswered : ''} ${page === currentIndex ? styles.gridBtnCurrent : ''}`}
                            onClick={() => setCurrentIndex(page)}
                        >
                            {page + 1}
                        </button>
                    )
                )}
            </div>
            {current.type === 'multiple-choice' ? (
                <MultipleChoiceQuestion question={current} number={currentIndex + 1} onAnswered={(correct, selected) => markAnswered(currentIndex, correct, selected)} />
            ) : (
                <FreeResponseQuestion question={current} number={currentIndex + 1} onAnswered={(correct) => markAnswered(currentIndex, correct)} />
            )}
            <div className={styles.nav}>
                <button className={styles.btn} onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
                    ← Previous
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.btn} onClick={() => setCurrentIndex(i => Math.min(allQuestions.length - 1, i + 1))}>
                        Next →
                    </button>
                    <button className={`${styles.btn} ${styles.btnSubmit}`} onClick={() => setSubmitted(true)}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

function shuffle<T>(array: T[]): T[] {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 20) return Array.from({ length: total }, (_, i) => i)

    const pages: (number | '...')[] = []

    pages.push(0)

    if (current > 8) pages.push('...')

    for (let i = Math.max(1, current - 7); i <= Math.min(total - 2, current + 7); i++) {
        pages.push(i)
    }

    if (current < total - 9) pages.push('...')

    pages.push(total - 1)

    return pages
}