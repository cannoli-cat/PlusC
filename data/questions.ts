export type QuestionType = 'multiple-choice' | 'free-response'

export interface MultipleChoiceChoice {
    label: string
    text: string
}

export interface MultipleChoiceQuestion {
    id: string
    type: 'multiple-choice'
    section: string
    text: string
    choices: MultipleChoiceChoice[]
    answer: string
}

export interface FreeResponseQuestion {
    id: string
    type: 'free-response'
    section: string
    text: string
    solution: string
}

export type Question = MultipleChoiceQuestion | FreeResponseQuestion

export const questions: Question[] = [
    {
        id: 'q1',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Which substitution simplifes $\\int x\\sqrt{x^2+1}\\,dx$?',
        choices: [
            { label: 'A', text: '$u = x^2$' },
            { label: 'B', text: '$u = x^2 + 1$' },
            { label: 'C', text: '$u = \\sqrt{x^2 + 1}$' },
            { label: 'D', text: '$u = x + 1$' },
        ],
        answer: 'B',
    },
    {
        id: 'q2',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\frac{2x}{(x^2+1)^2}\\,dx$.',
        solution: '$\\frac{-1}{x^2+1}+C$'
    },
    {
        id: 'q3',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^1 4x^3\\sqrt{x^4+2}\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{2}{3}(3\\sqrt{3}-2)$' },
            { label: 'B', text: '$\\frac{2}{3}(3\\sqrt{3}+2)$' },
            { label: 'C', text: '$\\frac{2}{3}(\\sqrt{3}-2)$' },
            { label: 'D', text: '$\\frac{2}{3}(\\sqrt{3}+2)$' },
        ],
        answer: 'A',
    },
    {
        id: 'q4',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\frac{\\ln(x)}{x}\\,dx$.',
        solution: '$\\frac{(\\ln(x))^2}{2}+C$'
    },
    {
        id: 'q5',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_1^e \\frac{\\ln(x)}{x}\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{2}$' },
            { label: 'B', text: '$1$' },
            { label: 'C', text: '$\\frac{e}{2}$' },
            { label: 'D', text: '$e$' },
        ],
        answer: 'A',
    },
    {
        id: 'q6',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\sin(3x)\\,dx$.',
        solution: '$\\frac{-1}{3}\\cos(3x)+C$'
    },
    {
        id: 'q7',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^{\\pi} \\sin(3x)\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{2}{3}$' },
            { label: 'B', text: '$\\frac{4}{3}$' },
            { label: 'C', text: '$\\frac{1}{3}$' },
            { label: 'D', text: '$\\frac{5}{3}$' },
        ],
        answer: 'A',
    },
    {
        id: 'q8',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\cos(5x+2)\\,dx$.',
        solution: '$\\frac{1}{5}\\sin(5x+2)+C$'
    },
    {
        id: 'q9',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^{\\pi} \\cos(5x+2)\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{5}(\\sin(5\\pi+2)+\\sin(2))$' },
            { label: 'B', text: '$\\frac{1}{5}(\\sin(5\\pi+2)-\\sin(2))$' },
            { label: 'C', text: '$\\frac{1}{5}(\\sin(2)-\\sin(5\\pi+2))$' },
            { label: 'D', text: '$\\frac{1}{5}(\\sin(5\\pi+2)\\sin(2))$' },
        ],
        answer: 'B',
    },
    {
        id: 'q10',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\sec^2(4x)\\,dx$.',
        solution: '$\\frac{1}{4}\\tan(4x)+C$'
    },
    {
        id: 'q11',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^{\\pi} \\sec^2(4x)\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{4}(\\tan(4\\pi)-\\tan(0))$' },
            { label: 'B', text: '$\\frac{1}{4}(\\tan(4\\pi)+\\tan(0))$' },
            { label: 'C', text: '$\\frac{1}{4}(\\tan(0)-\\tan(4\\pi))$' },
            { label: 'D', text: '$0$' },
        ],
        answer: 'D',
    },
    {
        id: 'q12',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\csc^2(7x-1)\\,dx$.',
        solution: '$\\frac{-1}{7}\\cot(7x-1)+C$'
    },
    {
        id: 'q13',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^{\\pi} \\csc^2(7x-1)\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{7}(\\cot(-1)-\\cot(7\\pi-1))$' },
            { label: 'B', text: '$\\frac{1}{7}(\\cot(7\\pi-1)-\\cot(-1))$' },
            { label: 'C', text: '$\\frac{1}{7}(\\cot(-1)+\\cot(7\\pi-1))$' },
            { label: 'D', text: '$\\frac{1}{7}(\\cot(7\\pi-1)+\\cot(-1))$' },
        ],
        answer: 'B',
    },
    {
        id: 'q14',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\sec(3x)\\tan(3x)\\,dx$.',
        solution: '$\\frac{1}{3}\\sec(3x)+C$'
    },
    {
        id: 'q15',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^{\\pi} \\sec(3x)\\tan(3x)\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{3}(\\sec(3\\pi)-\\sec(0))$' },
            { label: 'B', text: '$\\frac{1}{3}(\\sec(3\\pi)+\\sec(0))$' },
            { label: 'C', text: '$\\frac{1}{3}(\\sec(0)-\\sec(3\\pi))$' },
            { label: 'D', text: '$0$' },
        ],
        answer: 'C',
    },
    {
        id: 'q16',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\csc(5x)\\cot(5x)\\,dx$.',
        solution: '$\\frac{1}{5}\\csc(5x)+C$'
    },
    {
        id: 'q17',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_0^{\\pi} \\csc(5x)\\cot(5x)\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{5}(\\csc(5\\pi)-\\csc(0))$' },
            { label: 'B', text: '$\\frac{1}{5}(\\csc(5\\pi)+\\csc(0))$' },
            { label: 'C', text: '$\\frac{1}{5}(\\csc(0)-\\csc(5\\pi))$' },
            { label: 'D', text: '$0$' },
        ],
        answer: 'C',
    },
    {
        id: 'q18',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\frac{\\ln(2x)}{x}\\,dx$.',
        solution: '$\\frac{(\\ln(2x))^2}{2}-\\frac{(\\ln(2))^2}{2}+C$'
    },
    {
        id: 'q19',
        type: 'multiple-choice',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int_1^e \\frac{\\ln(2x)}{x}\\,dx$.',
        choices: [
            { label: 'A', text: '$\\frac{1}{2}+(\\ln(2))^2$' },
            { label: 'B', text: '$\\frac{1}{2}-(\\ln(2))^2$' },
            { label: 'C', text: '$\\frac{1}{2}$' },
            { label: 'D', text: '$\\frac{1}{2}+\\ln(2)$' },
        ],
        answer: 'A',
    },
    {
        id: 'q20',
        type: 'free-response',
        section: '§5.5. Substitution Rule',
        text: 'Evaluate $\\int \\frac{\\ln(x^2+1)}{x}\\,dx$.',
        solution: '$\\frac{1}{2}(\\ln(x^2+1))^2+C$'
    }
]