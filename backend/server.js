require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const tenderRoutes = require('./src/routes/tenders');
const offerRoutes = require('./src/routes/offers');
const resourceRoutes = require('./src/routes/resources');
const supplierRoutes = require('./src/routes/suppliers');
const breakdownRoutes = require('./src/routes/breakdowns');
const departmentRoutes = require('./src/routes/departments');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/breakdowns', breakdownRoutes);
app.use('/api/departments', departmentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
