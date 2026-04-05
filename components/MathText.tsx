'use client'

import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface MathTextProps {
    text: string
}

export default function MathText({ text }: MathTextProps) {
    const parts = text.split(/\$(.+?)\$/)

    return (
        <span>
            {parts.map((part, i) =>
                i % 2 === 1 ? <InlineMath key={i} math={part} /> : part
            )}
        </span>
    )
}