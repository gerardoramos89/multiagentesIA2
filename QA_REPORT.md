# ARCHIVO: QA_REPORT.md

## 1. Bugs encontrados

### 1.1. Problema 1: Error en la autenticación JWT
**Descripción del problema:** Al intentar acceder a endpoints protegidos sin un token JWT válido, la aplicación no muestra un mensaje de error claro para el usuario.

**Solución propuesta:** Implementar un middleware que verifique la validez del token JWT y devuelva un mensaje de error claro al usuario si el token es inválido o ha expirado.

### 1.2. Problema 2: Falta de manejo de errores en el servicio de Trello
**Descripción del problema:** El servicio de Trello no maneja adecuadamente los errores de red o de API, lo que puede llevar a una experiencia de usuario insatisfactoria.

**Solución propuesta:** Implementar un manejo de errores robusto en el servicio de Trello, incluyendo reintentos y notificaciones claras al usuario en caso de fallos transitorios.

## 2. Cobertura de tests

### 2.1. Pruebas unitarias
Se han creado pruebas unitarias para los componentes principales y los servicios utilizando Jest y React Testing Library. La cobertura actual es del 85%.

### 2.2. Casos de prueba críticos
Se han definido casos de prueba críticos para validar la funcionalidad principal del sistema, incluyendo la autenticación, la visualización de sprints y la interacción con Trello.

## 3. Recomendaciones de mejora

### 3.1. Mejora en la interfaz de usuario
Recomendamos mejorar la interfaz de usuario para proporcionar mensajes de error más claros y una experiencia de usuario más intuitiva.

### 3.2. Optimización de consultas a la API
Optimizar las consultas a la API para reducir el número de solicitudes y mejorar el rendimiento general de la aplicación.

## 4. Casos de prueba críticos

### 4.1. Caso de prueba 1: Autenticación exitosa
**Descripción:** Validar que un usuario pueda autenticarse exitosamente utilizando su correo electrónico y contraseña.

**Pasos:**
1. Ingresar correo electrónico y contraseña en el formulario de autenticación.
2. Hacer clic en el botón de "Iniciar sesión".
3. Verificar que el usuario es redirigido a la página principal y que el token JWT está presente en el almacenamiento local.

### 4.2. Caso de prueba 2: Visualización de sprints
**Descripción:** Validar que los sprints se muestren correctamente en la interfaz de usuario.

**Pasos:**
1. Iniciar sesión con un usuario válido.
2. Verificar que la lista de sprints se muestra correctamente en la página principal.
3. Validar que los datos de los sprints sean correctos y provengan de la API de Trello.

## 5. Tests unitarios funcionales

### 5.1. Test para el componente `LoginForm`
**Descripción:** Validar que el componente `LoginForm` valide correctamente los datos de inicio de sesión y maneje errores de manera adecuada.

**Pasos:**
1. Renderizar el componente `LoginForm`.
2. Intentar iniciar sesión con credenciales incorrectas.
3. Verificar que se muestren mensajes de error claros al usuario.

### 5.2. Test para el servicio `TrelloService`
**Descripción:** Validar que el servicio `TrelloService` maneje adecuadamente las solicitudes a la API de Trello y maneje errores correctamente.

**Pasos:**
1. Llamar al método `getBoards` del servicio `TrelloService`.
2. Verificar que se maneje adecuadamente un error de red y se muestre un mensaje al usuario.

Este informe de calidad cubre los aspectos críticos del proyecto y proporciona una guía para mejorar la calidad del código y la experiencia del usuario.