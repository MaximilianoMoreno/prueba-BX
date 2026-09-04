const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar conexión a base de datos
const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth');
const gruposRoutes = require('./routes/grupos');
const itemsRoutes = require('./routes/items');
const solicitudesRoutes = require('./routes/solicitudes');

// Inicializar express
const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(helmet()); // Seguridad HTTP headers
app.use(cors()); // Habilitar CORS para el frontend
app.use(express.json()); // Parsear JSON
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded data
app.use(morgan('dev')); // Logging en desarrollo

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: mensajes
    });
  }

  // Error de duplicado de MongoDB
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `El valor del campo '${campo}' ya está en uso`
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error por defecto
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Puerto y servidor
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en modo ${process.env.NODE_ENV || 'development'} en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error no capturado: ${err.message}`);
  // Cerrar servidor y salir
  server.close(() => process.exit(1));
});

module.exports = app;
