export interface SectionSpec {
    course: string
    id: string
    label: string
    topics: string
}

export const sections: SectionSpec[] = [
    {
        course: '267',
        id: '10.1',
        label: '§10.1. 3D Rectangular Coordinates',
        topics: `- Projections of a point onto the xy-, yz-, and xz-planes
- Distance from a point to a coordinate plane (the absolute value of one coordinate)
- Distance from a point to a coordinate axis (e.g. to the x-axis is sqrt(y^2 + z^2))
- Comparing several points: which is closest to / farthest from a coordinate plane, which lies on a plane
- Distance between two points; deciding whether three points are collinear by comparing the three pairwise distances
- Classifying linear equations in R^3 as a vertical plane, a horizontal plane, or neither (e.g. z = c vs x = c vs ax + by = c vs equations involving z and another variable)
- Equation of a sphere from its center and radius, from the endpoints of a diameter, or from its center and a point it passes through
- Largest sphere with a given center that fits inside the first octant (radius = smallest coordinate)
- Center and radius of a sphere by completing the square
- Intersection of a sphere with a plane like z = k (a circle: find its radius or equation)
- Inequality describing a solid ball
- Identifying a sphere's center and radius from an equation in expanded or standard form`,
    },
    {
        course: '267',
        id: '10.2',
        label: '§10.2. Vectors',
        topics: `- Vector arithmetic in 2D and 3D: sums, differences, scalar multiples, and linear combinations like 3a + 4b
- Magnitude of a vector; converting between i, j, k notation and component form
- The vector PQ from two points; deciding whether two vectors AB and PQ are equivalent
- Terminal point of a vector placed at a given initial point, and the reverse: initial point from the terminal point and the components
- Unit vector in the same direction as a vector, and in the opposite direction
- Vector with a given length in the same or opposite direction as a vector
- Solving a vector equation for an unknown vector
- Writing a vector as a linear combination of two given vectors (solve for the two scalars)
- Lengths of the diagonals of a parallelogram spanned by two vectors
- Displacement vectors and distances between two objects in 3D given their positions
- Relative velocity and resultant velocity: combining two velocity vectors; resultant speed and direction angle
- Navigation with wind or current: finding a heading or a required speed
- Statics: tensions in ropes or wires holding an object at rest (forces summing to zero)
- Vector relationships in a rectangular box described in words (which vector sums and differences are equal)
For angles, ask for an exact expression such as \\arctan(3/2) rather than a decimal. When a vector is the answer, use multi-part with one blank per component.`,
    },
]

export function findSection(course: string, id: string): SectionSpec | undefined {
    return sections.find(s => s.course === course && s.id === id)
}
