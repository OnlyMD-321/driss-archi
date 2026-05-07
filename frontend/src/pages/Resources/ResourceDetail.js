import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ResourceDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [resource, setResource] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [members, setMembers] = useState([]);
    const [assignForm, setAssignForm] = useState({ department_id: '', assigned_user_id: '' });
    const [loading, setLoading] = useState(true);

    const load = () => api.get(`/resources/${id}`)
        .then(r => setResource(r.data))
        .finally(() => setLoading(false));

    useEffect(() => {
        load();
        api.get('/departments').then(r => setDepartments(r.data));
    }, [id]);

    useEffect(() => {
        if (assignForm.department_id)
            api.get(`/departments/${assignForm.department_id}/members`).then(r => setMembers(r.data));
    }, [assignForm.department_id]);

    const handleAssign = async e => {
        e.preventDefault();
        try {
            await api.post(`/resources/${id}/assign`, assignForm);
            load();
            alert('Ressource affectée avec succès');
        } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
    };

    if (loading) return <div style={s.loading}>Chargement...</div>;
    if (!resource) return <div>Ressource introuvable.</div>;

    const statusColor = { available: '#10b981', assigned: '#3b82f6', maintenance: '#f59e0b', returned: '#64748b' };

    return (
        <div>
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>{resource.inventory_number}</h2>
                    <span style={{ ...s.badge, background: statusColor[resource.status] }}>{resource.status}</span>
                </div>
            </div>

            <div style={s.grid}>
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Détails</h3>
                    <table style={s.infoTable}>
                        <tbody>
                            {[
                                ['Type', resource.resource_type],
                                ['Marque', resource.brand || '—'],
                                ['Fournisseur', resource.supplier_name || '—'],
                                ['Garantie', resource.warranty_end ? new Date(resource.warranty_end).toLocaleDateString('fr-FR') : '—'],
                            ].map(([k, v]) => (
                                <tr key={k}><td style={s.tdKey}>{k}</td><td style={s.tdVal}>{v}</td></tr>
                            ))}
                            {resource.specs && Object.entries(resource.specs).map(([k, v]) => v && (
                                <tr key={k}><td style={s.tdKey}>{k}</td><td style={s.tdVal}>{v}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {user?.role === 'responsable' && (
                    <div style={s.card}>
                        <h3 style={s.cardTitle}>Affecter la ressource</h3>
                        <form onSubmit={handleAssign}>
                            <label style={s.label}>Département</label>
                            <select style={s.input} value={assignForm.department_id} onChange={e => setAssignForm({ ...assignForm, department_id: e.target.value, assigned_user_id: '' })}>
                                <option value="">Sélectionner...</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            {members.length > 0 && (
                                <>
                                    <label style={{ ...s.label, marginTop: 12 }}>Personne (optionnel)</label>
                                    <select style={s.input} value={assignForm.assigned_user_id} onChange={e => setAssignForm({ ...assignForm, assigned_user_id: e.target.value })}>
                                        <option value="">Département entier</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                                    </select>
                                </>
                            )}
                            <button type="submit" style={{ ...s.btn, marginTop: 12 }} disabled={!assignForm.department_id}>
                                Affecter
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div style={s.card}>
                <h3 style={s.cardTitle}>Historique des affectations</h3>
                {resource.assignments?.length === 0 ? (
                    <p style={s.empty}>Aucune affectation.</p>
                ) : (
                    resource.assignments?.map(a => (
                        <div key={a.id} style={{ ...s.historyItem, background: a.is_active ? '#f0fdf4' : '#f8fafc' }}>
                            <strong>{a.department_name}</strong>
                            {a.user_name && ` → ${a.user_name}`}
                            <span style={s.date}>{new Date(a.assigned_date).toLocaleDateString('fr-FR')}</span>
                            {a.is_active && <span style={s.activeTag}>Actuelle</span>}
                        </div>
                    ))
                )}
            </div>

            {resource.breakdowns?.length > 0 && (
                <div style={{ ...s.card, marginTop: 16 }}>
                    <h3 style={s.cardTitle}>Pannes signalées</h3>
                    {resource.breakdowns.map(b => (
                        <div key={b.id} style={s.historyItem}>
                            <strong>{b.description}</strong>
                            <span style={s.date}>{new Date(b.reported_at).toLocaleDateString('fr-FR')}</span>
                            <span style={{ ...s.tag, background: b.status === 'resolved' ? '#dcfce7' : '#fef3c7', color: b.status === 'resolved' ? '#16a34a' : '#d97706' }}>
                                {b.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const s = {
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
    badge: { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    card: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
    infoTable: { width: '100%', borderCollapse: 'collapse' },
    tdKey: { padding: '6px 0', color: '#64748b', fontSize: 13, width: '40%' },
    tdVal: { padding: '6px 0', color: '#1e293b', fontSize: 14, fontWeight: 500 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    btn: { padding: '9px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'block' },
    historyItem: { padding: '10px 14px', borderRadius: 6, marginBottom: 8, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
    date: { marginLeft: 'auto', fontSize: 12, color: '#64748b' },
    activeTag: { background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 },
    tag: { padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 },
    empty: { color: '#94a3b8', fontSize: 14 },
};

export default ResourceDetail;
