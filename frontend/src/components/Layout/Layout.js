import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { to: '/', label: 'Tableau de bord', roles: ['all'] },
    { to: '/tenders', label: "Appels d'offre", roles: ['responsable', 'chef_departement', 'fournisseur'] },
    { to: '/resources', label: 'Ressources', roles: ['responsable', 'chef_departement', 'enseignant'] },
    { to: '/suppliers', label: 'Fournisseurs', roles: ['responsable'] },
    { to: '/breakdowns', label: 'Pannes', roles: ['responsable', 'enseignant', 'chef_departement', 'technicien'] },
    { to: '/departments', label: 'Départements', roles: ['responsable', 'chef_departement'] },
];

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => { logout(); navigate('/login'); };

    const roleLabel = {
        responsable: 'Responsable Ressources',
        chef_departement: 'Chef de Département',
        enseignant: 'Enseignant',
        fournisseur: 'Fournisseur',
        technicien: 'Technicien Maintenance',
    };

    return (
        <div style={s.container}>
            <aside style={{ ...s.sidebar, width: sidebarOpen ? 250 : 60 }}>
                <div style={s.logo} onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? '⚙ GRM' : '⚙'}
                </div>
                <nav>
                    {navItems
                        .filter(item => item.roles.includes('all') || item.roles.includes(user?.role))
                        .map(item => (
                            <NavLink key={item.to} to={item.to} end={item.to === '/'}
                                style={({ isActive }) => ({ ...s.navLink, ...(isActive ? s.navActive : {}) })}>
                                {sidebarOpen ? item.label : item.label[0]}
                            </NavLink>
                        ))}
                </nav>
            </aside>
            <div style={s.main}>
                <header style={s.header}>
                    <div style={s.userInfo}>
                        <span style={s.userName}>{user?.name}</span>
                        <span style={s.userRole}>{roleLabel[user?.role]}</span>
                    </div>
                    <button onClick={handleLogout} style={s.logoutBtn}>Déconnexion</button>
                </header>
                <main style={s.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const s = {
    container: { display: 'flex', minHeight: '100vh' },
    sidebar: { background: '#1e293b', color: '#fff', transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0 },
    logo: { padding: '20px 16px', fontSize: 20, fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid #334155', color: '#60a5fa' },
    navLink: { display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', fontSize: 14, whiteSpace: 'nowrap', transition: 'all 0.2s' },
    navActive: { background: '#3b82f6', color: '#fff', borderRadius: 6 },
    main: { flex: 1, display: 'flex', flexDirection: 'column' },
    header: { background: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    userInfo: { display: 'flex', flexDirection: 'column' },
    userName: { fontWeight: 600, color: '#1e293b' },
    userRole: { fontSize: 12, color: '#64748b' },
    logoutBtn: { padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
    content: { flex: 1, padding: 24, overflow: 'auto' },
};

export default Layout;
