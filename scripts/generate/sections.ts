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
]

export function findSection(course: string, id: string): SectionSpec | undefined {
    return sections.find(s => s.course === course && s.id === id)
}
