import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TenderList from './pages/Tenders/TenderList';
import TenderDetail from './pages/Tenders/TenderDetail';
import TenderForm from './pages/Tenders/TenderForm';
import ResourceList from './pages/Resources/ResourceList';
import ResourceDetail from './pages/Resources/ResourceDetail';
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierRegister from './pages/Suppliers/SupplierRegister';
import BreakdownList from './pages/Breakdowns/BreakdownList';
import BreakdownDetail from './pages/Breakdowns/BreakdownDetail';
import DepartmentList from './pages/Departments/DepartmentList';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={styles.loading}>Chargement...</div>;
    return user ? children : <Navigate to="/login" />;
};

const App = () => (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register-supplier" element={<SupplierRegister />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="tenders" element={<TenderList />} />
                    <Route path="tenders/new" element={<TenderForm />} />
                    <Route path="tenders/:id" element={<TenderDetail />} />
                    <Route path="resources" element={<ResourceList />} />
                    <Route path="resources/:id" element={<ResourceDetail />} />
                    <Route path="suppliers" element={<SupplierList />} />
                    <Route path="breakdowns" element={<BreakdownList />} />
                    <Route path="breakdowns/:id" element={<BreakdownDetail />} />
                    <Route path="departments" element={<DepartmentList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </AuthProvider>
);

const styles = {
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: 18 }
};

export default App;
