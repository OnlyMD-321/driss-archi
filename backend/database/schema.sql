-- Gestion des Ressources Matérielles - Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('responsable', 'chef_departement', 'enseignant', 'technicien', 'fournisseur')),
    department_id UUID REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    website VARCHAR(255),
    manager_name VARCHAR(255),
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'awarded')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tender_needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('ordinateur', 'imprimante')),
    quantity INTEGER NOT NULL DEFAULT 1,
    specs JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    delivery_date DATE NOT NULL,
    warranty_months INTEGER NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE offer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL,
    brand VARCHAR(255),
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_number VARCHAR(100) UNIQUE NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('ordinateur', 'imprimante')),
    brand VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'returned')),
    offer_id UUID REFERENCES offers(id),
    supplier_id UUID REFERENCES suppliers(id),
    warranty_end DATE,
    specs JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    assigned_user_id UUID REFERENCES users(id),
    assigned_date TIMESTAMP DEFAULT NOW(),
    returned_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE breakdowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id),
    reported_by UUID REFERENCES users(id),
    description TEXT NOT NULL,
    reported_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'returned_to_supplier'))
);

CREATE TABLE maintenance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    breakdown_id UUID REFERENCES breakdowns(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES users(id),
    breakdown_explanation TEXT,
    appearance_date DATE,
    frequency VARCHAR(50) CHECK (frequency IN ('rare', 'frequente', 'permanente')),
    order_type VARCHAR(50) CHECK (order_type IN ('logiciel', 'materiel')),
    can_repair BOOLEAN DEFAULT FALSE,
    report_date TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO departments (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Informatique'),
    ('22222222-2222-2222-2222-222222222222', 'Mathématiques'),
    ('33333333-3333-3333-3333-333333333333', 'Physique');

-- Password: admin123 (bcrypt hash, cost 10)
INSERT INTO users (id, name, email, password, role) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Responsable Ressources', 'responsable@faculte.ma',
     '$2b$10$psjjuQ8r9wBcfLTvGV5FjeCBBH1wxN82NhUFmM57AzekG3755eAgm', 'responsable');

INSERT INTO users (id, name, email, password, role, department_id) VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Chef Département Info', 'chef.info@faculte.ma',
     '$2b$10$psjjuQ8r9wBcfLTvGV5FjeCBBH1wxN82NhUFmM57AzekG3755eAgm', 'chef_departement', '11111111-1111-1111-1111-111111111111'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Prof. Ahmed Benali', 'ahmed.benali@faculte.ma',
     '$2b$10$psjjuQ8r9wBcfLTvGV5FjeCBBH1wxN82NhUFmM57AzekG3755eAgm', 'enseignant', '11111111-1111-1111-1111-111111111111'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Technicien Maintenance', 'tech@faculte.ma',
     '$2b$10$psjjuQ8r9wBcfLTvGV5FjeCBBH1wxN82NhUFmM57AzekG3755eAgm', 'technicien', NULL);
