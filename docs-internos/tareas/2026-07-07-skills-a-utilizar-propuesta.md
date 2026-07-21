# Skills a utilizar (confirmado por el propietario, 07/07/2026)

De las skills personales disponibles, usar solo estas 6 (7 comandos, Review+Ultrareview cuentan como una pareja):

| Skill | Qué hace | Cuándo usarla en este proyecto |
|---|---|---|
| **/Skill-Creator** | Convierte descripciones de flujos de trabajo en una skill reutilizable | Para crear las skills propias de Darivo Pro (ver propuesta de 6 skills del 07/07/2026 más abajo) |
| **/Superpowers** | Obliga a planificar y analizar requisitos/casos límite antes de ejecutar, evita cambios improvisados | Usar en cualquier tarea de código nueva (Módulo 05, middleware, migración BD) — encaja con la disciplina de "muéstrame el diff antes de aplicar" que ya seguimos hoy |
| **/GSD (Get Stuff Done)** | Mantiene el foco en tareas largas | Útil para las tareas largas de varios pasos ya definidas en este documento |
| **/Review y /Ultrareview** | Analiza el propio código para detectar y corregir errores antes de producción | Usar después de cada tarea de código, antes de dar el commit por bueno — refuerza la verificación que ya hacíamos manualmente |
| **/Context-Mode** | Mantiene coherencia en conversaciones largas, evita degradación | Útil dado que este proyecto tiene mucho historial acumulado (Visión, Suscripciones, Roles, etc.) |
| **/Claude-Mem** | Memoria entre sesiones — recuerda proyecto y contexto semanas después | Especialmente valioso aquí: permite que Claude Code recuerde este handoff sin depender de que releas todo este `CLAUDE.md` cada vez |

**Propuesta de 6 skills propias de Darivo Pro** (a construir con /Skill-Creator, no ahora — cuando Mohamed lo indique):

1. `auditoria-darivo-pro` — clona el repo real, compara documentación vs código, busca contradicciones/referencias rotas/versiones desincronizadas.
2. `verificar-main` — compara archivos concretos de `main` contra una versión esperada, confirma si un commit se aplicó bien.
3. `sincronizar-vision` — cuando cambia `01-VISION-DEL-PRODUCTO.md`, identifica qué otros MD referencian esa sección.
4. `nuevo-modulo-md` — crea un MD de módulo nuevo con la plantilla oficial exacta.
5. `prompt-cursor-seguro` — genera prompts para Cursor con pasos numerados y verificación antes de acciones destructivas.
6. `modelo-financiero-darivo` — construye/actualiza el Excel de comisiones y proyecciones con fórmulas, no valores fijos.

