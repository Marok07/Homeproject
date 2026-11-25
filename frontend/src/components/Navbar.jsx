import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#222', color: '#fff' }}>
            <div>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>HOMEPROJECT</Link>
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span>Felhasználó: <strong>{user ? user.username : 'Vendég'}</strong></span>
                {!user ? (
                    <>
                        <Link to="/reg" style={{ color: '#fff' }}>Regisztráció</Link>
                        <Link to="/login" style={{ color: '#fff' }}>Bejelentkezés</Link>
                    </>
                ) : (
                    <>
                        <Link to="/profil" style={{ color: '#fff' }}>Profil</Link>
                        <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Kijelentkezés</button>
                    </>
                )}
            </div>
        </nav>
    );
}