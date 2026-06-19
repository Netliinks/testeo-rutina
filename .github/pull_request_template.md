## ¿Qué intenta lograr este MR?

<!-- Describe el objetivo del cambio. -->

## ¿Por qué es necesario?

<!-- Contexto, problema o riesgo que se aborda. -->

## ¿Cómo vas a comprobar que este MR hace lo que esperas?

<!-- Pruebas locales, CI, revisión de logs, validación en Azure, etc. -->

## ¿Qué te da confianza de que funcionará y no causará un incidente?

<!-- Ej.: pruebas realizadas, alcance acotado, feature flags, revisión con el equipo, etc. -->

## ¿Cómo vas a corregir o mitigar si el cambio sale mal?

<!-- Ej.: revert del MR, rollback de imagen, restauración desde WAL-G, plan de comunicación, etc. -->

## Tipo de cambio

<!-- p. ej.: funcionalidad, corrección, documentación, mantenimiento, CI -->

## Cómo verificarlo

<!-- p. ej.: docker compose -f examples/from-code/compose.yml … -->

## Lista de comprobación

- [ ] Rama con prefijo `feature/<descripción-corta>`
- [ ] Mensajes de commit alineados con [Conventional Commits](https://www.conventionalcommits.org/) (ver **`AGENTS.md`**)
- [ ] **Todas las pipelines de este MR están en verde** (requisito para fusionar)
- [ ] Documentación o ejemplos actualizados si cambia el comportamiento o la configuración
