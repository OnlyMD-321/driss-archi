import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StatCard = ({ title, value, color, to }) => (
    <Link to={to} style={{ ...s.card, borderTop: `4px solid ${color}`, textDecoration: 'none' }}>
        <p style={s.cardTitle}>{title}</p>
        <p style={{ ...s.cardValue, color }}>{value}</p>
    </Link>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ tenders: 0, resources: 0, suppliers: 0, breakdowns: 0 });

    useEffect(() => {
        Promise.all([
            api.get('/tenders').catch(() => ({ data: [] })),
            api.get('/resources').catch(() => ({ data: [] })),
            api.get('/suppliers').catch(() => ({ data: [] })),
            api.get('/breakdowns').catch(() => ({ data: [] })),
        ]).then(([t, r, s, b]) => setStats({
            tenders: t.data.length,
            resources: r.data.length,
            suppliers: s.data.length,
            breakdowns: b.data.filter(x => x.status === 'open').length,
        }));
    }, []);

    return (
        <div>
            <h2 style={s.title}>Bonjour, {user?.name}</h2>
            <p style={s.sub}>Bienvenue sur le système de gestion des ressources matérielles</p>
            <div style={s.grid}>
                <StatCard title="Appels d'offre" value={stats.tenders} color="#3b82f6" to="/tenders" />
                <StatCard title="Ressources" value={stats.resources} color="#10b981" to="/resources" />
                <StatCard title="Fournisseurs" value={stats.suppliers} color="#f59e0b" to="/suppliers" />
                <StatCard title="Pannes ouvertes" value={stats.breakdowns} color="#ef4444" to="/breakdowns" />
            </div>
        </div>
    );
};

const s = {
    title: { fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 },
    sub: { color: '#64748b', marginBottom: 32, fontSize: 15 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 },
    card: { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'block' },
    cardTitle: { fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    cardValue: { fontSize: 36, fontWeight: 700 },
};

export default Dashboard;
