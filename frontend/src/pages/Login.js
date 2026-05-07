import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch {
            setError('Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h1 style={s.title}>⚙ GRM</h1>
                <p style={s.subtitle}>Gestion des Ressources Matérielles</p>
                {error && <div style={s.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={s.field}>
                        <label style={s.label}>Email</label>
                        <input style={s.input} type="email" value={email}
                            onChange={e => setEmail(e.target.value)} required placeholder="votre@email.ma" />
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Mot de passe</label>
                        <input style={s.input} type="password" value={password}
                            onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                    </div>
                    <button style={s.btn} type="submit" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
                <div style={s.hint}>
                    <p>Comptes de test (mot de passe: <strong>admin123</strong>):</p>
                    <p>responsable@faculte.ma | chef.info@faculte.ma</p>
                    <p>ahmed.benali@faculte.ma | tech@faculte.ma</p>
                </div>
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
                    Fournisseur ? <Link to="/register-supplier" style={{ color: '#3b82f6' }}>S'inscrire</Link>
                </p>
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)' },
    card: { background: '#fff', padding: 40, borderRadius: 12, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    title: { textAlign: 'center', fontSize: 32, color: '#1e293b', marginBottom: 4 },
    subtitle: { textAlign: 'center', color: '#64748b', marginBottom: 28, fontSize: 14 },
    error: { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
    field: { marginBottom: 16 },
    label: { display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#374151' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, outline: 'none' },
    btn: { width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
    hint: { marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 6, fontSize: 11, color: '#64748b', lineHeight: 1.8 },
};

export default Login;
