'use client'

import { useEffect, useState } from "react";
import styles from './Timer.module.css'

export default function Timer({ totalSeconds, onTimeUp, onStop }: { totalSeconds: number, onTimeUp: () => void, onStop: () => void }) {
    const [timeLeft, setTimeLeft] = useState(totalSeconds)
    const [paused, setPaused] = useState(false)

    useEffect(() => {
        if (paused) return
        if (timeLeft <= 0) {
            onTimeUp()
            return
        }
        const interval = setInterval(() => {
            setTimeLeft(t => t - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [onTimeUp, timeLeft, paused])

    const h = Math.floor(timeLeft / 3600)
    const m = Math.floor((timeLeft % 3600) / 60)
    const s = timeLeft % 60

    return (
        <div className={styles.bar}>
            <span className={styles.label}>Time Remaining</span>
            <span className={`${styles.time} ${timeLeft <= 600 ? styles.timeWarning : ''}`}>
                {h}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </span>
            <div className={styles.controls}>
                <button className={styles.btn} onClick={() => setPaused(p => !p)}>
                    {paused ? 'Resume' : 'Pause'}
                </button>
                <button className={`${styles.btn} ${styles.btnStop}`} onClick={onStop}>
                    Stop Test
                </button>
            </div>
        </div>
    )
}