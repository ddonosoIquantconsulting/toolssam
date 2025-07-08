# Iquant SSAM - Sistema de Comparación de Configuraciones

Este es un prototipo navegable y semi-funcional para el sistema Iquant SSAM (SAP Service Asset Manager), desarrollado en React con TypeScript.

## Características

- **Sistema de Autenticación**: Login con email/password y recuperación de contraseña
- **Dashboard Principal**: Vista de bienvenida con estadísticas y filtros
- **Gestión de Archivos**: Subida de archivos Excel/CSV con validación
- **Gestión de Usuarios**: CRUD completo de usuarios con roles y permisos
- **Configuraciones**: Panel de configuración del sistema
- **Comparación de Datos**: Análisis y comparación entre diferentes configuraciones

## Tecnologías Utilizadas

- React 18 + TypeScript
- Tailwind CSS para estilos
- Lucide React para iconos
- Vite como bundler

## Credenciales de Prueba

- **Usuario**: admin@admin.admin
- **Contraseña**: admin123

## Instalación y Ejecución

### Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos para Instalar

1. **Descomprimir el archivo ZIP** en la carpeta deseada

2. **Navegar al directorio del proyecto**:
   ```bash
   cd iquant-ssam-prototype
   ```

3. **Instalar dependencias**:
   ```bash
   npm install
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abrir el navegador** en `http://localhost:5173`

### Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción
- `npm run lint` - Ejecuta el linter de código

## Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── Dashboard/       # Dashboard principal
│   ├── FileUpload/      # Subida de archivos
│   ├── Layout/          # Componentes de layout
│   ├── Settings/        # Configuraciones
│   ├── Users/           # Gestión de usuarios
│   └── Login.tsx        # Componente de login
├── contexts/            # Contextos de React
├── data/               # Datos mock
├── types/              # Definiciones de tipos TypeScript
└── App.tsx             # Componente principal
```

## Funcionalidades

### 1. Autenticación
- Login con validación de credenciales
- Recuperación de contraseña (simulada)
- Gestión de sesión con contexto React

### 2. Dashboard
- Estadísticas en tiempo real
- Filtros por Company y Version
- Comparación entre configuraciones
- Grillas de datos con diferencias resaltadas

### 3. Gestión de Archivos
- Drag & drop para subir archivos
- Soporte para Excel (.xlsx, .xls) y CSV
- Validación de tipos y tamaños
- Barra de progreso de subida

### 4. Gestión de Usuarios
- Lista de usuarios con filtros y búsqueda
- Agregar, editar y eliminar usuarios
- Bloquear/desbloquear usuarios
- Cambio de contraseñas

### 5. Configuraciones
- Configuraciones generales del sistema
- Notificaciones y alertas
- Configuración de archivos
- Personalización de apariencia

## Datos de Ejemplo

El sistema incluye datos mock basados en la estructura CSV proporcionada:
- Configuraciones de CMP y ARACUO
- Parámetros SAP Service Asset Manager
- Usuarios de ejemplo con diferentes roles

## Diseño

El diseño sigue principios modernos y profesionales:
- **Colores**: Esquema azul corporativo con acentos
- **Tipografía**: Fuentes legibles y jerarquía clara
- **Espaciado**: Sistema de 8px grid
- **Componentes**: Cards, botones y formularios consistentes
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## Notas Técnicas

- **Estado**: Manejo con React hooks y Context API
- **Tipos**: TypeScript para type safety
- **Estilos**: Tailwind CSS con clases utilitarias
- **Iconos**: Lucide React para consistencia
- **Mock Data**: Datos simulados para demostración

## Limitaciones del Prototipo

Este es un prototipo funcional que incluye:
- ✅ Navegación completa entre secciones
- ✅ Interfaces funcionales y responsive
- ✅ Validaciones básicas
- ✅ Estados y transiciones
- ❌ Conexión a base de datos real
- ❌ API backend
- ❌ Procesamiento real de archivos Excel/CSV
- ❌ Autenticación real

## Próximos Pasos para Producción

1. Implementar backend con API REST
2. Integrar base de datos (PostgreSQL/MySQL)
3. Añadir procesamiento real de archivos
4. Implementar autenticación JWT
5. Añadir tests unitarios y de integración
6. Configurar CI/CD pipeline
7. Implementar logging y monitoreo

## Soporte

Para soporte técnico o consultas sobre el prototipo, contactar al equipo de desarrollo.