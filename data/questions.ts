import rawQuestions from './questions.json'

export type QuestionType = 'multiple-choice' | 'free-response' | 'select-all'

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
    solution?: string
}

export interface SelectAllQuestion {
    id: string
    type: 'select-all'
    section: string
    text: string
    choices: MultipleChoiceChoice[]
    answers: string[]
    solution?: string
}

export interface FreeResponseQuestion {
    id: string
    type: 'free-response'
    section: string
    text: string
    answer: string
    variables?: string[]
    solution: string
}

export type Question = MultipleChoiceQuestion | SelectAllQuestion | FreeResponseQuestion

export const questions: Question[] = rawQuestions as Question[]