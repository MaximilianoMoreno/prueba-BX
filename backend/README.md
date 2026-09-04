# Backend - "Quién tiene? Yo tengo!"

API RESTful construida con Node.js, Express y MongoDB para la plataforma de préstamo de herramientas e insumos.

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:4200
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

4. **Ejecutar en producción:**
```bash
npm start
```

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de conexión a MongoDB
├── controllers/
│   └── solicitudesController.js  # Lógica del flujo de préstamos
├── middleware/
│   └── auth.js              # Middleware de autenticación JWT
├── models/
│   ├── User.js              # Modelo de usuarios
│   ├── Group.js             # Modelo de grupos
│   ├── Item.js              # Modelo de items (herramientas/insumos)
│   └── Solicitud.js         # Modelo de solicitudes de préstamo
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   ├── grupos.js            # Rutas de grupos
│   ├── items.js             # Rutas de items
│   └── solicitudes.js       # Rutas de solicitudes
├── .env.example             # Ejemplo de variables de entorno
├── server.js                # Punto de entrada principal
└── package.json
```

## 🔑 Endpoints de la API

### Autenticación (`/api/auth`)
- `POST /registro` - Registrar nuevo usuario
- `POST /login` - Iniciar sesión
- `GET /perfil` - Obtener perfil del usuario (protegido)
- `PUT /perfil` - Actualizar perfil (protegido)

### Grupos (`/api/grupos`)
- `GET /` - Obtener grupos del usuario (protegido)
- `POST /` - Crear nuevo grupo (protegido)
- `GET /:id` - Obtener detalles de un grupo (protegido)
- `PUT /:id` - Actualizar grupo (protegido, solo creador)
- `DELETE /:id` - Eliminar grupo (protegido, solo creador)
- `POST /:id/miembros` - Agregar miembros (protegido, solo creador)
- `DELETE /:id/miembros/:usuarioId` - Remover miembro (protegido)

### Items (`/api/items`)
- `GET /` - Obtener todos los items de los grupos del usuario (protegido)
- `GET /mis-items` - Obtener solo mis items (protegido)
- `GET /:id` - Obtener item por ID (protegido)
- `POST /` - Crear nuevo item (protegido)
- `PUT /:id` - Actualizar item (protegido, solo propietario)
- `DELETE /:id` - Eliminar item - soft delete (protegido, solo propietario)

### Solicitudes (`/api/solicitudes`)
- `POST /` - Crear solicitud de préstamo (protegido)
  - Genera URL de WhatsApp para contactar al propietario
  - Cambia estado del item a "Pendiente de Aprobación"
- `GET /` - Obtener solicitudes (filtro por tipo y estado) (protegido)
- `PUT /:id` - Actualizar solicitud (Aceptar/Rechazar/Completar) (protegido, solo propietario)
- `PUT /:id/cancelar` - Cancelar solicitud pendiente (protegido, solo solicitante)

## 🔄 Flujo de Préstamo

1. **Solicitante** presiona "Pedir" en un item disponible
2. **Backend**:
   - Crea registro en `Solicitudes` con estado "Pendiente"
   - Cambia estado del item a "Pendiente de Aprobación"
   - Devuelve URL de WhatsApp para contactar al propietario
3. **Solicitante** envía mensaje por WhatsApp al propietario
4. **Propietario** recibe WhatsApp, entra al Dashboard y ve la alerta
5. **Propietario** presiona "Aceptar" en el Dashboard
6. **Backend**:
   - Cambia solicitud a "Aceptada"
   - Si es herramienta: item pasa a "En Uso"
   - Si es insumo: descuenta stock y verifica si llega a 0 ("Agotado")

## 📊 Modelos de Datos

### User
- nombre, email, password (hash), telefono, avatar
- grupos: [ObjectId]
- activo: Boolean

### Group
- nombre, descripcion
- miembros: [ObjectId], creador: ObjectId
- activo: Boolean

### Item
- nombre, descripcion, categoria, propietario, grupo
- esInsumo: Boolean, stock: Number, prioridadReposicion: String, almacenable: Boolean
- estado: Enum ['Disponible', 'Pendiente de Aprobación', 'En Uso', 'Agotado']
- imagen, ubicacion, activo: Boolean

### Solicitud
- item, solicitante, propietario, grupo
- estado: Enum ['Pendiente', 'Aceptada', 'Rechazada', 'Cancelada', 'Completada']
- fechaSolicitud, fechaAprobacion, fechaDevolucion
- mensaje, respuesta, cantidadSolicitada, cantidadAprobada

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación con JWT
- Validación de permisos por rol (propietario, creador de grupo, etc.)
- Soft delete para preservar historial
- Helmet para headers HTTP seguros
- CORS configurado

## 🌐 Despliegue en Tier Gratuito

### Render/Railway (Backend)
1. Conectar repositorio
2. Configurar variables de entorno
3. Usar MongoDB Atlas (free tier)
4. Comando de inicio: `npm start`

### Variables de Entorno para Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secreto_largo_y_seguro
FRONTEND_URL=https://tu-app.vercel.app
```

## 📝 Notas Importantes

- Las solicitudes NO se eliminan físicamente (bitácora histórica)
- Los items eliminados se marcan como inactivos (soft delete)
- La visibilidad está aislada por grupo
- Solo miembros del mismo grupo pueden verse entre sí

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **MongoDB + Mongoose** - Base de datos y ODM
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Seguridad HTTP
- **CORS** - Recursos cruzados
- **Morgan** - Logging
