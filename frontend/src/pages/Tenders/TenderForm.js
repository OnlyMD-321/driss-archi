import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TenderForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '' });
    const [needs, setNeeds] = useState([{ resource_type: 'ordinateur', quantity: 1, department_id: '', specs: {} }]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { api.get('/departments').then(r => setDepartments(r.data)); }, []);

    const addNeed = () => setNeeds([...needs, { resource_type: 'ordinateur', quantity: 1, department_id: '', specs: {} }]);
    const removeNeed = i => setNeeds(needs.filter((_, idx) => idx !== i));
    const updateNeed = (i, key, val) => setNeeds(needs.map((n, idx) => idx === i ? { ...n, [key]: val } : n));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const { data } = await api.post('/tenders', { ...form, needs });
            navigate(`/tenders/${data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={s.container}>
            <h2 style={s.title}>Nouvel appel d'offre</h2>
            {error && <div style={s.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={s.form}>
                <div style={s.section}>
                    <h3 style={s.sectionTitle}>Informations générales</h3>
                    <Field label="Titre" required>
                        <input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </Field>
                    <Field label="Description">
                        <textarea style={{ ...s.input, height: 80 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </Field>
                    <div style={s.row}>
                        <Field label="Date de début">
                            <input style={s.input} type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                        </Field>
                        <Field label="Date de fin">
                            <input style={s.input} type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
                        </Field>
                    </div>
                </div>

                <div style={s.section}>
                    <div style={s.sectionHeader}>
                        <h3 style={s.sectionTitle}>Besoins en ressources</h3>
                        <button type="button" onClick={addNeed} style={s.addBtn}>+ Ajouter</button>
                    </div>
                    {needs.map((need, i) => (
                        <div key={i} style={s.needCard}>
                            <div style={s.row}>
                                <Field label="Type">
                                    <select style={s.input} value={need.resource_type} onChange={e => updateNeed(i, 'resource_type', e.target.value)}>
                                        <option value="ordinateur">Ordinateur</option>
                                        <option value="imprimante">Imprimante</option>
                                    </select>
                                </Field>
                                <Field label="Quantité">
                                    <input style={s.input} type="number" min="1" value={need.quantity} onChange={e => updateNeed(i, 'quantity', parseInt(e.target.value))} />
                                </Field>
                                <Field label="Département">
                                    <select style={s.input} value={need.department_id} onChange={e => updateNeed(i, 'department_id', e.target.value)}>
                                        <option value="">Tous</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </Field>
                            </div>
                            {need.resource_type === 'ordinateur' && (
                                <div style={s.row}>
                                    {['CPU', 'RAM', 'Disque', 'Écran'].map(spec => (
                                        <Field key={spec} label={spec}>
                                            <input style={s.input} placeholder={spec} onChange={e => updateNeed(i, 'specs', { ...need.specs, [spec.toLowerCase()]: e.target.value })} />
                                        </Field>
                                    ))}
                                </div>
                            )}
                            {need.resource_type === 'imprimante' && (
                                <div style={s.row}>
                                    {['Vitesse', 'Résolution'].map(spec => (
                                        <Field key={spec} label={spec}>
                                            <input style={s.input} placeholder={spec} onChange={e => updateNeed(i, 'specs', { ...need.specs, [spec.toLowerCase()]: e.target.value })} />
                                        </Field>
                                    ))}
                                </div>
                            )}
                            {needs.length > 1 && (
                                <button type="button" onClick={() => removeNeed(i)} style={s.removeBtn}>Supprimer</button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={s.actions}>
                    <button type="button" onClick={() => navigate('/tenders')} style={s.cancelBtn}>Annuler</button>
                    <button type="submit" disabled={loading} style={s.submitBtn}>
                        {loading ? 'Création...' : "Créer l'appel d'offre"}
                    </button>
                </div>
            </form>
        </div>
    );
};

const Field = ({ label, children }) => (
    <div style={{ flex: 1 }}>
        <label style={s.label}>{label}</label>
        {children}
    </div>
);

const s = {
    container: { maxWidth: 800, margin: '0 auto' },
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 24 },
    error: { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
    form: {},
    section: { background: '#fff', padding: 24, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 16 },
    row: { display: 'flex', gap: 16, marginBottom: 12 },
    label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 },
    input: { width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    needCard: { border: '1px solid #e2e8f0', borderRadius: 6, padding: 16, marginBottom: 12, background: '#f8fafc' },
    addBtn: { padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
    removeBtn: { padding: '5px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginTop: 8 },
    actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
    cancelBtn: { padding: '10px 24px', background: '#e2e8f0', color: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
    submitBtn: { padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
};

export default TenderForm;
