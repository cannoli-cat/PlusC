import type { FreeResponseAnswer } from '@/data/questions'
import { ComputeEngine } from '@cortex-js/compute-engine'
import { parse as mathjsParse } from 'mathjs'

const ce = new ComputeEngine()
const INTERVAL_PATTERN = /^[\[\(].*,.*[\]\)]$/

function normalizeInterval(s: string): string {
    return s
        .replace(/\s+/g, '')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\lbrack/g, '[')
        .replace(/\\rbrack/g, ']')
        .replace(/\\infty|∞|infinity|inf/gi, 'inf')
        .replace(/\\-/g, '-')
        .toLowerCase()
}

function normalizeAsciiMath(expr: string): string {
    let s = expr

    s = s.replace(/\bln\b/g, 'log')
    s = s.replace(/\barcsin\b/g, 'asin')
    s = s.replace(/\barccos\b/g, 'acos')
    s = s.replace(/\barctan\b/g, 'atan')

    let result = ''
    let i = 0
    while (i < s.length) {
        if (s[i] === '|') {
            let j = i + 1
            while (j < s.length && s[j] !== '|') j++
            if (j < s.length) {
                result += `abs(${normalizeAsciiMath(s.slice(i + 1, j))})`
                i = j + 1
            } else {
                result += s[i]
                i++
            }
        } else {
            result += s[i]
            i++
        }
    }
    s = result

    s = s.replace(/\b(sin|cos|tan|sec|csc|cot|log|asin|acos|atan)\s*(abs\([^)]*\))/g, '$1($2)')
    s = s.replace(/(\d)(sin|cos|tan|sec|csc|cot|log|asin|acos|atan)\b/g, '$1*$2')

    s = s.replace(/\btan\^\(?-1\)?\(([^)]*)\)/g, 'atan($1)')
    s = s.replace(/\bsin\^\(?-1\)?\(([^)]*)\)/g, 'asin($1)')
    s = s.replace(/\bcos\^\(?-1\)?\(([^)]*)\)/g, 'acos($1)')

    s = s.replace(/\b(sin|cos|tan|sec|csc|cot|log|asin|acos|atan)\^(\([^)]+\)|-?\d+)\(([^)]*)\)/g, '($1($3))^$2')

    s = s.replace(/([a-dA-Df-zF-Z0-9])e\^/g, '$1*e^')

    return s
}

function asciiMathToLatex(ascii: string): string {
    try {
        return mathjsParse(normalizeAsciiMath(ascii)).toTex()
    } catch {
        return ascii
    }
}

export function checkSingle(input: string, expected: string): boolean {
    const cleanInput = input.trim();
    const cleanExpected = expected.trim();

    if (normalizeInterval(cleanInput) === normalizeInterval(cleanExpected)) {
        return true;
    }

    try {
        const userExpr = ce.parse(cleanInput).subs({ c: "C" });
        const expectedExpr = ce.parse(asciiMathToLatex(cleanExpected)).subs({ c: "C" });

        if (userExpr.isEqual(expectedExpr)) return true;
    } catch {
        // ignore
    }

    if (INTERVAL_PATTERN.test(cleanExpected)) {
        const inputMatch = cleanInput.match(/^\\left[\[\(](.*)\\right[\]\)]$|^[\[\(](.*)[\]\)]$/);
        const expectedMatch = cleanExpected.match(/^[\[\(](.*)[\]\)]$/);

        if (inputMatch && expectedMatch) {
            const innerInput = inputMatch[1] || inputMatch[2];
            const innerExpected = expectedMatch[1];

            const inputParts = innerInput.split(',');
            const expectedParts = innerExpected.split(',');

            if (inputParts.length === expectedParts.length && inputParts.length > 1) {
                let allPartsEqual = true;
                for (let i = 0; i < inputParts.length; i++) {
                    try {
                        const uPart = ce.parse(inputParts[i].trim()).subs({ c: "C" });
                        const ePart = ce.parse(asciiMathToLatex(expectedParts[i].trim())).subs({ c: "C" });
                        if (!uPart.isEqual(ePart)) {
                            allPartsEqual = false;
                            break;
                        }
                    } catch {
                        allPartsEqual = false;
                        break;
                    }
                }
                if (allPartsEqual) return true;
            }
        }
    }

    return false;
}

export function checkAnswer(input: string, expected: string | FreeResponseAnswer[], variables: string[]): { correct: boolean; credit: number } {
    void variables
    try {
        if (Array.isArray(expected)) {
            let inputs: string[]
            try {
                inputs = JSON.parse(input)
            } catch {
                return { correct: false, credit: 0 }
            }
            const results = expected.map((field, i) => {
                const userInput = inputs[i] ?? ''
                if (!userInput.trim()) return false
                return checkSingle(userInput, field.value)
            })
            const correctCount = results.filter(Boolean).length
            const credit = correctCount / expected.length
            return { correct: credit === 1, credit }
        }
        const correct = checkSingle(input, expected)
        return { correct, credit: correct ? 1 : 0 }
    } catch {
        return { correct: false, credit: 0 }
    }
}
