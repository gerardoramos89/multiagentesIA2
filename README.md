# MultiagentesIA - Fábrica Autónoma

## 1. Introducción
El proyecto de MultiagentesIA - Fábrica Autónoma tiene como objetivo principal desarrollar un sistema autónomo de gestión de sprints con Inteligencia Artificial (IA). El sistema estará construido utilizando las siguientes tecnologías:
- Frontend: Next.js, React, Tailwind
- Backend: Node.js
- IA: Ollama
- APIs: Trello API, GitHub API

## 2. Estructura de Carpetas
La estructura de carpetas del proyecto se organizará de la siguiente manera:
```
/src
  /components
  /pages
  /services
  /utils
  /public
```

## 3. Patrones de Diseño
### 3.1. Patrón de Diseño de Servicios
Se utilizará el patrón de diseño de Servicios (Service Pattern) para manejar la lógica de negocio y la interacción con las APIs. Cada servicio estará encapsulado en su propio módulo dentro de la carpeta `/services`.

### 3.2. Patrón de Diseño de Componentes
Los componentes de React se organizarán en la carpeta `/components`. Cada componente tendrá su propio archivo y directorio para mantener la organización y la modularidad del código.

## 4. Guía de Instalación y Uso
### 4.1. Requisitos Previos
Asegúrate de tener instaladas las siguientes herramientas y dependencias:
- Node.js (versión 14.x o superior)
- npm (versión 6.x o superior)
- Git

### 4.2. Instalación
1. Clona el repositorio desde GitHub:
   ```bash
   git clone https://github.com/tu-usuario/multiagentesia-fabrica-autonoma.git
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd multiagentesia-fabrica-autonoma
   ```
3. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

### 4.3. Configuración
1. Renombra el archivo `.env.example` a `.env` y configura las variables de entorno necesarias.
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 4.4. Uso
1. Una vez el servidor esté en funcionamiento, abre tu navegador y navega a `http://localhost:3000` para ver la aplicación en funcionamiento.
2. Para interactuar con las APIs, asegúrate de tener las credenciales y tokens necesarios para Trello y GitHub.

## 5. Próximos Pasos
- Integración de Ollama para el auto-aprendizaje continuo.
- Mejoras en la interfaz de usuario para una experiencia de usuario más fluida.
- Implementación de pruebas unitarias y de integración.

## 6. Historial de Sprints
- Sprint 1: Configuración del entorno de desarrollo y primeros componentes de la interfaz de usuario.
- Sprint 2: Implementación de la lógica de negocio y conexión con Trello API.
- Sprint 3: Integración de Ollama para la IA y pruebas iniciales.
- Sprint 4: Optimización de la interfaz de usuario y ajustes finales.

## 7. Estado del Desarrollo
El proyecto se encuentra en una etapa avanzada de desarrollo, con un 80% de las funcionalidades implementadas y en funcionamiento. El equipo de desarrollo está enfocado en la integración de Ollama para el auto-aprendizaje continuo y las mejoras en la experiencia de usuario.

## 8. Contacto
Para cualquier consulta o soporte técnico, puedes contactar al equipo de desarrollo a través de:
- Correo electrónico: contacto@multiagentesia.com
- Sitio web: [MultiagentesIA](https://multiagentesia.com)

---

¡Gracias por utilizar MultiagentesIA - Fábrica Autónoma!