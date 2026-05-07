import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DepartmentList = () => {
    const { user } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [selected, setSelected] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');

    const load = () => api.get('/departments').then(r => setDepartments(r.data)).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);

    const handleSelect = async dept => {
        setSelected(dept);
        const { data } = await api.get(`/departments/${dept.id}/members`);
        setMembers(data);
    };

    const handleCreate = async e => {
        e.preventDefault();
        await api.post('/departments', { name: newName });
        setNewName('');
        load();
    };

    const roleLabel = { responsable: 'Responsable', chef_departement: 'Chef', enseignant: 'Enseignant', technicien: 'Technicien' };

    if (loading) return <div style={s.loading}>Chargement...</div>;

    return (
        <div style={s.container}>
            <h2 style={s.title}>Départements</h2>
            <div style={s.layout}>
                <div style={s.left}>
                    {user?.role === 'responsable' && (
                        <form onSubmit={handleCreate} style={s.createForm}>
                            <input style={s.input} placeholder="Nom du département" value={newName}
                                onChange={e => setNewName(e.target.value)} required />
                            <button type="submit" style={s.btn}>Créer</button>
                        </form>
                    )}
                    {departments.map(d => (
                        <div key={d.id} onClick={() => handleSelect(d)}
                            style={{ ...s.deptCard, background: selected?.id === d.id ? '#eff6ff' : '#fff', borderColor: selected?.id === d.id ? '#3b82f6' : '#e2e8f0' }}>
                            <h3 style={s.deptName}>{d.name}</h3>
                            <span style={s.count}>{d.member_count} membre(s)</span>
                        </div>
                    ))}
                </div>

                <div style={s.right}>
                    {selected ? (
                        <>
                            <h3 style={s.sectionTitle}>Membres — {selected.name}</h3>
                            {members.length === 0 ? (
                                <p style={s.empty}>Aucun membre dans ce département.</p>
                            ) : (
                                members.map(m => (
                                    <div key={m.id} style={s.memberCard}>
                                        <div style={s.avatar}>{m.name[0]}</div>
                                        <div>
                                            <p style={s.memberName}>{m.name}</p>
                                            <p style={s.memberEmail}>{m.email}</p>
                                        </div>
                                        <span style={s.roleBadge}>{roleLabel[m.role] || m.role}</span>
                                    </div>
                                ))
                            )}
                        </>
                    ) : (
                        <p style={s.empty}>Sélectionnez un département pour voir ses membres.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const s = {
    container: {},
    title: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 24 },
    loading: { textAlign: 'center', padding: 40, color: '#64748b' },
    layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 },
    left: {},
    right: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    createForm: { display: 'flex', gap: 8, marginBottom: 12 },
    input: { flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    btn: { padding: '9px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
    deptCard: { padding: '14px 16px', borderRadius: 8, border: '1px solid', marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' },
    deptName: { fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 2 },
    count: { fontSize: 12, color: '#64748b' },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 16 },
    memberCard: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f1f5f9' },
    avatar: { width: 36, height: 36, background: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
    memberName: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
    memberEmail: { fontSize: 12, color: '#64748b' },
    roleBadge: { marginLeft: 'auto', background: '#f1f5f9', color: '#374151', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600, flexShrink: 0 },
    empty: { color: '#94a3b8', padding: 32, textAlign: 'center', fontSize: 14 },
};

export default DepartmentList;
