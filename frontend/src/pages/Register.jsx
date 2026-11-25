import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/reg', form);
            alert('Sikeres regisztráció! Most jelentkezz be.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Hiba történt.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2>Regisztráció</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input type="text" placeholder="Felhasználónév" required onChange={e => setForm({ ...form, username: e.target.value })} />
            <input type="email" placeholder="Email" required onChange={e => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Jelszó" required onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="submit">Regisztráció</button>
        </form>
    );
}