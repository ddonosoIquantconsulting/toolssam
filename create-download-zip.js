const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


try {
  // Crear el ZIP con todo el proyecto
  execSync('zip -r iquant-ssam-complete-project.zip . -x "node_modules/*" "*/node_modules/*" "dist/*" "*/dist/*" ".git/*" "*.log" "*.zip"', {
    stdio: 'inherit'
  });


} catch (error) {
  
}