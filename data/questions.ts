import { questions265 } from './265'
import { questions266 } from './266'

export interface Course {
    id: string
    name: string
    questions: Question[]
}

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

export interface FreeResponseAnswer {
    label: string
    value: string
}

export interface FreeResponseQuestion {
    id: string
    type: 'free-response'
    section: string
    text: string
    answer: string | FreeResponseAnswer[]
    variables?: string[]
    solution: string
}

export type Question = MultipleChoiceQuestion | SelectAllQuestion | FreeResponseQuestion

export const courses: Course[] = [
    { id: '265', name: 'MAT 265: Calculus for Engineers I', questions: questions265 },
    { id: '266', name: 'MAT 266: Calculus for Engineers II', questions: questions266 },
    //{ id: '267', name: 'MAT 267: Calculus for Engineers III', questions: [] }
]

export function getCourse(id: string | null): Course {
    const course = courses.find(course => course.id === id)
    return course ?? courses[0]
}

export function getSections(id: string): string[] {
    const questions = getCourse(id).questions
    return [...new Set(questions.map((q) => q.section))].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
    )
}
