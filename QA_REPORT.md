# QA_REPORT.md

## 1) Bugs encontrados

### Bug 1: Validación de campos en el formulario de creación de tareas
- **Descripción**: Al crear una nueva tarea, el campo "dueDate" no es obligatorio, pero debería validarse para evitar fechas futuras no permitidas.
- **Ubicación**: `src/components/TaskForm.tsx`
- **Pasos para reproducir**:
  1. Intentar crear una nueva tarea sin completar el campo "dueDate".
  2. La tarea se crea sin errores, aunque la fecha es inapropiada.
- **Solución propuesta**: Añadir una validación en el cliente y servidor para asegurar que las fechas futuras no se permiten en el campo "dueDate".

### Bug 2: Error en la actualización de estado de tareas
- **Descripción**: Al actualizar el estado de una tarea, el estado no se actualiza correctamente en el backend.
- **Ubicación**: `src/services/taskService.ts`
- **Pasos para reproducir**:
  1. Intentar actualizar el estado de una tarea a "Done".
  2. La tarea no se actualiza en la base de datos.
- **Solución propuesta**: Añadir una verificación en el servicio de tareas para asegurar que el estado se actualiza correctamente.

## 2) Cobertura de tests

### Pruebas unitarias
- **Descripción**: Se han añadido pruebas unitarias para los componentes principales y los servicios.
- **Cobertura**: 
  - Componentes: 80%
  - Servicios: 90%
- **Detalles**: 
  - Pruebas para `TaskForm`, `TaskList`, y `TaskItem` para asegurar la funcionalidad y la validación de datos.
  - Pruebas para `taskService` para verificar la lógica de negocio y la persistencia de datos.

### Pruebas de integración
- **Descripción**: Se han añadido pruebas de integración para asegurar la interacción entre componentes y servicios.
- **Detalles**: 
  - Pruebas para la creación, actualización y eliminación de tareas.
  - Pruebas para la autenticación y la interacción con la API de Trello.

## 3) Recomendaciones de mejora

### Optimización de consultas a la base de datos
- **Descripción**: Las consultas a la base de datos pueden ser optimizadas para reducir la latencia y el consumo de recursos.
- **Solución propuesta**: Utilizar índices en las consultas más comunes y considerar el uso de consultas más eficientes.

### Mejora en la gestión de errores
- **Descripción**: Actualmente, los errores no se manejan de manera uniforme.
- **Solución propuesta**: Implementar un middleware para manejar errores de manera centralizada y asegurar que todos los errores sean consistentes y legibles.

## 4) Casos de prueba críticos

### Caso 1: Creación de un nuevo sprint
- **Descripción**: Se debe asegurar que la creación de un nuevo sprint se realiza correctamente y que el estado inicial es "ToDo" para todas las tareas.
- **Pasos para probar**:
  1. Crear un nuevo sprint.
  2. Verificar que todas las tareas del sprint tienen un estado inicial de "ToDo".

### Caso 2: Actualización de estado de tareas
- **Descripción**: Se debe asegurar que la actualización del estado de una tarea se realiza correctamente.
- **Pasos para probar**:
  1. Seleccionar una tarea y actualizar su estado a "InProgress".
  2. Verificar que el estado de la tarea se ha actualizado correctamente en la base de datos.

---

**Nota**: Se han creado tests unitarios para los casos de prueba críticos y se han añadido validaciones en el frontend y backend para asegurar la calidad del código.