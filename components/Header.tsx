export default function Header() {
    return (
        <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '28px', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.01em' }}>Plus C</h1>
            <p style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '8px' }}>
                by Tyler Wolfe
            </p>
            <p style={{ fontSize: '16px', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '4px' }}>
                A calculus study tool
            </p>
        </header>
    )
}
