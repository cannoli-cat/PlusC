# Plus C

A Calculus practice tool built for Calculus 1 (MAT265) and Calculus 2 (MAT266) at ASU.

Generate timed practice tests from a question bank covering a variety of topics from Calculus 1 and 2. Questions include multiple choice, select-all, and free response with symbolic answer checking.

## Features

- Course selection: MAT 265 or MAT 266
- Configurable tests by section, question count, and time limit
- Section weighting: star priority sections and set what percentage of questions should draw from them
- Three question types: multiple choice, select-all, and free response
- Symbolic answer grading for free response, equivalent forms accepted
- Solutions revealed on a full review, with a score breakdown showing full credit, partial credit, and point totals
- Retry mode: locked correct answers persist across attempts
- LaTeX rendering via KaTeX

## Stack

- Next.js / TypeScript
- MathLive for math input fields
- Cortex JS Compute Engine for symbolic answer evaluation
- KaTeX for math rendering

[Try it out!](https://plusc.vercel.app/)
