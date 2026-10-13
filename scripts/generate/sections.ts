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
        label: '§10.1. Three-Dimensional Coordinate Systems',
        topics: `- Plotting points and identifying coordinate planes and octants
- Describing regions in R^3 given by equations or inequalities (e.g. z = 3, y >= 0, x^2 + y^2 = 4 in space)
- Distance between two points in space
- Midpoint of a segment
- Equation of a sphere from center and radius
- Finding center and radius by completing the square
- Projections of a point onto the coordinate planes`,
    },
    {
        course: '267',
        id: '10.2',
        label: '§10.2. Vectors',
        topics: `- Component form of a vector from initial and terminal points
- Vector addition, subtraction, and scalar multiplication (algebraic and geometric)
- Magnitude (length) of a vector in 2D and 3D
- Unit vectors and vectors of a given length in a given direction
- Writing vectors with i, j, k
- Resultant force and other applied problems (forces, velocities)`,
    },
    {
        course: '267',
        id: '10.3',
        label: '§10.3. The Dot Product',
        topics: `- Computing dot products from components and from |a||b|cos(theta)
- Angle between two vectors
- Deciding whether vectors are orthogonal, parallel, or neither
- Direction cosines and direction angles
- Scalar projection comp_a(b) and vector projection proj_a(b)
- Work done by a constant force: W = F · D`,
    },
    {
        course: '267',
        id: '10.4',
        label: '§10.4. The Cross Product',
        topics: `- Computing a × b with the determinant
- Finding a vector orthogonal to two given vectors
- Properties: a × b = -(b × a), a × a = 0, i × j = k, etc.
- Area of a parallelogram or triangle
- Scalar triple product, volume of a parallelepiped, coplanarity test
- Torque`,
    },
    {
        course: '267',
        id: '10.5',
        label: '§10.5. Equations of Lines and Planes',
        topics: `- Vector, parametric, and symmetric equations of a line
- Line through two points; where a line meets a coordinate plane
- Deciding whether two lines are parallel, intersecting, or skew
- Equation of a plane from a point and a normal vector, or from three points
- Angle between two planes; parallel and perpendicular planes
- Line of intersection of two planes
- Distance from a point to a plane, and between parallel planes`,
    },
    {
        course: '267',
        id: '10.7',
        label: '§10.7. Vector Functions and Space Curves',
        topics: `- Domain of a vector function
- Limits of vector functions
- Matching vector equations to space curves
- Derivatives of vector functions, tangent vectors, unit tangent vector
- Parametric equations of the tangent line at a point
- Integrals of vector functions; solving r'(t) = f(t) with an initial condition`,
    },
    {
        course: '267',
        id: '10.8',
        label: '§10.8. Arc Length',
        topics: `- Arc length of a space curve: L = integral of |r'(t)| dt
- Choosing curves whose |r'(t)| simplifies (perfect squares, helices)
- Arc length function s(t)
- Reparametrizing a curve with respect to arc length`,
    },
    {
        course: '267',
        id: '10.9',
        label: '§10.9. Motion in Space: Velocity and Acceleration',
        topics: `- Velocity, speed, and acceleration from a position function
- Finding position from acceleration with initial velocity and position
- Projectile motion: range, maximum height, time of flight, launch angle
- Force from acceleration (F = ma)
- Tangential and normal components of acceleration`,
    },
]

export function findSection(course: string, id: string): SectionSpec | undefined {
    return sections.find(s => s.course === course && s.id === id)
}
