# MultiagentesIA - Fábrica Autónoma

## Descripción del Proyecto

**Nombre:** MultiagentesIA - Fábrica Autónoma

**Objetivo:** Desarrollar un sistema autónomo de gestión de sprints con IA donde agentes especializados colaboren para construir software de forma iterativa, con memoria persistente versionada en Git y auto-aprendizaje continuo.

## Estado del Desarrollo

El proyecto se encuentra en una fase avanzada de desarrollo. Se han implementado las siguientes funcionalidades:

- **Integración con Ollama:** Sistema de IA para la gestión de sprints y toma de decisiones.
- **API de Trello:** Para la gestión de tareas y seguimiento de progreso.
- **API de GitHub:** Para la gestión de repositorios y control de versiones.
- **Sistemas de Logs:** Registro detallado de eventos y errores en la función de recuperación de datos.
- **Limpieza de Archivos:** Eliminación de archivos no utilizados para liberar espacio.

## Historial de Sprints

- **Sprint 1:** Configuración del entorno de desarrollo y primeros avances en la integración con Ollama.
- **Sprint 2:** Implementación de la API de Trello para la gestión de tareas.
- **Sprint 3:** Desarrollo de la API de GitHub para el control de versiones y gestión de repositorios.
- **Sprint 4:** Implementación de sistemas de logs y limpieza de archivos.

## Guía de Instalación y Uso

### Requisitos

- Node.js v14.x o superior
- npm v6.x o superior
- Git

### Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/proyecto-de-fabrica-de-agentes.git
   cd proyecto-de-fabrica-de-agentes
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno (ver `config/config.env.example` y renombrar a `config.env`):
   ```bash
   cp config/config.env.example config/config.env
   ```

4. Ejecuta la aplicación:
   ```bash
   npm start
   ```

### Ejemplos de Uso

1. **Gestión de Sprints:**
   ```bash
   npm run sprint:start
   ```

2. **Recuperación de Datos:**
   ```bash
   npm run data:recover
   ```

## Próximos Pasos

- **Mejora de la IA:** Implementar modelos de aprendizaje más avanzados para la IA.
- **Integración con Herramientas de Colaboración:** Mejorar la integración con herramientas de colaboración para un flujo de trabajo más eficiente.
- **Optimización de Limpieza de Archivos:** Implementar un sistema de clasificación para archivos a eliminar.

## Arquitectura del Proyecto

### Estructura de Carpetas

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

### Descripción de las Carpetas y Archivos

- **logs/**:** Contendrá los registros detallados de eventos y errores.
- **data_recovery/**:** Contendrá la lógica para la recuperación de datos.
- **utils/**:** Contendrá funciones utilitarias reutilizables.
- **config/**:** Contendrá la configuración de la aplicación.
- **public/**:** Contendrá los archivos estáticos.
- **index.js**: Punto de entrada principal de la aplicación.

## Conclusion

El proyecto MultiagentesIA - Fábrica Autónoma se enfoca en la creación de un sistema autónomo de gestión de sprints con IA, utilizando tecnologías modernas como Next.js, React, Tailwind, Node.js, Ollama, Trello API y GitHub API. La arquitectura diseñada permite una gestión eficiente de los sprints, la recuperación de datos detallada y la limpieza de archivos no utilizados, todo ello con un enfoque en la eficiencia y la precisión.

---

Este README.md proporciona una visión general del proyecto, incluyendo su objetivo, estado del desarrollo, historial de sprints, guía de instalación y uso, y arquitectura. Está estructurado de manera clara y concisa, facilitando la comprensión y la implementación del proyecto por parte de cualquier desarrollador interesado.