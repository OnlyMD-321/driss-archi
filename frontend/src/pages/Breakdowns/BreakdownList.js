import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusColor = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#10b981', returned_to_supplier: '#64748b' };
const statusLabel = { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', returned_to_supplier: 'Retourné fournisseur' };

const BreakdownList = () => {
    const { user } = useAuth();
    const [breakdowns, setBreakdowns] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ resource_id: '', description: '' });

    const load = () => api.get('/breakdowns').then(r => setBreakdowns(r.data)).finally(() => setLoading(false));
    useEffect(() => {
        load();
        if (['enseignant', 'chef_departement'].includes(user?.role))
            api.get('/resources').then(r => setResources(r.data.filter(x => x.status === 'assigned' || x.status === 'available')));
    }, []);

    const handleReport = async e => {
        e.preventDefault();
        try {
            await api.post('/breakdowns', form);
            setShowForm(false);
            setForm({ resource_id: '', description: '' });
            load();
        } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
    };

    if (loading) return <div style={s.loading}>Chargement...</div>;

    return (
        <div>
            <div style={s.header}>
                <h2 style={s.title}>Pannes et maintenance</h2>
                {['enseignant', 'chef_departement'].includes(user?.role) && (
                    <button onClick={() => setShowForm(!showForm)} style={s.btn}>
                        {showForm ? 'Annuler' : '+ Signaler une panne'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleReport} style={s.form}>
                    <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600, color: '#374151' }}>Signaler une panne</h3>
                    <label style={s.label}>Ressource</label>
                    <select style={s.input} required value={form.resource_id} onChange={e => setForm({ ...form, resource_id: e.target.value })}>
                        <option value="">Sélectionner une ressource...</option>
                        {resources.map(r => <option key={r.id} value={r.id}>{r.inventory_number} — {r.brand} ({r.resource_type})</option>)}
                    </select>
                    <label style={{ ...s.label, marginTop: 12 }}>Description de la panne</label>
                    <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} required
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Décrivez la panne observée..." />
                    <button type="submit" style={s.submitBtn}>Envoyer le signalement</button>
                </form>
            )}

            <div style={s.list}>
                {breakdowns.map(b => (
                    <Link key={b.id} to={`/breakdowns/${b.id}`} style={s.card}>
                        <div style={s.cardTop}>
                            <div>
                                <span style={s.mono}>{b.inventory_number}</span>
                                <span style={s.brand}> — {b.brand} ({b.resource_type})</span>
                            </div>
                            <span style={{ ...s.badge, background: statusColor[b.status] }}>
                                {statusLabel[b.status]}
                            </span>
                        </div>
                        <p style={s.description}>{b.description}</p>
                        <p style={s.meta}>
                            Signalé par {b.reported_by_name} le {new Date(b.reported_at).toLocaleDateString('fr-FR')}
                            {b.order_type && ` • ${b.order_type} • ${b.frequency}`}
                        </p>
                    </Link>
                ))}
                {breakdowns.length === 0 && <div style={s.empty}>Aucune panne signalée.</div>}
            </div>
        </div>
    );
};

const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
    btn: { padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    form: { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    submitBtn: { marginTop: 12, padding: '9px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    list: { display: 'flex', flexDirection: 'column', gap: 12 },
    card: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'block', border: '1px solid #e2e8f0' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    mono: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#3b82f6' },
    brand: { fontSize: 14, color: '#1e293b' },
    badge: { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 600 },
    description: { fontSize: 14, color: '#374151', marginBottom: 6 },
    meta: { fontSize: 12, color: '#94a3b8' },
    empty: { textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 16, background: '#fff', borderRadius: 8 },
};

export default BreakdownList;
