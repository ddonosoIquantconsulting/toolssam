# Iquant SSAM Backend

Backend API para el sistema de comparación de configuraciones SAP Service Asset Manager.

## Tecnologías

- **NestJS** - Framework Node.js
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **bcryptjs** - Encriptación de contraseñas

## Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar PostgreSQL
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos y usuario
sudo -u postgres psql
CREATE DATABASE iquant_ssam;
CREATE USER iquant_user WITH PASSWORD 'iquant_password';
GRANT ALL PRIVILEGES ON DATABASE iquant_ssam TO iquant_user;
\q
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Ejecutar la aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/forgot-password` - Recuperar contraseña

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Archivos
- `POST /api/files/upload` - Subir archivo CSV/Excel
- `GET /api/files/data` - Obtener datos
- `GET /api/files/companies` - Listar companies
- `GET /api/files/versions` - Listar versiones

### Comparación
- `GET /api/comparison/compare` - Comparar companies
- `GET /api/comparison/stats` - Estadísticas

## Documentación API

Swagger disponible en: http://localhost:3001/api/docs

## Estructura del Proyecto

```
src/
├── auth/           # Autenticación JWT
├── users/          # Gestión de usuarios
├── files/          # Subida y procesamiento de archivos
├── comparison/     # Comparación de datos
├── database/       # Configuración de base de datos
└── main.ts         # Punto de entrada
```

## Credenciales por Defecto

Al ejecutar por primera vez, se crearán usuarios por defecto:
- **Admin**: admin@admin.admin / admin123
- **User**: user@example.com / demo123