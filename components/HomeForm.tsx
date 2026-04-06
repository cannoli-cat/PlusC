'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { questions265, questions266 } from '@/data/questions'
import styles from '../app/page.module.css'

export default function HomeForm() {
  const router = useRouter()

  const [course, setCourse] = useState(() => {
    const v = localStorage.getItem('byparts-course'); return v ? v : '265'
  })

  const activeBank = course === '266' ? questions266 : questions265
  const sections = [...new Set(activeBank.map((q) => q.section))]

  const [selectedSections, setSelectedSections] = useState<string[]>(() => {
    try { const s = localStorage.getItem('byparts-sections'); return s ? JSON.parse(s) : sections } catch { return sections }
  })

  const [randomTest, setRandomTest] = useState(() => {
    const v = localStorage.getItem('byparts-random'); return v === 'true'
  })
  const [timeLimit, setTimeLimit] = useState(() => {
    const v = localStorage.getItem('byparts-time'); return v ? Math.max(1, Number(v)) : 60
  })
  const [mcCount, setMcCount] = useState(() => {
    const v = localStorage.getItem('byparts-mc'); return v ? Math.max(0, Number(v)) : 5
  })
  const [saCount, setSaCount] = useState(() => {
    const v = localStorage.getItem('byparts-sa'); return v ? Math.max(0, Number(v)) : 3
  })
  const [frCount, setFrCount] = useState(() => {
    const v = localStorage.getItem('byparts-fr'); return v ? Math.max(0, Number(v)) : 3
  })
  const [attempts, setAttempts] = useState(() => {
    const v = localStorage.getItem('byparts-attempts'); return v ? Math.max(1, Number(v)) : 2
  })
  const [randomCount, setRandomCount] = useState(() => {
    const v = localStorage.getItem('byparts-randomcount'); return v ? Math.max(1, Number(v)) : 10
  })

  const [sectionSearch, setSectionSearch] = useState('')

  const skipFirstSave = useRef(true)
  useEffect(() => {
    if (skipFirstSave.current) { skipFirstSave.current = false; return }
    localStorage.setItem('byparts-course', course)
    localStorage.setItem('byparts-sections', JSON.stringify(selectedSections))
    localStorage.setItem('byparts-random', String(randomTest))
    localStorage.setItem('byparts-time', String(timeLimit))
    localStorage.setItem('byparts-mc', String(mcCount))
    localStorage.setItem('byparts-sa', String(saCount))
    localStorage.setItem('byparts-fr', String(frCount))
    localStorage.setItem('byparts-attempts', String(attempts))
    localStorage.setItem('byparts-randomcount', String(randomCount))
  }, [course, selectedSections, randomTest, timeLimit, mcCount, saCount, frCount, attempts, randomCount])

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCourse = e.target.value
    setCourse(newCourse)
    const newBank = newCourse === '266' ? questions266 : questions265
    setSelectedSections([...new Set(newBank.map(q => q.section))])
    setSectionSearch('')
  }

  const handleStart = () => {
    const params = new URLSearchParams({
      course: course,
      sections: selectedSections.join(','),
      time: String(timeLimit * 60),
      a: String(attempts),
      random: String(randomTest),
    })
    if (randomTest) {
      params.set('count', String(randomCount))
    } else {
      params.set('mc', String(mcCount))
      params.set('sa', String(saCount))
      params.set('fr', String(frCount))
    }
    router.push(`/test?${params.toString()}`)
  }

  return (
    <div className={styles.config}>
      <div className={styles.configRow}>
        <span className={styles.label}>Course</span>
        <select
          className={styles.input}
          value={course}
          onChange={handleCourseChange}
          style={{ width: '100%', cursor: 'pointer' }}
        >
          <option value="265">MAT 265 (Calculus for Engineers I)</option>
          <option value="266">MAT 266 (Calculus for Engineers II)</option>
        </select>
      </div>

      <div className={styles.configRow}>
        <span className={styles.label}>Sections</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search sections..."
            className={styles.searchInput}
            value={sectionSearch}
            onChange={(e) => setSectionSearch(e.target.value)}
          />
          <div className={styles.sectionList}>
            {sections
              .filter(s => s.toLowerCase().includes(sectionSearch.toLowerCase()))
              .map((section) => (
                <button
                  key={section}
                  className={`${styles.sectionBtn} ${selectedSections.includes(section) ? styles.sectionBtnActive : ''}`}
                  style={{ borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border)', textAlign: 'left' }}
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={styles.sectionBtn}
              onClick={() => setSelectedSections(sections.filter(s => s.toLowerCase().includes(sectionSearch.toLowerCase())))}
            >
              Select All
            </button>
            <button
              className={styles.sectionBtn}
              onClick={() => setSelectedSections([])}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className={styles.configRow} style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
        <span className={styles.label}>Randomize Question Type Amounts</span>
        <div
          className={`${styles.checkbox} ${randomTest ? styles.checkboxChecked : ''}`}
          onClick={() => setRandomTest(!randomTest)}
        >
          <svg
            className={`${styles.checkmark} ${randomTest ? styles.checkmarkVisible : ''}`}
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points="1.5,5 4,7.5 8.5,2"
              stroke="var(--bg)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {randomTest ? (
        <div className={styles.configRow}>
          <span className={styles.label}>Number of Questions</span>
          <input
            className={styles.input}
            type="number"
            min="1"
            value={randomCount}
            onChange={(e) => setRandomCount(Math.max(1, Number(e.target.value)))}
          />
        </div>
      ) : (
        <>
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
        </>
      )}

      <div className={styles.configRow}>
        <span className={styles.label}>Attempts per question</span>
        <input className={styles.input} type="number" min="1" value={attempts} onChange={(e) => setAttempts(Math.max(1, Number(e.target.value)))} />
      </div>
      <div className={styles.configRow}>
        <span className={styles.label}>Time Limit (minutes)</span>
        <input className={styles.input} type="number" min="1" value={timeLimit} onChange={(e) => setTimeLimit(Math.max(1, Number(e.target.value)))} />
      </div>

      <button className={styles.startBtn} onClick={handleStart}>
        Start Test →
      </button>
    </div>
  )
}