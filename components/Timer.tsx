'use client'

import styles from './Timer.module.css'

interface TimerProps {
    timeLeft: number
    paused: boolean
    onPause: () => void
    onStop: () => void
}

export default function Timer({ timeLeft, paused, onPause, onStop }: TimerProps) {
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
                <button className={styles.btn} onClick={onPause}>
                    {paused ? 'Resume' : 'Pause'}
                </button>
                <button className={`${styles.btn} ${styles.btnStop}`} onClick={onStop}>
                    Stop Test
                </button>
            </div>
        </div>
    )
}