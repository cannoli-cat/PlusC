'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { MultipleChoiceQuestion as MultipleChoiceQuestionType, FreeResponseQuestion as FreeResponseQuestionType, SelectAllQuestion as SelectAllQuestionType, Question } from '@/data/questions'
import { questions265, questions266 } from '@/data/questions'
import MultipleChoiceQuestion from "@/components/MultipleChoiceQuestion"
import SelectAllQuestion from "@/components/SelectAllQuestion"
import FreeResponseQuestion, { checkAnswer } from "@/components/FreeResponseQuestion"
import Timer from "@/components/Timer"
import Header from "@/components/Header"
import { useRouter } from 'next/navigation'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import styles from './page.module.css'

interface AnswerRecord {
    correct: boolean
    credit: number
    selected?: string | string[]
}

export default function TestPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{ color: 'var(--text-dim)' }}>
                Loading test...
            </div>
        }>
            <TestContent />
        </Suspense>
    )
}

function TestContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const course = searchParams.get('course') ?? '265'
    const questionBank = course === '266' ? questions266 : questions265

    const sections = useMemo(() =>
        searchParams.get('sections')?.split(',').filter(Boolean) ?? []
        , [searchParams])

    const time = Number(searchParams.get('time'))
    const mcCount = Number(searchParams.get('mc'))
    const saCount = Number(searchParams.get('sa'))
    const frCount = Number(searchParams.get('fr'))
    const attempts = Number(searchParams.get('a'))
    const isRandom = searchParams.get('random') === 'true'
    const randomCount = Number(searchParams.get('count'))
    const prioritySections = useMemo(() =>
        searchParams.get('priority')?.split(',').filter(Boolean) ?? []
        , [searchParams])
    const weightPct = Number(searchParams.get('wpct') ?? 0)

    const [allQuestions, setAllQuestions] = useState<Question[] | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            const filtered = questionBank.filter((q) => sections.includes(q.section))
            const weighted = prioritySections.length > 0 && weightPct > 0

            if (isRandom) {
                setAllQuestions(weighted
                    ? weightedSelect(filtered, randomCount, prioritySections, weightPct)
                    : shuffle(filtered).slice(0, randomCount))
                return
            }

            const mc = weighted
                ? weightedSelect(filtered.filter((q): q is MultipleChoiceQuestionType => q.type === 'multiple-choice'), mcCount, prioritySections, weightPct)
                : shuffle(filtered.filter((q): q is MultipleChoiceQuestionType => q.type === 'multiple-choice')).slice(0, mcCount)
            const sa = weighted
                ? weightedSelect(filtered.filter((q): q is SelectAllQuestionType => q.type === 'select-all'), saCount, prioritySections, weightPct)
                : shuffle(filtered.filter((q): q is SelectAllQuestionType => q.type === 'select-all')).slice(0, saCount)
            const fr = weighted
                ? weightedSelect(filtered.filter((q): q is FreeResponseQuestionType => q.type === 'free-response'), frCount, prioritySections, weightPct)
                : shuffle(filtered.filter((q): q is FreeResponseQuestionType => q.type === 'free-response')).slice(0, frCount)

            setAllQuestions(shuffle([...mc, ...sa, ...fr]))
        }, 0)

        return () => clearTimeout(timer)
    }, [questionBank, sections, isRandom, randomCount, mcCount, saCount, frCount, prioritySections, weightPct])

    const [currentIndex, setCurrentIndex] = useState(0)
    const [answered, setAnswered] = useState<Map<number, AnswerRecord>>(new Map())
    const [submitted, setSubmitted] = useState(false)
    const [attemptCount, setAttemptCount] = useState(attempts)
    const [timeLeft, setTimeLeft] = useState(time)
    const [paused, setPaused] = useState(false)
    const [lockedQuestions, setLockedQuestions] = useState<Set<number>>(new Set())
    const [frInputs, setFrInputs] = useState<Map<number, string>>(new Map())
    const isLocked = lockedQuestions.has(currentIndex)

    const markAnswered = (index: number, correct: boolean, selected?: string | string[], credit?: number) => {
        setAnswered(prev => new Map(prev).set(index, { correct, credit: credit ?? (correct ? 1 : 0), selected }))
    }

    const gradeFrAndSubmit = useCallback(() => {
        if (!allQuestions) return
        setAnswered(prev => {
            const next = new Map(prev)
            for (const [i, input] of frInputs) {
                if (lockedQuestions.has(i)) continue
                const q = allQuestions[i]
                if (q.type !== 'free-response') continue
                const { correct, credit } = input.trim() ? checkAnswer(input, q.answer, q.variables ?? ['x', 'C']) : { correct: false, credit: 0 }
                next.set(i, { correct, credit, selected: input })
            }
            return next
        })
        setAttemptCount(c => c - 1)
        setSubmitted(true)
    }, [frInputs, lockedQuestions, allQuestions])

    const gradeFrAndSubmitRef = useRef(gradeFrAndSubmit)
    useEffect(() => {
        gradeFrAndSubmitRef.current = gradeFrAndSubmit
    }, [gradeFrAndSubmit])

    useEffect(() => {
        if (paused || submitted) return;

        const interval = setInterval(() => {
            setTimeLeft(t => {
                const next = t - 1;
                if (next <= 0) {
                    setTimeout(() => {
                        gradeFrAndSubmitRef.current();
                    }, 0);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [paused, submitted]);

    if (!allQuestions) {
        return (
            <div className="container" style={{ color: 'var(--text-dim)' }}>
                Loading test...
            </div>
        )
    }

    if (allQuestions.length === 0) {
        return (
            <div className="container">
                <p style={{ color: 'var(--text-dim)' }}>No questions found for the selected sections.</p>
                <button className={styles.btn} onClick={() => router.push('/')}>
                    ← Back to Home
                </button>
            </div>
        )
    }

    const current = allQuestions[currentIndex]

    if (submitted) {
        const totalCredit = [...answered.values()].reduce((sum, v) => sum + v.credit, 0)
        const total = allQuestions.length
        const score = Math.round((totalCredit / total) * 100)
        const currentQ = allQuestions[currentIndex]
        const isFullReview = attemptCount <= 0 || score === 100
        const fullyCorrect = [...answered.values()].filter(v => v.correct).length
        const partial = [...answered.values()].filter(v => !v.correct && v.credit > 0).length

        return (
            <div className="container">
                <Header />
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ marginBottom: '8px' }}>Results</h2>
                    <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '28px', color: score >= 70 ? 'var(--green)' : 'var(--red)' }}>
                        {score}%
                    </p>
                    <p style={{ color: 'var(--text-dim)', marginTop: '4px' }}>
                        {+totalCredit.toFixed(1)} / {total} points
                        {partial > 0 && ` (${fullyCorrect} full, ${partial} partial)`}
                    </p>
                </div>
                <div className={styles.grid} style={{ marginBottom: '28px' }}>
                    {allQuestions.map((_, i) => {
                        const record = answered.get(i)
                        const creditClass = record?.correct ? styles.gridBtnCorrect
                            : (record && record.credit > 0) ? styles.gridBtnPartial
                                : styles.gridBtnWrong
                        return (
                            <button
                                key={i}
                                className={`${styles.gridBtn} ${creditClass} ${i === currentIndex ? styles.gridBtnCurrent : ''}`}
                                onClick={() => setCurrentIndex(i)}
                            >
                                {i + 1}
                            </button>
                        )
                    })}
                </div>
                {(() => {
                    const rec = answered.get(currentIndex)
                    const wasCorrect = rec?.correct === true ? true : (rec?.credit ?? 0) > 0 ? undefined : false
                    return currentQ.type === 'multiple-choice' ? (
                        <MultipleChoiceQuestion
                            key={currentQ.id}
                            question={currentQ}
                            number={currentIndex + 1}
                            onAnswered={(correct, selected) => markAnswered(currentIndex, correct, selected)}
                            reviewMode={true}
                            showCorrect={isFullReview}
                            showSolution={isFullReview}
                            selectedAnswer={rec?.selected as string | undefined}
                            wasCorrect={wasCorrect}
                        />
                    ) : currentQ.type === 'select-all' ? (
                        <SelectAllQuestion
                            key={currentQ.id}
                            question={currentQ}
                            number={currentIndex + 1}
                            onAnswered={(correct, selected, credit) => markAnswered(currentIndex, correct, selected, credit)}
                            reviewMode={true}
                            showCorrect={isFullReview}
                            showSolution={isFullReview}
                            selectedAnswers={rec?.selected as string[] | undefined}
                            wasCorrect={wasCorrect}
                        />
                    ) : (
                        <FreeResponseQuestion
                            key={currentQ.id}
                            question={currentQ}
                            number={currentIndex + 1}
                            onInput={() => { }}
                            reviewMode={true}
                            showSolution={isFullReview}
                            savedInput={rec?.selected as string | undefined}
                            wasCorrect={wasCorrect}
                        />
                    )
                })()}
                {!isFullReview ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                        <button className={styles.btn} onClick={() => router.push('/')}>
                            ← Back to Home
                        </button>
                        <button className={styles.btn} disabled={timeLeft <= 0} onClick={() => {
                            const newLocked = new Set(lockedQuestions)
                            for (const [i, record] of answered) {
                                if (record.correct) newLocked.add(i)
                            }
                            setLockedQuestions(newLocked)
                            setSubmitted(false)
                            setCurrentIndex(0)
                        }}>
                            {timeLeft <= 0 ? 'Time expired' : `Retry -- ${attemptCount} attempt${attemptCount === 1 ? '' : 's'} remaining`}
                        </button>
                    </div>
                ) : (
                    <button className={styles.btn} onClick={() => router.push('/')}>
                        ← Back to Home
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="container">
            <Header />
            <h2>Practice Test</h2>
            <div>Sections: {[...sections].sort((a, b) => parseFloat(a.replace(/[^0-9.]/g, '')) - parseFloat(b.replace(/[^0-9.]/g, ''))).map(s => s.match(/§[\d.]+/)?.[0] ?? s).join(', ')}</div>
            <Timer
                timeLeft={timeLeft}
                paused={paused}
                onPause={() => setPaused(p => !p)}
                onStop={() => router.push('/')}
            />
            <div className={styles.grid}>
                {getPageNumbers(currentIndex, allQuestions.length).map((page, i) =>
                    page === '...' ? (
                        <span key={`ellipsis-${i}`} className={styles.ellipsis}>...</span>
                    ) : (
                        <button
                            key={page}
                            className={`${styles.gridBtn} ${lockedQuestions.has(page) ? styles.gridBtnCorrect : (answered.has(page) || (frInputs.get(page)?.trim())) ? styles.gridBtnAnswered : ''} ${page === currentIndex ? styles.gridBtnCurrent : ''}`}
                            onClick={() => setCurrentIndex(page)}
                        >
                            {page + 1}
                        </button>
                    )
                )}
            </div>
            {current.type === 'multiple-choice' ? (
                <MultipleChoiceQuestion
                    key={current.id}
                    question={current}
                    number={currentIndex + 1}
                    onAnswered={(correct, selected) => markAnswered(currentIndex, correct, selected)}
                    selectedAnswer={answered.get(currentIndex)?.selected as string | undefined}
                    showCorrect={isLocked}
                    reviewMode={isLocked}
                    wasCorrect={isLocked ? true : undefined}
                />
            ) : current.type === 'select-all' ? (
                <SelectAllQuestion
                    key={current.id}
                    question={current}
                    number={currentIndex + 1}
                    onAnswered={(correct, selected, credit) => markAnswered(currentIndex, correct, selected, credit)}
                    selectedAnswers={answered.get(currentIndex)?.selected as string[] | undefined}
                    showCorrect={isLocked}
                    reviewMode={isLocked}
                    wasCorrect={isLocked ? true : undefined}
                />
            ) : (
                <FreeResponseQuestion
                    key={current.id}
                    question={current}
                    number={currentIndex + 1}
                    onInput={(input) => setFrInputs(prev => new Map(prev).set(currentIndex, input))}
                    savedInput={frInputs.get(currentIndex)}
                    reviewMode={isLocked}
                    showSolution={isLocked}
                    wasCorrect={isLocked ? true : undefined}
                />
            )}
            <div className={styles.nav}>
                <button className={styles.btn} onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>
                    ← Previous
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.btn} onClick={() => setCurrentIndex(i => Math.min(allQuestions.length - 1, i + 1))}>
                        Next →
                    </button>
                    <button className={`${styles.btn} ${styles.btnSubmit}`} onClick={gradeFrAndSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

function weightedSelect<T extends { section: string }>(pool: T[], count: number, priority: string[], pct: number): T[] {
    if (count === 0) return []
    const priorityPool = shuffle(pool.filter(q => priority.includes(q.section)))
    const restPool = shuffle(pool.filter(q => !priority.includes(q.section)))
    if (priorityPool.length === 0 || restPool.length === 0) return shuffle(pool).slice(0, count)

    const wantPriority = Math.round(count * pct / 100)
    const fromPriority = priorityPool.slice(0, Math.min(wantPriority, priorityPool.length))
    const fromRest = restPool.slice(0, Math.min(count - fromPriority.length, restPool.length))
    const taken = fromPriority.length + fromRest.length
    const overflow = shuffle([
        ...priorityPool.slice(fromPriority.length),
        ...restPool.slice(fromRest.length),
    ]).slice(0, count - taken)
    return shuffle([...fromPriority, ...fromRest, ...overflow])
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