# Plan de Corrección: Ordenamiento de Registros de Rutinas

El objetivo es corregir el orden de los registros en la tabla de "Registros de Rutinas" para que se muestren de forma cronológica descendente según la fecha y hora en que ocurrieron (columna Fecha), en lugar del orden de inserción en el sistema.

## User Review Required

> [!IMPORTANT]
> Se cambiará el criterio de ordenamiento del servidor de `createdDate` (fecha de creación en sistema) a `creationDate` y `creationTime` (fecha y hora del evento).
> También se ajustará la lógica de actualización automática para que mantenga este orden al insertar nuevos registros en tiempo real.

## Proposed Changes

### [Routine Details Component]

#### [MODIFY] [Details.js](file:///C:/Users/ASUS/Documents/GitHub/testeo-rutina/public/src/scripts/views/routines/details/Details.js)

1.  **Cambiar `sort` en las consultas**:
    *   Modificar las dos ocurrencias de `sort: "-createdDate"` por `sort: "-creationDate,-creationTime,-createdDate"`.
    *   Esto asegura que el servidor devuelva los datos ordenados por la fecha del evento, y en caso de empate, use la fecha de sistema.

2.  **Ajustar lógica de Actualización Automática**:
    *   Después de agregar nuevos registros con `dataPage.unshift(newRecord)`, se añadirá una llamada a `dataPage.sort()` para garantizar que la lista se mantenga ordenada cronológicamente en el cliente antes de renderizar.

## Verification Plan

### Manual Verification
1.  Entrar a la vista "Registros de Rutinas".
2.  Verificar que la columna "Fecha" muestre un orden descendente perfecto (ej: 15:52, luego 15:50, luego 15:40, etc.).
3.  Esperar a que aparezcan nuevos registros automáticamente y verificar que se posicionen en su lugar correspondiente según su hora, y no simplemente al principio si su hora es anterior a la del registro superior.
