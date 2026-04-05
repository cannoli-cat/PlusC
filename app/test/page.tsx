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

    const current = allQuestions[currentIndex]

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
            {current.type === 'multiple-choice' ? (
                <MultipleChoiceQuestion question={current} number={currentIndex + 1} />
            ) : (
                <FreeResponseQuestion question={current} number={currentIndex + 1} />
            )}
            <div className={styles.nav}>
                <button className={styles.btn} onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
                    ← Previous
                </button>
                <button className={styles.btn} onClick={() => setCurrentIndex(i => Math.min(allQuestions.length - 1, i + 1))}>
                    Next →
                </button>
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