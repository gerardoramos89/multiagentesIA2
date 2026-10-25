# Proyecto de Fábrica de Agentes

## Despliegue y Configuración de Variables de Entorno

### 1. Estructura de Carpetas

#### General

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

#### Detallada

##### `src/`

- **`components/`**: Componentes reutilizables de React.
- **`pages/`**: Páginas de la aplicación Next.js.
- **`utils/`**: Funciones y utilidades reutilizables.
- **`providers/`**: Provedores de contexto y estado global.
- **`services/`**: Servicios para interactuar con APIs externas (Trello API, GitHub API).
- **`types/`**: Definiciones de tipos TypeScript.
- **`hooks/`**: Hooks personalizados.
- **`assets/`**: Recursos estáticos como imágenes, fuentes, etc.
- **`config/`**: Configuraciones específicas de la aplicación.

##### `public/`

Recursos estáticos accesibles públicamente.

##### `.env.local`

Variables de entorno específicas de desarrollo.

##### `.env.development`

Variables de entorno para el entorno de desarrollo.

##### `.env.production`

Variables de entorno para el entorno de producción.

##### `package.json`

Dependencias y scripts de la aplicación.

##### `next.config.js`

Configuración de Next.js.

##### `tailwind.config.js`

Configuración de Tailwind CSS.

##### `tsconfig.json`

Configuración de TypeScript.

### 2. Variables de Entorno

#### Variables Obligatorias

- **`NEXT_PUBLIC_API_KEY`**: Clave API para acceso a servicios externos.
- **`NEXT_PUBLIC_API_SECRET`**: Secreto API para acceso a servicios externos.
- **`NEXT_PUBLIC_OLLAMA_URL`**: URL de la API de Ollama.
- **`NEXT_PUBLIC_TRELLO_API_KEY`**: Clave API de Trello.
- **`NEXT_PUBLIC_TRELLO_API_TOKEN`**: Token API de Trello.
- **`NEXT_PUBLIC_GITHUB_TOKEN`**: Token de acceso para GitHub API.

#### Configuración de Variables

1. **Crear el archivo `.env.local`**:
   ```env
   NEXT_PUBLIC_API_KEY=your_api_key
   NEXT_PUBLIC_API_SECRET=your_api_secret
   NEXT_PUBLIC_OLLAMA_URL=https://api.ollama.com
   NEXT_PUBLIC_TRELLO_API_KEY=your_trello_api_key
   NEXT_PUBLIC_TRELLO_API_TOKEN=your_trello_api_token
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
   ```

2. **Configuración de Variables de Desarrollo (`env.development`)**:
   ```env
   NEXT_PUBLIC_API_KEY=dev_api_key
   NEXT_PUBLIC_API_SECRET=dev_api_secret
   NEXT_PUBLIC_OLLAMA_URL=https://api.ollama.com/dev
   NEXT_PUBLIC_TRELLO_API_KEY=dev_trello_api_key
   NEXT_PUBLIC_TRELLO_API_TOKEN=dev_trello_api_token
   NEXT_PUBLIC_GITHUB_TOKEN=dev_github_token
   ```

3. **Configuración de Variables de Producción (`env.production`)**:
   ```env
   NEXT_PUBLIC_API_KEY=prod_api_key
   NEXT_PUBLIC_API_SECRET=prod_api_secret
   NEXT_PUBLIC_OLLAMA_URL=https://api.ollama.com/prod
   NEXT_PUBLIC_TRELLO_API_KEY=prod_trello_api_key
   NEXT_PUBLIC_TRELLO_API_TOKEN=prod_trello_api_token
   NEXT_PUBLIC_GITHUB_TOKEN=prod_github_token
   ```

### 3. Ejecución de la Aplicación

- **Desarrollo**:
  ```bash
  npm run dev
  ```

- **Producción**:
  ```bash
  npm run build
  npm start
  ```

### 4. Documentación de Despliegue

Para obtener más detalles sobre el despliegue y configuración de la aplicación, por favor consulte la [documentación oficial de Next.js](https://nextjs.org/docs/deployment).

---

Este archivo proporciona una guía detallada para el despliegue y configuración de variables de entorno en el proyecto de Fábrica de Agentes. Asegúrese de proteger todas las variables sensibles y seguir las prácticas recomendadas de seguridad informática.