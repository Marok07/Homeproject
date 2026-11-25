export default function Footer() {
    return (
        <footer style={{ textAlign: 'center', padding: '1rem', background: '#eee', marginTop: 'auto' }}>
            <p>&copy; {new Date().getFullYear()} HOMEPROJECT - Minden jog fenntartva.</p>
        </footer>
    );
}