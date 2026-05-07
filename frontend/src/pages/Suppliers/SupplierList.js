import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => api.get('/suppliers').then(r => setSuppliers(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const handleBlacklist = async (id) => {
        const reason = window.prompt('Motif de mise en liste noire:');
        if (!reason) return;
        await api.patch(`/suppliers/${id}/blacklist`, { reason });
        load();
    };

    const handleUnblacklist = async (id) => {
        await api.patch(`/suppliers/${id}/unblacklist`);
        load();
    };

    if (loading) return <div style={s.loading}>Chargement...</div>;

    return (
        <div>
            <h2 style={s.title}>Fournisseurs</h2>
            <div style={s.grid}>
                {suppliers.map(s2 => (
                    <div key={s2.id} style={{ ...s.card, borderLeft: `4px solid ${s2.is_blacklisted ? '#ef4444' : '#10b981'}` }}>
                        <div style={s.cardTop}>
                            <div>
                                <h3 style={s.companyName}>{s2.company_name}</h3>
                                {s2.is_blacklisted && <span style={s.blacklistBadge}>Liste noire</span>}
                            </div>
                        </div>
                        <p style={s.info}>{s2.name} — {s2.email}</p>
                        {s2.location && <p style={s.info}>📍 {s2.location}</p>}
                        {s2.website && <p style={s.info}>🌐 {s2.website}</p>}
                        {s2.manager_name && <p style={s.info}>👤 {s2.manager_name}</p>}
                        {s2.is_blacklisted && s2.blacklist_reason && (
                            <p style={s.reason}>Motif: {s2.blacklist_reason}</p>
                        )}
                        <div style={s.actions}>
                            {s2.is_blacklisted ? (
                                <button onClick={() => handleUnblacklist(s2.id)} style={s.unblacklistBtn}>
                                    Retirer de la liste noire
                                </button>
                            ) : (
                                <button onClick={() => handleBlacklist(s2.id)} style={s.blacklistBtn}>
                                    Mettre en liste noire
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {suppliers.length === 0 && <p style={s.empty}>Aucun fournisseur inscrit.</p>}
            </div>
        </div>
    );
};

const s = {
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 24 },
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
    card: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
    companyName: { fontSize: 17, fontWeight: 700, color: '#1e293b' },
    blacklistBadge: { background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, display: 'inline-block', marginTop: 4 },
    info: { fontSize: 13, color: '#64748b', marginBottom: 3, lineHeight: 1.5 },
    reason: { fontSize: 12, color: '#ef4444', marginTop: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: 4 },
    actions: { marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' },
    blacklistBtn: { padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    unblacklistBtn: { padding: '7px 14px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    empty: { color: '#94a3b8', textAlign: 'center', padding: 40, gridColumn: '1/-1' },
};

export default SupplierList;
