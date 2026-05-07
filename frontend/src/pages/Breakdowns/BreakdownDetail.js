import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BreakdownDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [breakdown, setBreakdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportForm, setReportForm] = useState({ breakdown_explanation: '', appearance_date: '', frequency: 'rare', order_type: 'materiel', can_repair: false });
    const [showReportForm, setShowReportForm] = useState(false);

    const load = () => api.get(`/breakdowns/${id}`).then(r => setBreakdown(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, [id]);

    const handleSubmitReport = async e => {
        e.preventDefault();
        try {
            await api.post(`/breakdowns/${id}/maintenance-report`, reportForm);
            setShowReportForm(false);
            load();
        } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
    };

    const handleReturnToSupplier = async () => {
        if (!window.confirm('Retourner la ressource au fournisseur ?')) return;
        await api.patch(`/breakdowns/${id}/return-to-supplier`);
        load();
    };

    const handleResolve = async () => {
        await api.patch(`/breakdowns/${id}/resolve`);
        load();
    };

    if (loading) return <div style={s.loading}>Chargement...</div>;
    if (!breakdown) return <div>Panne introuvable.</div>;

    const statusColor = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#10b981', returned_to_supplier: '#64748b' };
    const now = new Date();
    const warrantyValid = breakdown.warranty_end && new Date(breakdown.warranty_end) > now;

    return (
        <div>
            <div style={s.header}>
                <h2 style={s.title}>Panne — {breakdown.inventory_number}</h2>
                <span style={{ ...s.badge, background: statusColor[breakdown.status] }}>{breakdown.status}</span>
            </div>

            <div style={s.grid}>
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Détails de la panne</h3>
                    <p style={s.field}><strong>Ressource:</strong> {breakdown.brand} {breakdown.resource_type}</p>
                    <p style={s.field}><strong>Description:</strong> {breakdown.description}</p>
                    <p style={s.field}><strong>Signalé par:</strong> {breakdown.reported_by_name}</p>
                    <p style={s.field}><strong>Date:</strong> {new Date(breakdown.reported_at).toLocaleDateString('fr-FR')}</p>
                    <p style={s.field}>
                        <strong>Garantie:</strong>{' '}
                        {breakdown.warranty_end
                            ? <span style={{ color: warrantyValid ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {warrantyValid ? '✓ Valide' : '✗ Expirée'} ({new Date(breakdown.warranty_end).toLocaleDateString('fr-FR')})
                              </span>
                            : 'Non renseignée'}
                    </p>
                </div>

                <div style={s.card}>
                    <h3 style={s.cardTitle}>Actions</h3>
                    {user?.role === 'technicien' && breakdown.status === 'open' && (
                        <button onClick={() => setShowReportForm(!showReportForm)} style={s.techBtn}>
                            {showReportForm ? 'Annuler' : 'Rédiger un constat'}
                        </button>
                    )}
                    {user?.role === 'responsable' && breakdown.status === 'in_progress' && (
                        <>
                            <button onClick={handleResolve} style={s.resolveBtn}>Marquer comme résolu</button>
                            <button onClick={handleReturnToSupplier} style={s.returnBtn}>
                                Retourner au fournisseur{warrantyValid ? ' (garantie valide)' : ''}
                            </button>
                        </>
                    )}
                    {breakdown.status === 'resolved' && <p style={s.resolved}>✓ Panne résolue</p>}
                    {breakdown.status === 'returned_to_supplier' && <p style={s.returned}>Ressource retournée au fournisseur</p>}
                </div>
            </div>

            {showReportForm && (
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Rédiger un constat de panne</h3>
                    <form onSubmit={handleSubmitReport}>
                        <div style={s.formGrid}>
                            <div>
                                <label style={s.label}>Explication de la panne</label>
                                <textarea style={{ ...s.input, height: 80 }} required
                                    value={reportForm.breakdown_explanation}
                                    onChange={e => setReportForm({ ...reportForm, breakdown_explanation: e.target.value })} />
                            </div>
                            <div>
                                <label style={s.label}>Date d'apparition</label>
                                <input style={s.input} type="date" value={reportForm.appearance_date}
                                    onChange={e => setReportForm({ ...reportForm, appearance_date: e.target.value })} />

                                <label style={{ ...s.label, marginTop: 12 }}>Fréquence</label>
                                <select style={s.input} value={reportForm.frequency} onChange={e => setReportForm({ ...reportForm, frequency: e.target.value })}>
                                    <option value="rare">Rare</option>
                                    <option value="frequente">Fréquente</option>
                                    <option value="permanente">Permanente</option>
                                </select>

                                <label style={{ ...s.label, marginTop: 12 }}>Type d'ordre</label>
                                <select style={s.input} value={reportForm.order_type} onChange={e => setReportForm({ ...reportForm, order_type: e.target.value })}>
                                    <option value="materiel">Matériel</option>
                                    <option value="logiciel">Logiciel</option>
                                </select>

                                <label style={{ ...s.label, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input type="checkbox" checked={reportForm.can_repair}
                                        onChange={e => setReportForm({ ...reportForm, can_repair: e.target.checked })} />
                                    Peut être réparé sur place
                                </label>
                            </div>
                        </div>
                        <button type="submit" style={s.techBtn}>Envoyer le constat</button>
                    </form>
                </div>
            )}

            {breakdown.reports?.length > 0 && (
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Constats de maintenance</h3>
                    {breakdown.reports.map(r => (
                        <div key={r.id} style={s.reportItem}>
                            <div style={s.reportTop}>
                                <strong>{r.technician_name}</strong>
                                <span style={s.date}>{new Date(r.report_date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <p style={s.field}>{r.breakdown_explanation}</p>
                            <div style={s.tags}>
                                <span style={s.tag}>Fréquence: {r.frequency}</span>
                                <span style={s.tag}>Type: {r.order_type}</span>
                                <span style={{ ...s.tag, background: r.can_repair ? '#dcfce7' : '#fee2e2', color: r.can_repair ? '#16a34a' : '#dc2626' }}>
                                    {r.can_repair ? '✓ Réparable' : '✗ Non réparable'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const s = {
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
    badge: { padding: '4px 12px', borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    card: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 14 },
    field: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 1.6 },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    techBtn: { padding: '9px 18px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginRight: 8, marginBottom: 8 },
    resolveBtn: { display: 'block', padding: '9px 18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 8, width: '100%' },
    returnBtn: { display: 'block', padding: '9px 18px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14, width: '100%' },
    resolved: { color: '#16a34a', fontWeight: 600 },
    returned: { color: '#64748b', fontWeight: 600 },
    reportItem: { border: '1px solid #e2e8f0', borderRadius: 6, padding: 14, marginBottom: 10 },
    reportTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
    date: { fontSize: 12, color: '#94a3b8' },
    tags: { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' },
    tag: { padding: '3px 10px', borderRadius: 4, fontSize: 12, background: '#f1f5f9', color: '#374151', fontWeight: 600 },
};

export default BreakdownDetail;
