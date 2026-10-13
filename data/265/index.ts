import type { Question } from '../questions'
import limits from './1.3-limits.json'
import calculatingLimits from './1.4-calculating-limits.json'
import continuity from './1.5-continuity.json'
import limitsInvolvingInf from './1.6-limits-involving-infinity.json'
import derivsRatesOfChanges from './2.1-derivatives-and-rates-of-change.json'
import derivsAsFuncs from './2.2-derivatives-as-functions.json'
import basicDifferentiationFormulas from './2.3-basic-differentiation-formulas.json'
import productQuotientRules from './2.4-product-and-quotient-rules.json'
import chainRule from './2.5-chain-rule.json'
import implicitDifferentiation from './2.6-implicit-differentiation.json'
import relatedRates from './2.7-related-rates.json'
import linearApproxDifferentials from './2.8-linear-approximation-and-differentials.json'
import expFuncs from './3.1-exponential-functions.json'
import inverseFuncsLogs from './3.2-inverse-functions-and-logarithms.json'
import derivLogExp from './3.3-derivatives-of-log-and-exp-functions.json'
import expGrowthDecay from './3.4-exponential-growth-and-decay.json'
import inverseTrig from './3.5-inverse-trig-functions.json'
import lhopitals from './3.7-lhospitals-rule.json'
import minMaxValues from './4.1-maximum-and-minimum-values.json'
import meanValueTheorem from './4.2-mean-value-theorem.json'
import derivativesShapesOfGraphs from './4.3-derivatives-and-shapes-of-graphs.json'
import curveSketching from './4.4-curve-sketching.json'
import optimizationProblems from './4.5-optimization-problems.json'
import antiderivatives from './4.7-antiderivatives.json'
import areasDistances from './5.1-areas-and-distances.json'
import definiteIntegrals from './5.2-definite-integrals.json'
import evaluatingDefInt from './5.3-evaluating-definite-integrals.json'
import fundamentalTheoremOfCalculus from './5.4-fundamental-theorem-of-calculus.json'


export const questions265 = [
    ...limits,
    ...calculatingLimits,
    ...continuity,
    ...limitsInvolvingInf,
    ...derivsRatesOfChanges,
    ...derivsAsFuncs,
    ...basicDifferentiationFormulas,
    ...productQuotientRules,
    ...chainRule,
    ...implicitDifferentiation,
    ...relatedRates,
    ...linearApproxDifferentials,
    ...expFuncs,
    ...inverseFuncsLogs,
    ...derivLogExp,
    ...expGrowthDecay,
    ...inverseTrig,
    ...lhopitals,
    ...minMaxValues,
    ...meanValueTheorem,
    ...derivativesShapesOfGraphs,
    ...curveSketching,
    ...optimizationProblems,
    ...antiderivatives,
    ...areasDistances,
    ...definiteIntegrals,
    ...evaluatingDefInt,
    ...fundamentalTheoremOfCalculus
] as Question[]
