# MultiagentesIA - Fábrica Autónoma

## Descripción del Proyecto

**Nombre:** MultiagentesIA - Fábrica Autónoma

**Objetivo:** Desarrollar un sistema autónomo de gestión de sprints con IA donde agentes especializados colaboren para construir software de forma iterativa, con memoria persistente versionada en Git y auto-aprendizaje continuo.

## Estructura de Carpetas

### `src/`

#### `components/`

Componentes reutilizables de React.

#### `pages/`

Páginas de la aplicación Next.js.

#### `utils/`

Funciones y utilidades reutilizables.

#### `providers/`

Provedores de contexto y estado global.

#### `services/`

Servicios para interactuar con APIs externas (Trello API, GitHub API).

#### `types/`

Definiciones de tipos TypeScript.

#### `hooks/`

Hooks personalizados.

#### `assets/`

Recursos estáticos como imágenes, fuentes, etc.

#### `config/`

Configuraciones específicas de la aplicación.

### `public/`

Recursos estáticos a los que se puede acceder directamente.

## Guía de Instalación Paso a Paso

### Requisitos

- Node.js v14.x o superior
- npm o yarn

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/multiagentesia-fabrica-autonoma.git
cd multiagentesia-fabrica-autonoma
```

### Paso 2: Instalar Dependencias

```bash
npm install
# o
yarn install
```

### Paso 3: Configurar Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto y configurar las siguientes variables:

```env
NEXT_PUBLIC_TRELLO_API_KEY=tu_api_key_de_trello
NEXT_PUBLIC_TRELLO_TOKEN=tu_token_de_trello
NEXT_PUBLIC_GITHUB_TOKEN=tu_token_de_github
```

### Paso 4: Ejecutar la Aplicación

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Ejemplos de Uso

### Flujo de Trabajo de los Agentes

1. **Agentes de Sprint Planning:**
   - Utilizan la API de Trello para crear y gestionar tarjetas de sprint.
   - Integran con la API de GitHub para versionar el código de manera continua.

2. **Agentes de Desarrollo:**
   - Desarrollan funcionalidades específicas utilizando React y TypeScript.
   - Utilizan servicios personalizados para interactuar con APIs externas.

3. **Agentes de IA:**
   - Utilizan el modelo de IA Ollama para tomar decisiones automatizadas.
   - Integran con el flujo de trabajo de Trello y GitHub para optimizar el proceso de desarrollo.

## Cómo la Arquitectura Diseñada Resuelve el Problema

La arquitectura del proyecto está diseñada para maximizar la eficiencia y la colaboración entre los agentes. Cada agente tiene una función específica pero se integra perfectamente gracias a:

- **Servicios Reutilizables:** Los servicios en `services/` proporcionan una capa de abstracción para interactuar con APIs externas, facilitando la reutilización de código y la escalabilidad.
- **Estado Global:** Los provedores en `providers/` mantienen el estado global de la aplicación, asegurando que todos los componentes puedan acceder a los datos necesarios.
- **Integración Continua:** La integración con GitHub API permite una gestión de versiones eficiente y una rápida detección de cambios.

## Variables de Entorno

Las siguientes variables de entorno deben configurarse en el archivo `.env.local`:

- `NEXT_PUBLIC_TRELLO_API_KEY`: API key de Trello.
- `NEXT_PUBLIC_TRELLO_TOKEN`: Token de Trello.
- `NEXT_PUBLIC_GITHUB_TOKEN`: Token de GitHub.

## Flujo de Trabajo de los Agentes

El flujo de trabajo de los agentes se describe en la sección de **Ejemplos de Uso**.

## Contribución

Si deseas contribuir al proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama para tu funcionalidad: `git checkout -b mi-nueva-funcionalidad`.
3. Realiza los cambios y haz commit: `git commit -m 'Añadir nueva funcionalidad'`.
4. Haz push a la rama: `git push origin mi-nueva-funcionalidad`.
5. Abre una Pull Request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

¡Gracias por usar MultiagentesIA - Fábrica Autónoma!