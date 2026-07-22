# Auditoría de sincronización funcional Móvil ↔ Empresa — 22/07/2026

## Qué se pidió

Actualizar la documentación de Darivo Pro Empresa usando como referencia la de Darivo Pro Móvil: misma funcionalidad y comportamiento de negocio en todos los módulos compartidos, sin inventar nada y sin tocar diseño (la diferencia entre ambos productos debe ser solo diseño/UX). Única excepción: el módulo Roles y Permisos de Empresa sigue la lógica ya definida en la documentación de Darivo Pro Admin (el Gerente administra los permisos de los empleados), no la de Móvil.

Los módulos Inicio, Clientes, Facturación y Cierre ya estaban diseñados y bloqueados — no debían rediseñarse, solo corregirse el contenido funcional si no coincidía con Móvil.

## Punto de partida (verificado antes de tocar nada)

`INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` marcaba los 9 módulos como "Producción completada" desde el 02/07/2026. Por la Regla de Oro (verificar antes de afirmar) esa etiqueta no se dio por buena — se auditó el contenido real de los 7 módulos compartidos (Inicio, Clientes, Cotizaciones, Facturas, Más, IA, Cierre) contra su equivalente Móvil vigente, con 7 agentes de solo lectura en paralelo, cada uno comparando exclusivamente contenido funcional (nunca diseño/UX).

## Causa raíz encontrada (confirmada, no sospecha)

En 6 de los 7 módulos, el MD de Empresa citaba en su propia tabla de fuentes (§0) una versión de Móvil **anterior** a la vigente en ese momento — es decir, Empresa se escribió correctamente contra el Móvil de su fecha, pero nunca se resincronizó cuando Móvil siguió evolucionando. El módulo Cierre es la excepción: sin gaps, completamente sincronizado.

## Verificado — corregido en esta sesión

| Módulo | Gap encontrado | Corrección aplicada | Versión |
|---|---|---|---|
| **Inicio** | Empresa mantenía "Accesos rápidos" a Clientes y Cotizaciones que el propietario eliminó de Móvil el 06/07/2026 (v1.1) — Empresa se había basado en Móvil v1.0 | Eliminada la sección completa (§4 layout, antigua §5.4, §6, §7, §8) + corregido el destino de «Ver todos →» | v2.2 → v2.3 |
| **Clientes** | Faltaba §8 completa de Móvil (5 estados de facturación electrónica + reglas de sincronización de borrado Cliente↔Factura); faltaba regla anti-bug de no ocultar fila hasta confirmar DELETE real; faltaba persistencia de nombre/teléfono en cotizaciones desvinculadas | Añadidas las 3 — nueva §8 "Relación con Facturación" | v1.0 → v1.1 |
| **Cotizaciones** | Contradicción directa: Empresa afirmaba "no existe lista global" citando a Móvil §3, cuando Móvil §3 confirma que sí existe (`/cotizaciones`, decisión vigente 07/2026); faltaba acción Compartir en la lista de acciones §6 | Añadida §3.1 documentando la lista global; añadida Compartir a §6 | v1.2 → v1.3 |
| **Facturas** | Faltaba dónde se muestra el "motivo del rechazo" (Rechazada) y dónde vive la acción "Reintentar" (Pendiente de envío) — Móvil las exige, Empresa no las ubicaba | Añadidas ambas en §5.5 (lista) y §6.4 (editor) | v1.3 → v1.4 |
| **Más** | Faltaba el modelo de soporte de dos niveles (IA + Humano, regla de no inventar, responsable del cierre) y las reglas de pago fallido/cancelación de Mi Plan — Empresa se había basado en Móvil v1.9 | Añadidas ambas en §6/§8 | v1.0 → v1.1 |
| **IA** | Faltaban §3-A (identidad de Darivo: nunca dice "IA/bot/chatbot", fuente única de conocimiento) y §3-B (sub-capacidad de ayuda a armar cotización) de Móvil; contradicción en la matriz de planes (Empresa decía Básico sin IA, Móvil dice Básico con IA limitada) | Añadidas §3-A y §3-B dentro de §10; corregida la matriz de §12 | v1.3 → v1.4 |
| **Cierre** | Ninguno | — | v1.0 (sin cambios) |

**Roles y Permisos (excepción del encargo):** ya estaba construido siguiendo la lógica de Admin (Gerente administra permisos de empleados) desde v1.1, con el modelo de permisos por módulo activable y roles personalizados. Solo se corrigió una cita interna desactualizada (Admin v1.5 → v1.6, el documento Admin real). Sin gaps funcionales de fondo.

Todas las correcciones son de **contenido funcional únicamente** — ningún módulo bloqueado (Inicio, Clientes, Facturación, Cierre) tuvo cambios de diseño/layout más allá de retirar el bloque de accesos rápidos prohibido en Inicio (no es un rediseño, es quitar una funcionalidad que el propio Móvil prohíbe desde el 06/07/2026).

`INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` §4 actualizado con las versiones reales de los 6 MD tocados.

## Pendiente (no se tocó, corresponde a Mohamed)

* **Módulo Cotizaciones-Empresa §3.1 (lista global):** nueva pantalla documentada por primera vez — no tiene imagen oficial. Por Reglas §7.1 esto no bloquea la documentación, pero si se aprueba el diseño, falta generar la imagen.
* **Botón "+ Nueva cotización" en la barra de herramientas de la lista de Clientes:** el propio MD de Móvil es ambiguo aquí (un botón con dos etiquetas separadas por "/", sin describir el comportamiento de la segunda). No se inventó — queda sin resolver hasta que el propietario aclare si es una acción real.
* Imágenes oficiales de Facturas (chips de estado ya desactualizados desde antes de esta auditoría, ver `06-MODULO-FACTURAS-EMPRESA.md` §2/§5.2) y de Roles (roles personalizados §6.1) — pendientes desde antes, no generadas en esta sesión (fuera del alcance: solo documentación, sin diseño).

## Sospecha (no verificada — señalar, no dar por cierto)

* El propio MD Móvil de Más (`07-MODULO-MAS.md`) tiene su cabecera desactualizada (dice v2.1, su propio §10 "Estado del documento" registra v2.2 como vigente) — inconsistencia interna de Móvil, no de Empresa. No se tocó Móvil (fuera de alcance de esta tarea).
