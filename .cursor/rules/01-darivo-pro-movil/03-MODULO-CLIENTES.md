# DARIVO PRO — MÓDULO CLIENTES
## Diseño + Funcionalidad
### Versión: 1.4 — 05/07/2026
### Fuente: diseño Fable 5 (ClientsScreen + ClientDetail) + código real construido

**Cambio principal (v1.4):** §8 corregido — alineado con los 5 estados oficiales de facturación (`01-VISION-DEL-PRODUCTO.md` §18) y con `06-MODULO-FACTURAS.md` §1; eliminado el estado inexistente "Verificada" y la regla que exigía cotización previa obligatoria.

⚠️ Este documento es la ÚNICA fuente autorizada para el diseño y funcionalidad de Clientes. Ninguna IA puede modificar esto sin aprobación.

> **Sistema de diseño:** Para colores, iconos, componentes, navegación y animaciones → **ver 16-SISTEMA-DE-DISEÑO-FABLE5.md**. En caso de contradicción, prevalece Fable 5.

---

## 1. QUÉ ES EL MÓDULO CLIENTES

Cliente es el **centro del flujo** de Darivo Pro. Conecta Cotizaciones y Facturas.

**Acceso en Darivo Pro Móvil:** posición **Clientes** (2) de la navegación principal (`01-VISION-DEL-PRODUCTO.md` §5).

Se alimenta de 2 formas:

```
FORMA 1 — Manual:
Usuario va a "Clientes" → "+ Nuevo cliente"
→ Solo pide Nombre + Teléfono (obligatorios)
→ Se guarda sin necesidad de tener cotización/factura

FORMA 2 — Automática:
Usuario crea una Cotización con nombre+teléfono de cliente
→ Si el teléfono (normalizado) ya existe, se asocia 
  a ese cliente existente
→ Si no existe, se crea automáticamente
```

---

## 2. DATOS DEL CLIENTE

| Campo | Obligatorio | Cuándo se pide |
|-------|-------------|------------------|
| Nombre | ✅ Sí | Al crear (manual o automático) |
| Teléfono | ✅ Sí | Al crear (manual o automático) |
| Ciudad | ❌ No | Opcional, se completa después |
| RUC/DNI | ❌ No | Solo se exige al momento de FACTURAR |
| Notas | ❌ No | Opcional |

**Regla de normalización de teléfono (crítica):**
```
Al guardar y al comparar, el teléfono SIEMPRE se 
normaliza quitando: espacios, símbolos (+, -, paréntesis), 
y el prefijo de país peruano (51).

Ejemplo: "+51 999 123 456" → "999123456"
Ejemplo: "51999123456" → "999123456"
Ejemplo: "999123456" → "999123456" (sin cambio)

Esto evita duplicados como el caso real detectado: 
cliente "José" creado 4 veces por formatos de teléfono 
distintos.
```

**Regla anti-duplicados:**
```
Un cliente único = mismo (user_id + teléfono normalizado)
Existe índice único en base de datos sobre esa combinación.
```

---

## 3. PANTALLA — LISTA DE CLIENTES (nav principal: "Clientes")

### Diseño (Fable 5 — ClientsScreen)

```
HEADER (T.navy #0A1628, gradiente 160deg, esquinas 
inferiores redondeadas 26px — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.1):
- Título "Clientes" (blanco, bold, 20px)
- Subtítulo: "[N] contactos" (T.textLight, 13px)
- Buscador: input con fondo translúcido blanco 10%, 
  placeholder "🔍 Buscar cliente…"

LISTA (fondo T.slate #F1F5F9 — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §3):
Cada cliente es una card blanca, radius 14px, borde 
T.slateD, con:
- Avatar circular gradiente azul (blue→blueL), 
  inicial del nombre en blanco bold
- Nombre del cliente (bold, 15px)
- Ciudad · nº cotizaciones · nº aprobadas (texto gris, 11px)
- Importe total acumulado (azul, bold, derecha)
- Flecha (chevron) a la derecha
- Toda la card es clickeable → abre Ficha de Cliente

BOTÓN INFERIOR:
"+ Nueva cotización" / "+ Nuevo cliente" — borde 
punteado gris (I.plus, T.textLight), texto T.textMid
(botón dashed)
```

### Funcionalidad
```
- Buscador filtra en tiempo real por nombre
- Lista ordenada por: más reciente actividad primero
- Cada card muestra el conteo REAL de cotizaciones 
  (leído de la base de datos vía relación cliente_id, 
  no cacheado)
- Botón "+ Nuevo cliente": abre formulario mínimo 
  (Nombre + Teléfono obligatorios, resto opcional)
```

---

## 4. PANTALLA — FICHA DE CLIENTE (al tocar un cliente)

### Diseño (Fable 5 — ClientDetail)

