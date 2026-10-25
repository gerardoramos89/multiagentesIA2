```javascript
class FileLogger {
  log(message) {
    try {
      // Implementación para registrar en un archivo
      const logMessage = `${new Date().toISOString()} - ${message}`;
      fs.appendFileSync('logs/application.log', logMessage);
    } catch (error) {
      console.error('Error al registrar en el archivo:', error);
    }
  }
}
```

ARCHIVO: src/logs/strategies/consoleLogger.js

```javascript
class ConsoleLogger {
  log(message) {
    try {
      // Implementación para registrar en la consola
      console.log(`${new Date().toISOString()} - ${message}`);
    } catch (error) {
      console.error('Error al registrar en la consola:', error);
    }
  }
}
```

ARCHIVO: src/utils/fileCleanup.js

```javascript
import fs from 'fs';
import path from 'path';

export function cleanFiles(directory) {
  try {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.unlinkSync(filePath);
      console.log(`Archivo ${file} eliminado.`);
    });
  } catch (error) {
    console.error('Error al limpiar archivos:', error);
  }
}
```

ARCHIVO: src/config/config.js

```javascript
export const config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  logStrategy: process.env.LOG_STRATEGY || 'file',
};
```

ARCHIVO: src/index.js

```javascript
import { config } from './config/config.js';
import { FileLogger, ConsoleLogger } from './logs/strategies/index.js';
import { cleanFiles } from './utils/fileCleanup.js';

function getLogger() {
  switch (config.logStrategy) {
    case 'file':
      return new FileLogger();
    case 'console':
      return new ConsoleLogger();
    default:
      throw new Error('Invalid log strategy');
  }
}

const logger = getLogger();
logger.log('Inicio de la aplicación');

// Llamada a la función de limpieza de archivos
cleanFiles('logs');
cleanFiles('data_recovery');
```

ARCHIVO: package.json

```json
{
  "name": "proyecto-de-fabrica-de-agentes",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/index.js",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^12.0.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "tailwindcss": "^2.2.19"
  },
  "devDependencies": {
    "eslint": "^7.32.0",
    "eslint-config-next": "^12.0.0"
  }
}
```

ARCHIVO: .gitignore

```
node_modules
.next
public/
logs/
data_recovery/
*.log
*.tmp
```

ARCHIVO: README.md

```markdown
# Proyecto de Fábrica de Agentes

Este proyecto tiene como objetivo desarrollar un sistema autónomo de gestión de sprints con IA, que incluya un sistema de logs detallado para el seguimiento de eventos en la función de recuperación de datos. Además, se implementará una limpieza de archivos que elimine aquellos que ya no sean necesarios.

## Estructura de Carpetas

```
/proyecto-de-fabrica-de-agentes
├── src/
│   ├── logs/
│   ├── data_recovery/
│   ├── utils/
│   ├── config/
│   ├── public/
│   └── index.js
├── package.json
├── .gitignore
├── README.md
└── ARCHITECTURE.md
```

## Tecnologías Utilizadas

- **Next.js**: Para el desarrollo de la aplicación web.
- **React**: Para la interfaz de usuario.
- **Tailwind**: Para el diseño.
- **Node.js**: Para el backend.
- **Ollama**: Para la IA.
- **Trello API**: Para la integración con Trello.
- **GitHub API**: Para la integración con GitHub.

## Patrones de Diseño

### Patrón de Registro (Logging)

Se utilizará el patrón de diseño **Strategy** para implementar diferentes estrategias de registro dependiendo del entorno de ejecución (desarrollo, producción, etc.).

### Limpieza de Archivos

Se utilizará el patrón de diseño **Command** para la limpieza de archivos antiguos y no utilizados.

## Estructura del Código

### logs/strategies/fileLogger.js

```javascript
class FileLogger {
  log(message) {
    try {
      // Implementación para registrar en un archivo
      const logMessage = `${new Date().toISOString()} - ${message}`;
      fs.appendFileSync('logs/application.log', logMessage);
    } catch (error) {
      console.error('Error al registrar en el archivo:', error);
    }
  }
}
```

### logs/strategies/consoleLogger.js

```javascript
class ConsoleLogger {
  log(message) {
    try {
      // Implementación para registrar en la consola
      console.log(`${new Date().toISOString()} - ${message}`);
    } catch (error) {
      console.error('Error al registrar en la consola:', error);
    }
  }
}
```

### utils/fileCleanup.js

```javascript
import fs from 'fs';
import path from 'path';

export function cleanFiles(directory) {
  try {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.unlinkSync(filePath);
      console.log(`Archivo ${file} eliminado.`);
    });
  } catch (error) {
    console.error('Error al limpiar archivos:', error);
  }
}
```

### config/config.js

```javascript
export const config = {
  logLevel: process.env.LOG_LEVEL || 'info',
  logStrategy: process.env.LOG_STRATEGY || 'file',
};
```

### index.js

```javascript
import { config } from './config/config.js';
import { FileLogger, ConsoleLogger } from './logs/strategies/index.js';
import { cleanFiles } from './utils/fileCleanup.js';

function getLogger() {
  switch (config.logStrategy) {
    case 'file':
      return new FileLogger();
    case 'console':
      return new ConsoleLogger();
    default:
      throw new Error('Invalid log strategy');
  }
}

const logger = getLogger();
logger.log('Inicio de la aplicación');

// Llamada a la función de limpieza de archivos
cleanFiles('logs');
cleanFiles('data_recovery');
```

## Instrucciones para Desarrollo

1. Clona el repositorio.
2. Instala las dependencias con `npm install`.
3. Configura las variables de entorno en `config/config.js`.
4. Ejecuta la aplicación con `npm start`.
```
```