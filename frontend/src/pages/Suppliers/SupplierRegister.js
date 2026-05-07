import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const SupplierRegister = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', company_name: '', location: '', address: '', website: '', manager_name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            await api.post('/auth/register-supplier', form);
            alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Erreur lors de l'inscription");
        } finally { setLoading(false); }
    };

    const f = (key, label, type = 'text', placeholder = '') => (
        <div style={s.field}>
            <label style={s.label}>{label}</label>
            <input style={s.input} type={type} placeholder={placeholder} value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })} />
        </div>
    );

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h1 style={s.title}>Inscription Fournisseur</h1>
                <p style={s.subtitle}>Créez votre compte pour accéder aux appels d'offre</p>
                {error && <div style={s.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <h3 style={s.section}>Compte utilisateur</h3>
                    {f('name', 'Nom complet', 'text', 'Prénom Nom')}
                    {f('email', 'Email', 'email', 'contact@societe.ma')}
                    {f('password', 'Mot de passe', 'password', '••••••••')}
                    <h3 style={s.section}>Informations société</h3>
                    {f('company_name', 'Nom de la société', 'text', 'SARL Mon Entreprise')}
                    {f('location', 'Ville', 'text', 'Casablanca')}
                    {f('address', 'Adresse', 'text', '123 Rue Mohammed V')}
                    {f('website', 'Site web', 'url', 'https://www.societe.ma')}
                    {f('manager_name', 'Nom du gérant', 'text', 'Prénom Nom')}
                    <button type="submit" style={s.btn} disabled={loading}>
                        {loading ? 'Inscription...' : "S'inscrire"}
                    </button>
                </form>
                <p style={s.link}><Link to="/login" style={{ color: '#3b82f6' }}>← Retour à la connexion</Link></p>
            </div>
        </div>
    );
};

const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)', padding: 24 },
    card: { background: '#fff', padding: 40, borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    title: { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4, textAlign: 'center' },
    subtitle: { textAlign: 'center', color: '#64748b', marginBottom: 24, fontSize: 13 },
    error: { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
    section: { fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: '20px 0 12px', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 },
    field: { marginBottom: 12 },
    label: { display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#374151' },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    btn: { width: '100%', padding: 12, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 12 },
    link: { textAlign: 'center', marginTop: 16, fontSize: 13 },
};

export default SupplierRegister;
