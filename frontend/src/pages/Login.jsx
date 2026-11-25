import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/profil');
        } catch (err) {
            setError(err.response?.data?.message || 'Hibás adatok.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2>Bejelentkezés</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Jelszó" required onChange={e => setPassword(e.target.value)} />
            <button type="submit">Bejelentkezés</button>
        </form>
    );
}