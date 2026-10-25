# Estructura de Carpetas

## Estructura General

```
grtec-memory/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── providers/
│   ├── services/
│   ├── types/
│   ├── hooks/
│   ├── assets/
│   └── config/
├── public/
├── .env.local
├── .env.development
├── .env.production
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Estructura de Carpetas Detallada

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

Recursos estáticos accesibles públicamente.

### `.env.local`

Variables de entorno específicas de desarrollo.

### `.env.development`

Variables de entorno para el entorno de desarrollo.

### `.env.production`

Variables de entorno para el entorno de producción.

### `package.json`

Dependencias y scripts de la aplicación.

### `next.config.js`

Configuración de Next.js.

### `tailwind.config.js`

Configuración de Tailwind CSS.

### `tsconfig.json`

Configuración de TypeScript.

### `README.md`

Documentación del proyecto.

# Patrones de Persistencia de Datos

## Esquemas JSON de Sprints

```json
{
  "sprint": {
    "id": "UUID",
    "name": "string",
    "startDate": "date",
    "endDate": "date",
    "tasks": [
      {
        "id": "UUID",
        "title": "string",
        "description": "string",
        "status": "ToDo | InProgress | Done",
        "dueDate": "date"
      }
    ]
  }
}
```

## Patrones de Persistencia

### Base de Datos

Utilizaremos MongoDB como base de datos NoSQL debido a su flexibilidad y escalabilidad.

### ORM

Utilizaremos Mongoose como ORM para interactuar con MongoDB.

### Patrón de Repositorio

Implementaremos un patrón de repositorio con repositorios abstractos para mantener una separación clara de responsabilidades.

### Patrón de Servicios

Utilizaremos servicios para manejar la lógica de negocio, asegurando que los controladores de rutas solo se ocupen de la interacción con los datos.

# Decisiones Técnicas

## ADR-001: Uso de Next.js y React

Utilizaremos Next.js para el desarrollo de la aplicación debido a su enfoque en SSR (Server-Side Rendering) y su facilidad para manejar rutas estáticas y dinámicas. React se utilizará para la construcción de interfaces de usuario reactivas y eficientes.

## ADR-002: Estilo con Tailwind CSS

Utilizaremos Tailwind CSS para el diseño de la aplicación debido a su enfoque en clases utilitarias y su capacidad para generar diseños rápidos y consistentes.

## ADR-003: Autenticación con Ollama

Utilizaremos Ollama para la autenticación de usuarios debido a su robustez y capacidad para manejar tokens de acceso y verificación.

## ADR-004: Seguridad en la API

Implementaremos medidas de seguridad como autenticación de OAuth 2.0, validación de entradas y protección contra ataques comunes utilizando middlewares en Node.js.

## ADR-005: Escalabilidad

Para asegurar la escalabilidad, utilizaremos un enfoque de microservicios con servicios de backend y frontend desplegados en contenedores de Docker. Además, implementaremos patrones de caché y balanceo de carga para reducir la carga en los servidores.

# Seguridad

## Autenticación y Autorización

Utilizaremos OAuth 2.0 con Passport para la autenticación de usuarios. Todas las solicitudes a la API requerirán un token de acceso válido.

## Protección de Datos

Todos los datos sensibles se almacenarán de manera cifrada en la base de datos MongoDB. Además, se implementarán políticas de acceso basado en roles para proteger los datos según el nivel de acceso del usuario.

## Pruebas y Validaciones

Implementaremos pruebas unitarias y de integración utilizando Jest y Supertest para asegurar que la aplicación funcione correctamente y para detectar errores temprano.

# Reducción de Deuda Técnica

## Revisión Continua

Realizaremos revisiones continuas de código utilizando herramientas como SonarQube para identificar y corregir problemas de calidad y seguridad en el código.

## Refactorización Regular

Realizaremos refactorizaciones periódicas para mantener el código limpio y modular, asegurando que la aplicación sea fácil de mantener y escalar.

## Documentación

Documentaremos todas las decisiones técnicas y arquitectura en este archivo `ARCHITECTURE.md`, y proporcionaremos documentación de usuario en el `README.md` para facilitar la comprensión y uso del proyecto por parte de los usuarios y mantenedores.