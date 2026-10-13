import type { Question } from '../questions'
import uSub from './5.5-u-substitution.json'
import intByParts from './6.1-integration-by-parts.json'
import trigSub from './6.2-trigonometric-integrals-and-trig-substitution.json'
import partialFracDecomp from './6.3-partial-fraction-decomposition.json'
import approxIntegration from './6.5-approximate-integration.json'
import improperIntegrals from './6.6-improper-integrals.json'
import areasBetweenCurves from './7.1-areas-between-curves.json'
import volumesDiskWasher from './7.2-volumes-disk-and-washer-method.json'
import volumesCylindrical from './7.3-volumes-cylindrical-shells.json'
import arcLength from './7.4-arc-length.json'
import workPhysicsApps from './7.6-work-physics-applications.json'
import sequences from './8.1-sequences.json'
import series from './8.2-series.json'
import otherConvTests from './8.4-other-convergence-tests.json'
import powerSeries from './8.5-power-series.json'
import reprFuncsPowerSeries from './8.6-representing-functions-as-power-series.json'
import taylorMaclaurinSeries from './8.7-taylor-and-maclaurin-series.json'
import parametricCurves from './9.1-parametric-curves.json'
import calcWithParametricCurves from './9.2-calculus-with-parametric-curves.json'
import polarCoords from './9.3-polar-coordinates.json'
import areasLengthsPolarCoords from './9.4-areas-and-lengths-in-polar-coordinates.json'

export const questions266 = [
    ...uSub,
    ...intByParts,
    ...trigSub,
    ...partialFracDecomp,
    ...approxIntegration,
    ...improperIntegrals,
    ...areasBetweenCurves,
    ...volumesDiskWasher,
    ...volumesCylindrical,
    ...arcLength,
    ...workPhysicsApps,
    ...sequences,
    ...series,
    ...otherConvTests,
    ...powerSeries,
    ...reprFuncsPowerSeries,
    ...taylorMaclaurinSeries,
    ...parametricCurves,
    ...calcWithParametricCurves,
    ...polarCoords,
    ...areasLengthsPolarCoords
] as Question[]
