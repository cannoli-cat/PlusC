'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions } from '@/data/questions'
import styles from './page.module.css'

export default function Home() {
  const router = useRouter()

  const [selectedSections, setSelectedSections] = useState<string[]>([...new Set(questions.map((q) => q.section))])
  const [timeLimit, setTimeLimit] = useState(60)
  const [mcCount, setMcCount] = useState(5)
  const [frCount, setFrCount] = useState(3)

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
          <input className={styles.input} type="number" value={mcCount} onChange={(e) => setMcCount(Number(e.target.value))} />
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Free Response Questions</span>
          <input className={styles.input} type="number" value={frCount} onChange={(e) => setFrCount(Number(e.target.value))} />
        </div>
        <div className={styles.configRow}>
          <span className={styles.label}>Time Limit (minutes)</span>
          <input className={styles.input} type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
        </div>
        <button className={styles.startBtn} onClick={() => router.push(`/test?sections=${selectedSections.join(',')}&time=${timeLimit * 60}&mc=${mcCount}&fr=${frCount}`)}>
          Start Test →
        </button>
      </div>
    </div>
  );
}