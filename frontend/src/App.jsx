import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" />;
};

const Home = () => (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h1>Üdvözöljük a HOMEPROJECT oldalon!</h1>
        <p>Válasszon a fenti menüpontok közül a folytatáshoz.</p>
    </div>
);

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Navbar />
                    <main style={{ flex: 1, padding: '1rem' }}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/reg" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/profil" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}