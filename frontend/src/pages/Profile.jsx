import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profil');
                setProfileData(res.data);
            } catch (err) {
                setError('Nem sikerült betölteni a profilt. Jelentkezz be újra!');
            }
        };
        fetchProfile();
    }, []);

    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
    if (!profileData) return <p style={{ textAlign: 'center' }}>Betöltés...</p>;

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc' }}>
            <h2>Felhasználói Profil</h2>
            <p><strong>ID:</strong> {profileData.id}</p>
            <p><strong>Felhasználónév:</strong> {profileData.username}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Regisztráció ideje:</strong> {new Date(profileData.created_at).toLocaleString('hu-HU')}</p>
        </div>
    );
}