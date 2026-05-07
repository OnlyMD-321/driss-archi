import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusColor = { available: '#10b981', assigned: '#3b82f6', maintenance: '#f59e0b', returned: '#64748b' };
const statusLabel = { available: 'Disponible', assigned: 'Affecté', maintenance: 'Maintenance', returned: 'Retourné' };

const ResourceList = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ inventory_number: '', resource_type: 'ordinateur', brand: '', warranty_end: '' });
    const [error, setError] = useState('');

    const load = () => api.get('/resources').then(r => setResources(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const filtered = filter === 'all' ? resources : resources.filter(r => r.status === filter || r.resource_type === filter);

    const handleCreate = async e => {
        e.preventDefault(); setError('');
        try {
            await api.post('/resources', form);
            setShowForm(false);
            setForm({ inventory_number: '', resource_type: 'ordinateur', brand: '', warranty_end: '' });
            load();
        } catch (err) { setError(err.response?.data?.error || 'Erreur'); }
    };

    if (loading) return <div style={s.loading}>Chargement...</div>;

    return (
        <div>
            <div style={s.header}>
                <h2 style={s.title}>Ressources matérielles</h2>
                {user?.role === 'responsable' && (
                    <button onClick={() => setShowForm(!showForm)} style={s.btn}>
                        {showForm ? 'Annuler' : '+ Nouvelle ressource'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreate} style={s.form}>
                    {error && <div style={s.error}>{error}</div>}
                    <div style={s.row}>
                        <div style={{ flex: 1 }}>
                            <label style={s.label}>N° Inventaire</label>
                            <input style={s.input} required value={form.inventory_number} onChange={e => setForm({ ...form, inventory_number: e.target.value })} placeholder="INV-2024-001" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={s.label}>Type</label>
                            <select style={s.input} value={form.resource_type} onChange={e => setForm({ ...form, resource_type: e.target.value })}>
                                <option value="ordinateur">Ordinateur</option>
                                <option value="imprimante">Imprimante</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={s.label}>Marque</label>
                            <input style={s.input} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Dell, HP..." />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={s.label}>Fin garantie</label>
                            <input style={s.input} type="date" value={form.warranty_end} onChange={e => setForm({ ...form, warranty_end: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" style={s.submitBtn}>Créer la ressource</button>
                </form>
            )}

            <div style={s.filters}>
                {['all', 'ordinateur', 'imprimante', 'available', 'assigned', 'maintenance'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{ ...s.filterBtn, background: filter === f ? '#3b82f6' : '#e2e8f0', color: filter === f ? '#fff' : '#374151' }}>
                        {f === 'all' ? 'Tous' : f}
                    </button>
                ))}
            </div>

            <div style={s.table}>
                <div style={s.tableHeader}>
                    <span>N° Inventaire</span><span>Type</span><span>Marque</span>
                    <span>Statut</span><span>Département</span><span>Garantie</span>
                </div>
                {filtered.map(r => (
                    <Link key={r.id} to={`/resources/${r.id}`} style={s.tableRow}>
                        <span style={s.mono}>{r.inventory_number}</span>
                        <span style={s.capitalize}>{r.resource_type}</span>
                        <span>{r.brand || '—'}</span>
                        <span><span style={{ ...s.badge, background: statusColor[r.status] }}>{statusLabel[r.status]}</span></span>
                        <span>{r.department_name || '—'}</span>
                        <span>{r.warranty_end ? new Date(r.warranty_end).toLocaleDateString('fr-FR') : '—'}</span>
                    </Link>
                ))}
                {filtered.length === 0 && <div style={s.empty}>Aucune ressource trouvée.</div>}
            </div>
        </div>
    );
};

const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
    btn: { padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    form: { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    error: { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 14 },
    row: { display: 'flex', gap: 12, marginBottom: 12 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    submitBtn: { padding: '9px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    filters: { display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    filterBtn: { padding: '6px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
    table: { background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', padding: '12px 20px', background: '#f8fafc', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
    tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderTop: '1px solid #f1f5f9', fontSize: 14, color: '#1e293b', textDecoration: 'none', alignItems: 'center' },
    badge: { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 600 },
    mono: { fontFamily: 'monospace', fontSize: 13, color: '#3b82f6' },
    capitalize: { textTransform: 'capitalize' },
    empty: { padding: 40, textAlign: 'center', color: '#94a3b8' },
};

export default ResourceList;
