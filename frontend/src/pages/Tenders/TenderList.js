import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusColor = { open: '#10b981', closed: '#64748b', draft: '#f59e0b', awarded: '#3b82f6' };
const statusLabel = { open: 'Ouvert', closed: 'Fermé', draft: 'Brouillon', awarded: 'Attribué' };

const TenderList = () => {
    const { user } = useAuth();
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/tenders').then(r => setTenders(r.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={s.loading}>Chargement...</div>;

    return (
        <div>
            <div style={s.header}>
                <h2 style={s.title}>Appels d'offre</h2>
                {['responsable', 'chef_departement'].includes(user?.role) && (
                    <Link to="/tenders/new" style={s.btn}>+ Nouveau</Link>
                )}
            </div>
            {tenders.length === 0 ? (
                <div style={s.empty}>Aucun appel d'offre pour l'instant.</div>
            ) : (
                <div style={s.list}>
                    {tenders.map(t => (
                        <Link key={t.id} to={`/tenders/${t.id}`} style={s.card}>
                            <div style={s.cardTop}>
                                <h3 style={s.cardTitle}>{t.title}</h3>
                                <span style={{ ...s.badge, background: statusColor[t.status] }}>
                                    {statusLabel[t.status]}
                                </span>
                            </div>
                            <p style={s.meta}>
                                Du {new Date(t.start_date).toLocaleDateString('fr-FR')} au {new Date(t.end_date).toLocaleDateString('fr-FR')}
                            </p>
                            <p style={s.meta}>{t.offer_count} offre(s) reçue(s) • Créé par {t.created_by_name}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const s = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b' },
    btn: { padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 },
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    empty: { textAlign: 'center', padding: 60, color: '#94a3b8', fontSize: 16 },
    list: { display: 'flex', flexDirection: 'column', gap: 12 },
    card: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none', display: 'block', border: '1px solid #e2e8f0' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: 600, color: '#1e293b' },
    badge: { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 600 },
    meta: { fontSize: 13, color: '#64748b', marginTop: 4 },
};

export default TenderList;
