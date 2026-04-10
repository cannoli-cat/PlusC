'use client'

import React, { useState, useEffect } from 'react'

interface MathTextProps {
    text: string;
    inline?: boolean;
}

/**
 * Parse a markdown table string into rows of cells.
 * Expects lines like: | a | b | c |
 * Skips separator lines like: |---|---|---|
 */
function parseTable(tableStr: string): string[][] {
    const lines = tableStr.trim().split('\n')
    const rows: string[][] = []
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('|')) continue
        // Skip separator rows (|---|---|)
        if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue
        const cells = trimmed
            .replace(/^\||\|$/g, '')
            .split('|')
            .map(c => c.trim())
        rows.push(cells)
    }
    return rows
}

/**
 * Render inline content: handles $math$, **bold**, and plain text.
 */
function renderInline(text: string, isMounted: boolean, keyPrefix: string): React.ReactNode[] {
    // Split on $$..$$ (display math), $..$  (inline math), and **..** (bold)
    const tokens = text.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\*\*.*?\*\*)/g)
    return tokens.map((token, i) => {
        const key = `${keyPrefix}-${i}`
        if (token.startsWith('$$') && token.endsWith('$$')) {
            const latex = token.slice(2, -2)
            if (isMounted) {
                return (
                    /* @ts-expect-error MathLive web component */
                    <math-span key={key} style={{ display: 'block', margin: '12px 0' }}>{latex}</math-span>
                )
            }
            return <span key={key} style={{ display: 'block', margin: '12px 0' }}>{latex}</span>
        }
        if (token.startsWith('$') && token.endsWith('$')) {
            const latex = token.slice(1, -1)
            if (isMounted) {
                /* @ts-expect-error MathLive web component */
                return <math-span key={key}>{latex}</math-span>
            }
            return <span key={key}>{latex}</span>
        }
        if (token.startsWith('**') && token.endsWith('**')) {
            return <strong key={key}>{token.slice(2, -2)}</strong>
        }
        return <span key={key}>{token}</span>
    })
}

export default function MathText({ text, inline }: MathTextProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        import('mathlive').then((ml) => {
            ml.MathfieldElement.fontsDirectory = '/mathlive-fonts/'
            setIsMounted(true)
        })
    }, []);

    if (!text) return null;

    // Inline mode: no paragraphs, tables, or line breaks — just inline math/bold/text
    if (inline) {
        return <span>{renderInline(text, isMounted, 'i')}</span>
    }

    // Split into paragraphs on double newlines
    const paragraphs = text.split(/\n\n+/)

    return (
        <div>
            {paragraphs.map((para, pIdx) => {
                const trimmed = para.trim()

                // Detect markdown tables (lines starting with |)
                if (trimmed.includes('|') && trimmed.split('\n').some(l => l.trim().startsWith('|'))) {
                    const rows = parseTable(trimmed)
                    if (rows.length > 0) {
                        // Text before the table (if any)
                        const lines = trimmed.split('\n')
                        const preTableLines: string[] = []
                        for (const line of lines) {
                            if (line.trim().startsWith('|')) break
                            preTableLines.push(line)
                        }
                        return (
                            <div key={pIdx}>
                                {preTableLines.length > 0 && (
                                    <p style={{ marginBottom: '8px' }}>
                                        {renderInline(preTableLines.join(' '), isMounted, `p${pIdx}-pre`)}
                                    </p>
                                )}
                                <table style={{
                                    borderCollapse: 'collapse',
                                    margin: '12px 0',
                                    fontSize: '0.95em',
                                }}>
                                    <thead>
                                        <tr>
                                            {rows[0]?.map((cell, cIdx) => (
                                                <th key={cIdx} style={{
                                                    border: '1px solid var(--border)',
                                                    padding: '6px 12px',
                                                    textAlign: 'center',
                                                    background: 'var(--surface2)',
                                                }}>
                                                    {renderInline(cell, isMounted, `p${pIdx}-th${cIdx}`)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.slice(1).map((row, rIdx) => (
                                            <tr key={rIdx}>
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} style={{
                                                        border: '1px solid var(--border)',
                                                        padding: '6px 12px',
                                                        textAlign: 'center',
                                                    }}>
                                                        {renderInline(cell, isMounted, `p${pIdx}-r${rIdx}-c${cIdx}`)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                }

                // Regular paragraph — handle single newlines as line breaks
                const lines = trimmed.split('\n')
                return (
                    <p key={pIdx} style={{ marginBottom: '8px' }}>
                        {lines.map((line, lIdx) => (
                            <React.Fragment key={lIdx}>
                                {lIdx > 0 && <br />}
                                {renderInline(line, isMounted, `p${pIdx}-l${lIdx}`)}
                            </React.Fragment>
                        ))}
                    </p>
                )
            })}
        </div>
    );
}
