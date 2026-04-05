'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { questions } from '@/data/questions'
import styles from './page.module.css'

export default function Home() {
  const router = useRouter()

  const [selectedSections, setSelectedSections] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...new Set(questions.map((q) => q.section))]
    const saved = localStorage.getItem('byparts-sections')
    return saved ? JSON.parse(saved) : [...new Set(questions.map((q) => q.section))]
  })
  const [timeLimit, setTimeLimit] = useState(() => {
    if (typeof window === 'undefined') return 60
    return Math.max(0, Number(localStorage.getItem('byparts-time') ?? 60))
  })
  const [mcCount, setMcCount] = useState(() => {
    if (typeof window === 'undefined') return 5
    return Math.max(0, Number(localStorage.getItem('byparts-mc') ?? 5))
  })
  const [saCount, setSaCount] = useState(() => {
    if (typeof window === 'undefined') return 3
    return Math.max(0, Number(localStorage.getItem('byparts-sa') ?? 3))
  })
  const [frCount, setFrCount] = useState(() => {
    if (typeof window === 'undefined') return 3
    return Math.max(0, Number(localStorage.getItem('byparts-fr') ?? 3))
  })
  const [attempts, setAttempts] = useState(() => {
    if (typeof window === 'undefined') return 2
    return Math.max(1, Number(localStorage.getItem('byparts-attempts') ?? 2))
  })

  useEffect(() => {
    localStorage.setItem('byparts-sections', JSON.stringify(selectedSections))
    localStorage.setItem('byparts-time', String(timeLimit))
    localStorage.setItem('byparts-mc', String(mcCount))
    localStorage.setItem('byparts-sa', String(saCount))
    localStorage.setItem('byparts-fr', String(frCount))
    localStorage.setItem('byparts-attempts', String(attempts))
  }, [selectedSections, timeLimit, mcCount, saCount, frCount, attempts])

  const sections = [...new Set(questions.map((q) => q.section))]

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
      <div className={styles.config}>
        <div className={styles.configRow}>
          <span className={styles.label}>Sections</span>
          <div className={styles.sections}>
            {sections.map((section) => (
              <button
                key={section}
                className={`${styles.sectionBtn} ${selectedSections.includes(section) ? styles.sectionBtnActive : ''}`}
                onClick={() => {
                  if (selectedSections.includes(section)) {
                    setSelectedSections(selectedSections.filter((s) => s !== section))
                  } else {
                    setSelectedSections([...selectedSections, section])
                  }
                }}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Multiple Choice Questions</span>
          <input className={styles.input} type="number" min="0" value={mcCount} onChange={(e) => setMcCount(Math.max(0, Number(e.target.value)))} />
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Select All That Apply Questions</span>
          <input className={styles.input} type="number" min="0" value={saCount} onChange={(e) => setSaCount(Math.max(0, Number(e.target.value)))} />
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Free Response Questions</span>
          <input className={styles.input} type="number" min="0" value={frCount} onChange={(e) => setFrCount(Math.max(0, Number(e.target.value)))} />
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Attempts per question</span>
          <input className={styles.input} type="number" min="1" value={attempts} onChange={(e) => setAttempts(Math.max(1, Number(e.target.value)))} />
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Time Limit (minutes)</span>
          <input className={styles.input} type="number" min="1" value={timeLimit} onChange={(e) => setTimeLimit(Math.max(1, Number(e.target.value)))} />
        </div>
        <button className={styles.startBtn} onClick={() => router.push(`/test?sections=${selectedSections.join(',')}&time=${timeLimit * 60}&mc=${mcCount}&sa=${saCount}&fr=${frCount}&a=${attempts}`)}>
          Start Test →
        </button>
      </div>
    </div>
  );
}