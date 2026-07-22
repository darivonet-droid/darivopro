# Eliminación del módulo "Más" — navegación directa en Darivo Pro Empresa (22/07/2026)

## Qué se pidió

En Darivo Pro Empresa, el sidebar no debe tener una entrada "Más" que agrupe funcionalidades secundarias. Cada una de esas funcionalidades debe tener su propia entrada directa en el panel lateral, igual que ya funciona en Darivo Pro Admin (sidebar plano, sin agrupador intermedio). Solo reorganización de navegación — sin tocar lógica ni funcionalidad de los módulos. No aplicaba a Darivo Pro Móvil (su "Más" en la navegación inferior no se toca, existe por limitación de espacio de una barra de 6 posiciones).

## Referencia usada

Sidebar real de Darivo Pro Admin (`02-darivo-pro-admin/00-PANEL-ADMIN-DASHBOARD.md` §4): 12 entradas planas, cada concepto con su propia entrada (incluida "Configuración", acotada solo a cuenta personal — perfil, credenciales, sesión — según `02-darivo-pro-admin/11-PANEL-ADMIN-CONFIGURACION.md`).

## Mapeo aplicado (contenido de "Más" → nueva entrada de sidebar)

| Contenido anterior de Más (Móvil §6) | Nueva entrada sidebar Empresa | Posición |
|---|---|---|
| Categorías + Mis Tarifas | Catálogo · Mis Tarifas | 6 |
| Empresa (datos) | Empresa | 9 |
| Informes | Informes | 10 |
| Documentos | Documentos | 11 |
| Mi Plan | Mi Plan | 12 |
| Soporte (tickets) | Soporte | 13 |
| Perfil + IA-Preferencias + Preferencias generales | Configuración | 14 |

Empleados (7) y Roles y Permisos (8), ya existentes como entradas propias, mantienen su posición entre Cierre (5) y Catálogo (6)/Empresa (9).

Ningún contenido se inventó: los 7 destinos nuevos son exactamente los mismos 7 elementos que ya documentaba `07-MODULO-MAS-EMPRESA.md` v1.1 (pestañas Categorías/Mis Tarifas/Empresa + panel "Más opciones" con Perfil/Informes/Documentos/Mi Plan/IA-Preferencias/Soporte/Preferencias generales) — solo cambia el contenedor de navegación.

## Archivos modificados

* `01-VISION-DEL-PRODUCTO.md` v2.18→v2.19 — §16 añadida "Excepción de navegación — Darivo Pro Empresa": aclara que la diferencia es de organización de navegación, no de funcionalidad; no afecta a Móvil.
* `03-darivo-pro-empresa/16-SISTEMA-DE-DISEÑO-EMPRESA.md` v2.6→v2.7 — §5.1 (sidebar) sin fila "Más", con tabla nueva de las 7 entradas y sus posiciones; §6.7 "Patrón Más" reemplazada por "Patrón navegación directa (ex-Más)".
* `03-darivo-pro-empresa/07-MODULO-MAS-EMPRESA.md` v1.1→v2.0 — reescrito completo: ya no describe una pantalla "Más" con tabs + panel lateral, describe 7 pantallas independientes (§5.1–§5.7), una por nueva entrada de sidebar. El archivo conserva su nombre y numeración `07` por continuidad de referencias cruzadas del resto de la documentación de Empresa.
* `03-darivo-pro-empresa/INDICE-OFICIAL-DARIVO-PRO-EMPRESA.md` v4.2→v4.3 — fila 7 de §4 actualizada; §6 (imágenes) marca la imagen antigua de Más como obsoleta y anota 7 imágenes nuevas pendientes; §8 (APIs) actualizado (dLocal ya no cita "Más — Mi Plan", cita "Mi Plan §5.5"; Soporte ya no cita "Más").
* `03-darivo-pro-empresa/REGLAS-OFICIALES-DARIVO-PRO-EMPRESA.md` v2.5→v2.6 — tabla de orden de producción (§13) y texto de §15 actualizados de "Más" a "Navegación directa (ex-Más)".
* Referencias cruzadas corregidas en las tablas "Relaciones con otros módulos" de: `02-MODULO-INICIO-EMPRESA.md`, `03-MODULO-CLIENTES-EMPRESA.md`, `05-MODULO-COTIZACIONES-EMPRESA.md`, `06-MODULO-FACTURAS-EMPRESA.md`, `08-MODULO-IA-EMPRESA.md`, `09-MODULO-CIERRE-EMPRESA.md`, `10-MODULO-EMPLEADOS-EMPRESA.md`, `11-ROLES-PLANES-PERMISOS-EMPRESA.md`.

## Verificado

* Grep de `\bMás\b` en toda `03-darivo-pro-empresa/` tras los cambios — todas las menciones restantes son explicativas ("ex-Más", "antes agrupadas en Más"), ninguna deja la navegación real con una entrada "Más" activa.
* El Agente IA 2 ("Darivo", soporte conversacional) sigue viviendo en el módulo IA (sidebar 3) — la nueva pantalla "Soporte" (13) es solo para tickets estructurados creados directamente por el Gerente; esta distinción ya existía antes del cambio y se conservó igual.

## Pendiente (no se tocó, corresponde a quien genera imágenes)

* 7 imágenes oficiales nuevas, una por pantalla (`07-MODULO-MAS-EMPRESA.md` §5.1–§5.7). La imagen antigua de "Más" queda obsoleta. Por Reglas §7.1 esto no bloquea la documentación ya entregada.

## Sospecha (no verificada)

* Este cambio es puramente documental (MD). No se tocó código ni componentes de `frontend/` — la implementación real del sidebar de Empresa en código no se verificó en esta sesión (fuera de alcance: la tarea pedida fue de documentación).
