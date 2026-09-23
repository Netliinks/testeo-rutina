# Plan de Implementación - Remoción de QR y Botones de Eliminación

Este plan detalla los cambios necesarios para eliminar el código QR en las pantallas de empleados, contratistas y clientes, y eliminar el botón de eliminación en todas las pantallas excepto en "consignas fijas" y "usuarios de rutina".

## Cambios Propuestos

### 1. Remoción de QR (Empleados, Contratistas, Clientes)

Se eliminará el elemento `img#qrcode`, el botón de descarga y la lógica asociada (`QRious` y función `download`) en los siguientes archivos:
- [employees.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/users/employees/employees.js)
- [Contractors.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/users/contractors/Contractors.js)
- [clients.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/users/clients/clients.js)

### 2. Remoción de Botón de Eliminación

Se eliminará el botón con `id="remove-entity"` y la lógica asociada (llamada al método `remove()` y definición del método `remove()`) en todas las pantallas identificadas, excepto:
- [Fixed.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/assignment/tasks/fixed/Fixed.js)
- [Template.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/assignment/tasks/fixed/Template.js)
- [Users.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/routines/routines/users/Users.js)
- [Template.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/routines/routines/users/Template.js)

#### Archivos a modificar (Remover botón Eliminar):
- [Procedures.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/assignment/procedures/Procedures.js)
- [Sporadic.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/assignment/tasks/sporadic/Sporadic.js)
- [TasksTime.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/assignment/tasks/taskstime/TasksTime.js)
- [Departments.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/departments/Departments.js)
- [Locations.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/routines/locations/Locations.js)
- [Relations.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/routines/relations/Relations.js)
- [Routines.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/routines/routines/Routines.js)
- [Schedules.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/routines/routines/schedules/Schedules.js)
- [Tags.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/tags/Tags.js)
- [SuperUsers.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/users/SuperUsers/SuperUsers.js)
- [blacklist.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/users/blacklist/blacklist.js)
- [guards.js](file:///C:/Users/ASUS/Documents/GitLab/web/netguard-web-cs/public/public/src/scripts/views/users/guards/guards.js)
- Y todos los archivos `Templates.js` correspondientes (excepto los de fixed tasks y routine users).

## Verificación
- Abrir las pantallas de Empleados, Contratistas y Clientes para verificar que el QR ha desaparecido.
- Navegar por todas las pantallas del sistema para verificar que el botón de eliminar no está presente, excepto en Consignas Fijas y Usuarios de Rutina.
