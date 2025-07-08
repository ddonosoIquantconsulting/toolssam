const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Creando archivo ZIP del proyecto completo...');

try {
  // Crear el ZIP con todo el proyecto
  execSync('zip -r iquant-ssam-complete-project.zip . -x "node_modules/*" "*/node_modules/*" "dist/*" "*/dist/*" ".git/*" "*.log" "*.zip"', {
    stdio: 'inherit'
  });

  console.log('✅ Archivo ZIP creado exitosamente: iquant-ssam-complete-project.zip');
  console.log('📦 El archivo contiene:');
  console.log('   - Frontend completo (React + TypeScript + Zustand)');
  console.log('   - Backend completo (NestJS + PostgreSQL)');
  console.log('   - Documentación de instalación');
  console.log('   - Configuraciones de desarrollo');
  
} catch (error) {
  console.error('❌ Error creando el ZIP:', error.message);
}