```
HEADER (T.navy, mismo estilo DarkHeader — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.1):
- Botón "← Clientes" (I.back, BackBtn — ver 16 §6.2)
- Avatar circular grande (56px) gradiente azul 
  (T.blue→T.blueL), inicial en blanco
- Nombre del cliente (blanco, bold, 20px)
- Ciudad (si existe, T.textLight debajo)
- 3 botones de acción rápida en fila 
  (fondo translúcido blanco 7%, borde translúcido 12%):
  📱 WhatsApp (I.wa, #25D366) → abre wa.me con su teléfono
  📞 Llamar (I.phone, T.green) → abre tel:
  ✉️ Email (I.mail, T.blue) → si no tiene email, Toast informativo

CUERPO (fondo T.slate #F1F5F9 — ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §3):
3 tarjetas de estadísticas en fila:
- Cotizaciones (T.blue) | Aprobadas (T.green) | Total S/ (T.amber)
(ver 16-SISTEMA-DE-DISEÑO-FABLE5.md §6.3 — cards de estadísticas)

Card de contacto (blanca, radius 14px):
- Teléfono (con I.phone)
- Ciudad (con I.tag)
- Editable al tocar

Sección "Historial" + botón "+ Nuevo" (T.blue, esquina 
superior derecha):
Lista de cotizaciones de ESE cliente únicamente, cada 
una mostrando:
- Resumen de partidas (primeras palabras)
- Fecha · nº partidas
- Importe total (T.blue, bold)
- Chips de estado: Borrador/Pendiente/Aprobado 
  (tocables para cambiar — colores fijos)
- Botón [I.pdf  PDF]   (secundario)

Fila de acciones (Fable 5 — debajo de chips de estado, 
borde superior T.slateD, gap 6px, flexWrap):
[I.edit Editar]        — secundario borde T.slateD
[I.convert Re-cotizar] — secundario borde azul suave (T.blue)
[I.share Compartir]    — secundario borde T.slateD
[I.receipt Facturar]   — secundario borde verde (solo si Aprobado)
[I.trash Eliminar]     — destructivo rojo, alineado a la derecha
```

### Funcionalidad
```
- "+ Nuevo" → abre wizard de cotización con este 
  cliente YA preseleccionado (no hay que volver a 
  escribir nombre/teléfono)
- Cada cotización en el historial tiene sus botones 
  funcionales: Editar, Re-cotizar, Eliminar, 
  Compartir, → Facturar (ver diseño Fable 5 arriba)
- "→ Facturar": pregunta Empresa (pide RUC obligatorio) 
  o Particular (pide DNI obligatorio), genera la factura 
  real, que pasa a la pestaña "Facturas"
- El estado de cada cotización/factura mostrado aquí 
  SIEMPRE se lee en tiempo real de la base de datos 
  (nunca cacheado) — esto evita el bug de 
  desincronización entre Cliente y Facturas
- Botón eliminar cliente: hace DELETE real en Supabase; 
  si falla, debe mostrar error claro y NO ocultar la 
  fila visualmente hasta confirmar que se borró de verdad
```

---

## 5. REGLAS DE NEGOCIO (resumen)

```
✅ Cliente se puede crear, editar, eliminar libremente
✅ Eliminar un cliente NO borra sus cotizaciones — 
   solo las desvincula (quedan con cliente_id = NULL, 
   pero mantienen el nombre/teléfono como texto)
✅ Mínimo de datos al crear: Nombre + Teléfono (como WhatsApp)
✅ RUC/DNI solo se exige al facturar, nunca antes
✅ Un cliente = único por (usuario + teléfono normalizado)
```

---

## 6. BUGS CONOCIDOS A CORREGIR (estado: pendiente)

```
🔴 Cliente "José" duplicado 4 veces — causa: 
   normalización de teléfono no quitaba el prefijo 51; 
   migración 014 ejecutó backfill antes de crear el 
   índice único
🔴 Botón eliminar reaparece al recargar — el DELETE 
   puede fallar silenciosamente; falta manejo de error 
   visible
```

---

## 7. Relación con Cotizaciones

- Se puede crear un cliente directamente desde el módulo Clientes.
- Durante el wizard de cotización, el paso **Cliente** (Paso 3) asocia o crea el cliente automáticamente (`05-MODULO-COTIZACIONES.md` §2).
- Un cliente puede tener múltiples cotizaciones.
- Todas las cotizaciones quedan asociadas al cliente tras confirmar (Guardar).

---

## 8. Relación con Facturación

- Una factura puede generarse a partir de una cotización Aprobada, o crearse directamente desde cero (ver `06-MODULO-FACTURAS.md` §1).
- Todas las facturas quedan asociadas al cliente.
- Desde la ficha del cliente pueden consultarse todas sus facturas.
- Desde la ficha del cliente puede iniciarse una nueva cotización.
- Existe una única factura en el sistema, identificada por su número de factura. Los módulos Clientes y Facturación trabajan sobre esa misma factura; no existen copias.
- Cualquier modificación autorizada realizada en una factura se refleja automáticamente en ambos módulos.
- Estados oficiales de facturación electrónica: **Borrador, En proceso, Emitida, Rechazada, Pendiente de envío** (`01-VISION-DEL-PRODUCTO.md` §18; `06-MODULO-FACTURAS.md` §1).
- Si una factura en estado **Borrador**, **Rechazada** o **Pendiente de envío** se elimina desde cualquiera de los dos módulos, desaparecerá automáticamente del otro.
- Si una factura está **Emitida**, no podrá eliminarse desde ningún módulo.

---

## 9. Flujos oficiales

### Flujo 1

```
Cliente

↓

Nueva Cotización

↓

Categoría → Partida (selección)

↓

Resumen

↓

Cliente (Paso 3)

↓

Guardar → Factura (posterior, si Aprobado)
```

### Flujo 2 (alternativo)

```
Cotización (desde Inicio o IA)

↓

Selección → Resumen → Cliente

↓

Guardar cotización

↓

Crear factura (posterior)
```

---

## 10. Relación con otros documentos

Este documento depende de:

- `21 – ARQUITECTURA DEL CATÁLOGO MAESTRO, TARIFA PRO Y MOTOR DE COTIZACIÓN – DARIVO PRO.md`
- `05-MODULO-COTIZACIONES.md` (05 – MÓDULO COTIZACIONES – DARIVO PRO)
- `06-MODULO-FACTURAS.md` (06 – MÓDULO FACTURACIÓN – DARIVO PRO)

---

*Este documento describe Clientes únicamente. Para arquitectura oficial y flujos integrados, ver sección 10 y documento 21.*
