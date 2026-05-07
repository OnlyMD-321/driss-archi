import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TenderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [tender, setTender] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offerForm, setOfferForm] = useState({ delivery_date: '', warranty_months: 12, total_price: '', items: [] });
    const [showOfferForm, setShowOfferForm] = useState(false);

    const load = () => Promise.all([
        api.get(`/tenders/${id}`),
        api.get(`/offers/tender/${id}`)
    ]).then(([t, o]) => { setTender(t.data); setOffers(o.data); }).finally(() => setLoading(false));

    useEffect(() => { load(); }, [id]);

    const handleAccept = async offerId => {
        if (!window.confirm("Accepter cette offre ? Les autres seront rejetées.")) return;
        await api.patch(`/offers/${offerId}/accept`);
        load();
    };

    const handleReject = async offerId => {
        const reason = window.prompt("Motif de rejet:");
        if (!reason) return;
        await api.patch(`/offers/${offerId}/reject`, { reason });
        load();
    };

    const handleSubmitOffer = async e => {
        e.preventDefault();
        try {
            await api.post(`/offers/tender/${id}`, offerForm);
            setShowOfferForm(false);
            load();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    };

    if (loading) return <div style={s.loading}>Chargement...</div>;
    if (!tender) return <div>Appel d'offre introuvable.</div>;

    const statusColor = { open: '#10b981', closed: '#64748b', draft: '#f59e0b', awarded: '#3b82f6' };

    return (
        <div>
            <div style={s.header}>
                <div>
                    <h2 style={s.title}>{tender.title}</h2>
                    <span style={{ ...s.badge, background: statusColor[tender.status] }}>
                        {tender.status}
                    </span>
                </div>
                {user?.role === 'responsable' && tender.status === 'open' && (
                    <button onClick={() => api.patch(`/tenders/${id}/close`).then(load)} style={s.closeBtn}>
                        Fermer l'appel d'offre
                    </button>
                )}
            </div>

            <div style={s.grid}>
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Informations</h3>
                    <p><strong>Description:</strong> {tender.description || 'N/A'}</p>
                    <p><strong>Début:</strong> {new Date(tender.start_date).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Fin:</strong> {new Date(tender.end_date).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Créé par:</strong> {tender.created_by_name}</p>
                </div>
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Besoins ({tender.needs?.length || 0})</h3>
                    {tender.needs?.map(n => (
                        <div key={n.id} style={s.needItem}>
                            <strong>{n.resource_type}</strong> × {n.quantity}
                            {n.department_name && <span style={s.tag}>{n.department_name}</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={s.offersSection}>
                <div style={s.offersHeader}>
                    <h3 style={s.cardTitle}>Offres reçues ({offers.length})</h3>
                    {user?.role === 'fournisseur' && tender.status === 'open' && (
                        <button onClick={() => setShowOfferForm(!showOfferForm)} style={s.submitBtn}>
                            {showOfferForm ? 'Annuler' : 'Soumettre une offre'}
                        </button>
                    )}
                </div>

                {showOfferForm && (
                    <form onSubmit={handleSubmitOffer} style={s.offerForm}>
                        <h4 style={{ marginBottom: 12 }}>Nouvelle offre</h4>
                        <div style={s.row}>
                            <div style={{ flex: 1 }}>
                                <label style={s.label}>Date de livraison</label>
                                <input style={s.input} type="date" required value={offerForm.delivery_date} onChange={e => setOfferForm({ ...offerForm, delivery_date: e.target.value })} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={s.label}>Garantie (mois)</label>
                                <input style={s.input} type="number" min="1" value={offerForm.warranty_months} onChange={e => setOfferForm({ ...offerForm, warranty_months: parseInt(e.target.value) })} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={s.label}>Prix total (MAD)</label>
                                <input style={s.input} type="number" min="0" step="0.01" required value={offerForm.total_price} onChange={e => setOfferForm({ ...offerForm, total_price: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" style={s.submitBtn}>Envoyer l'offre</button>
                    </form>
                )}

                {offers.map(o => (
                    <div key={o.id} style={{ ...s.offerCard, borderLeft: `4px solid ${o.status === 'accepted' ? '#10b981' : o.status === 'rejected' ? '#ef4444' : '#3b82f6'}` }}>
                        <div style={s.offerTop}>
                            <div>
                                <strong style={{ fontSize: 16 }}>{o.company_name}</strong>
                                {o.is_blacklisted && <span style={s.blacklist}>LISTE NOIRE</span>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={s.price}>{parseFloat(o.total_price).toLocaleString('fr-FR')} MAD</div>
                                <div style={s.offerMeta}>Livraison: {new Date(o.delivery_date).toLocaleDateString('fr-FR')} • Garantie: {o.warranty_months} mois</div>
                            </div>
                        </div>
                        {user?.role === 'responsable' && o.status === 'pending' && tender.status !== 'awarded' && (
                            <div style={s.actions}>
                                <button onClick={() => handleAccept(o.id)} style={s.acceptBtn}>Accepter</button>
                                <button onClick={() => handleReject(o.id)} style={s.rejectBtn}>Rejeter</button>
                            </div>
                        )}
                        {o.status !== 'pending' && (
                            <div style={{ marginTop: 8, fontSize: 13, color: o.status === 'accepted' ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                {o.status === 'accepted' ? '✓ Offre acceptée' : `✗ Offre rejetée${o.rejection_reason ? `: ${o.rejection_reason}` : ''}`}
                            </div>
                        )}
                    </div>
                ))}

                {offers.length === 0 && <p style={s.empty}>Aucune offre reçue pour l'instant.</p>}
            </div>
        </div>
    );
};

const s = {
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
    badge: { padding: '3px 10px', borderRadius: 20, color: '#fff', fontSize: 12, fontWeight: 600 },
    closeBtn: { padding: '9px 18px', background: '#64748b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
    card: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', lineHeight: 1.8, fontSize: 14 },
    cardTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
    needItem: { padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 },
    tag: { background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: 12 },
    offersSection: { background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    offersHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    submitBtn: { padding: '9px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    offerForm: { background: '#f8fafc', padding: 20, borderRadius: 8, marginBottom: 20, border: '1px solid #e2e8f0' },
    row: { display: 'flex', gap: 16, marginBottom: 12 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    offerCard: { background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 12, border: '1px solid #e2e8f0' },
    offerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    price: { fontSize: 18, fontWeight: 700, color: '#1e293b' },
    offerMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
    blacklist: { background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, marginLeft: 8 },
    actions: { display: 'flex', gap: 8, marginTop: 12 },
    acceptBtn: { padding: '6px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    rejectBtn: { padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    empty: { color: '#94a3b8', textAlign: 'center', padding: 32, fontSize: 15 },
};

export default TenderDetail;
