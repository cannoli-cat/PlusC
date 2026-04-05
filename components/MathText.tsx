'use client'

import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface MathTextProps {
    text: string
}

export default function MathText({ text }: MathTextProps) {
    const stripped = text.replace(/\*\*(.+?)\*\*/g, '$1')
    const lines = stripped.split('\n')
    const result: React.ReactNode[] = []
    let i = 0
    let keyCounter = 0

    while (i < lines.length) {
        const line = lines[i]
        if (line.trim().startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().match(/^\|[\-| ]+\|?\s*$/)) {
            const headers = line.trim().split('|').filter(Boolean).map(h => h.trim())
            i += 2
            const rows: string[][] = []
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                rows.push(lines[i].trim().split('|').filter(Boolean).map(c => c.trim()))
                i++
            }
            result.push(
                <table key={keyCounter++} style={{ borderCollapse: 'collapse', margin: '12px 0', fontFamily: 'var(--font-mono), monospace', fontSize: '13px' }}>
                    <thead>
                        <tr>
                            {headers.map((h, j) => (
                                <th key={j} style={{ border: '1px solid var(--border)', padding: '6px 14px', color: 'var(--text-dim)' }}>
                                    <MathText text={h} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => (
                                    <td key={ci} style={{ border: '1px solid var(--border)', padding: '6px 14px', textAlign: 'center' }}>
                                        <MathText text={cell} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        } else {
            result.push(<span key={keyCounter++}><MathInline text={line} />{i < lines.length - 1 && <br />}</span>)
            i++
        }
    }

    return <span>{result}</span>
}

function MathInline({ text }: { text: string }) {
    const parts: React.ReactNode[] = []
    const blockSplit = text.split(/\$\$(.+?)\$\$/g)
    blockSplit.forEach((chunk, i) => {
        if (i % 2 === 1) {
            parts.push(<BlockMath key={i} math={chunk} />)
        } else {
            const inlineSplit = chunk.split(/\$(.+?)\$/g)
            inlineSplit.forEach((piece, j) => {
                if (j % 2 === 1) parts.push(<InlineMath key={`${i}-${j}`} math={piece} />)
                else if (piece) parts.push(<span key={`${i}-${j}`}>{piece}</span>)
            })
        }
    })
    return <>{parts}</>
}