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
]