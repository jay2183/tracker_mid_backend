const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const companyFeatureRoutes = require('./routes/companyfeatureRoutes');
const individualFeatureRoutes = require('./routes/individualFeatureRoutes');
const attendanceRoutes = require('./routes/atttendanceRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const profileRoutes = require('./routes/profileRoutes');
// const userRoutes = require('./routes/userRoutes');
// const chatRoutes = require('./routes/chatRoutes');

const connectDB = require('./config/db');
// const setupSocket = require('./config/socket');
// const setupSocket2 = require('./config/socketTwo');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5004;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Middleware
app.use(express.json());
// app.use('/uploads', express.static('uploads'));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/companyFeature', companyFeatureRoutes);
app.use('/api/indiVidualFeature', individualFeatureRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/profile', profileRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/products', productRoutes);

const server = require('http').createServer(app);
// setupSocket2(server);
// MongoDB Connection
connectDB();
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
