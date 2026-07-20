# POLÍTICA DE PRIVACIDAD — DARIVO PRO

**Última actualización:** [fecha de publicación]
**Última revisión de este borrador:** 16/07/2026.

---

## 1. Responsable del tratamiento

**[Nombre completo / razón social]**, con domicilio en España, [NIF/DNI].

Contacto para temas de privacidad: [email de contacto específico, ej. privacidad@darivopro.com — mientras tanto, cualquier consulta puede dirigirse a info@darivopro.com]

## 2. Qué datos recopilamos

| Categoría | Ejemplos | De dónde viene |
|---|---|---|
| Datos de registro | Nombre, email, teléfono, nombre de empresa | Los introduces tú al registrarte |
| Datos de tu actividad | Clientes, cotizaciones, facturas que creas en la plataforma | Los introduces tú al usar el servicio |
| Datos de pago | Referencia de pago (no el número completo de tarjeta) | A través de nuestro proveedor de pagos |
| Datos técnicos | Dirección IP, tipo de dispositivo, cookies de sesión | Automáticamente al usar la web/app |

**No recopilamos** datos de salud, ideología, orientación sexual ni otras categorías especiales de datos — Darivo Pro no los necesita para funcionar.

## 3. Para qué usamos tus datos

* Prestar el servicio (crear cotizaciones, facturas, gestionar clientes).
* Procesar pagos de tu suscripción.
* Comunicarnos contigo (soporte, avisos importantes del servicio, correos transaccionales como confirmación de pago o cambio de plan).
* Cumplir obligaciones legales (ej. conservación de facturas según normativa fiscal aplicable).
* Mejorar el servicio (analítica básica de uso, de forma agregada cuando sea posible).
* Si usas el programa de Partners: registrar qué Partner te refirió, para calcularle su comisión correctamente.

## 4. Con quién compartimos tus datos

Darivo Pro utiliza los siguientes proveedores para prestar el servicio — cada uno trata datos únicamente para la finalidad indicada, bajo sus propias garantías de seguridad. Esta tabla se mantiene sincronizada con `INVENTARIO-PROVEEDORES-DATOS-DARIVO-PRO.md` (verificado contra el código real, última revisión 16/07/2026):

| Proveedor | Para qué | Qué datos toca |
|---|---|---|
| **Supabase** | Base de datos, autenticación y almacenamiento de archivos (ej. los PDF de tus cotizaciones/facturas) | Todos los datos que introduces en la plataforma |
| **Vercel** | Alojamiento/despliegue de la aplicación web | Todo el tráfico de la aplicación (indirectamente, como alojamiento) |
| **Google Workspace (Gmail API)** | Envío de correos transaccionales del servicio (bienvenida, confirmación de pago, cambio de plan, comisión de Partner, etc.) | Tu email, nombre, y el contenido del correo enviado |
| **OpenAI** | Funcionalidades de la calculadora inteligente (generación de cotizaciones asistida, análisis de gastos/fotos) | El texto (y, si aplica, la imagen) que envías al asistente |
| **dLocal Go** | Procesamiento de pagos de tu suscripción, mediante checkout redirigido a su propio dominio | Email y monto de la suscripción. Darivo Pro **no almacena el número completo de tu tarjeta** — ese dato lo procesa dLocal directamente |
| **GitHub** | Repositorio de código fuente del proyecto y automatización de despliegue (CI/CD) | Ninguno de tus datos personales — solo trata el código del producto, nunca tus cotizaciones, clientes o facturas |
| **Railway** | Hosting de un componente de backend interno (uso legacy/opcional) | Los datos que ese componente procese, si está en uso |
| **[Proveedor OSE de facturación electrónica, cuando se confirme]** | Emisión de comprobantes electrónicos certificados ante la autoridad tributaria peruana | Datos completos de las facturas emitidas — **servicio todavía no contratado**, se actualizará esta tabla en cuanto exista |

**No vendemos tus datos a terceros con fines publicitarios.**

*(⚠️ Punto que requiere confirmación legal: si alguno de estos proveedores transfiere datos fuera de la UE/España — por ejemplo, servidores en EE.UU. — puede requerir cláusulas contractuales tipo (SCC) u otra base legal de transferencia internacional bajo RGPD. Confirmar región de los centros de datos de Supabase y Vercel, y revisar los propios términos de cada proveedor, con abogado.)*

## 5. Quién dentro de Darivo Pro puede ver tus datos

El acceso interno a tus datos está limitado por rol y aplicado a nivel de base de datos (no solo como política de uso), mediante Row Level Security (RLS) de Supabase:

* **Si usas Darivo Pro Móvil o Empresa (Gerente/Técnico):** solo tú (y, en el caso de Empresa, el resto de tu propia organización) puedes ver tus clientes, cotizaciones y facturas — el sistema los aísla por cuenta. Darivo Pro Empresa todavía no distingue permisos técnicos diferentes entre Gerente y Técnico dentro de una misma empresa (ambos ven los datos de esa empresa); esto es una limitación conocida, pendiente de activación futura, no un dato compartido con terceros.
* **Si participas en el programa de Partners:** un Partner **solo** puede ver su propio perfil, su propio enlace de referido, la lista de personas que se registraron a través de ese enlace (registro, no su actividad dentro de la plataforma) y sus propias comisiones. Un Partner **nunca** puede ver los datos de otros Partners, ni las cotizaciones/facturas/clientes de las cuentas que refirió, ni modificar ningún dato — su acceso es exclusivamente de lectura sobre su propia información.
* **El equipo de Darivo Pro (Administrador Darivo):** el personal interno autorizado tiene acceso completo a la plataforma para poder operar el servicio, dar soporte, gestionar suscripciones y administrar el programa de Partners — de forma equivalente a como cualquier proveedor de software necesita poder acceder a los datos de su propia infraestructura para mantenerla funcionando. Este acceso está restringido a una lista cerrada de personas autorizadas explícitamente (no es de acceso libre para todo el equipo).

*(⚠️ Confirmar con abogado si esta descripción necesita ampliarse — por ejemplo, si se requiere detallar más el rol de "Administrador Darivo" como encargado/responsable de tratamiento, o añadir un registro de actividades de tratamiento formal.)*

## 6. Tus derechos

Dependiendo de tu país de residencia, tienes derecho a:

* Acceder a tus datos personales.
* Rectificar datos incorrectos.
* Solicitar la eliminación de tus datos ("derecho al olvido").
* Oponerte al tratamiento u solicitar su limitación.
* Solicitar la portabilidad de tus datos.

Para ejercer cualquiera de estos derechos, escríbenos a [email de contacto de privacidad].

*(Usuarios en España/UE: derechos reconocidos por el RGPD. Usuarios en Perú: derechos reconocidos por la Ley de Protección de Datos Personales peruana — confirmar con asesor legal que la redacción cubre correctamente ambos marcos.)*

## 7. Conservación de datos

Conservamos tus datos mientras mantengas una cuenta activa en Darivo Pro, y durante el plazo adicional que exija la normativa fiscal/mercantil aplicable tras la baja (ej. conservación de facturas).

## 8. Seguridad

Aplicamos medidas técnicas razonables para proteger tus datos (cifrado en tránsito, control de acceso por rol a nivel de base de datos, copias de seguridad). Ningún sistema es 100% invulnerable; te recomendamos usar una contraseña robusta y no compartirla.

## 9. Cookies

Darivo Pro utiliza cookies propias, no de terceros: cookies técnicas necesarias para mantener tu sesión iniciada, y una cookie de atribución para el programa de Partners. **No usamos cookies de analítica ni de publicidad** (verificado en el código a fecha de esta revisión). El detalle completo — qué cookies usamos, cuánto duran y cómo gestionarlas — está en nuestra Política de Cookies (darivopro.com/cookies).

## 10. Menores de edad

Darivo Pro está dirigido a profesionales y empresas. No está diseñado para ser usado por menores de edad, y no recopilamos conscientemente datos de menores.

## 11. Cambios en esta política

Podemos actualizar esta Política de Privacidad. Los cambios relevantes se notificarán mediante el correo electrónico registrado o un aviso en la plataforma.

---

## ANEXO — Consideraciones específicas por país

### Anexo Perú

* Base legal general: Ley N.º 29733, Ley de Protección de Datos Personales del Perú, y su Reglamento (D.S. N.º 003-2013-JUS), supervisada por la Autoridad Nacional de Protección de Datos Personales (ANPD, antes bajo el MINJUS).
* [Pendiente de confirmación con asesor legal peruano: si Darivo Pro, como titular del banco de datos con información de usuarios peruanos, debe inscribir dicho banco de datos ante el Registro Nacional de Protección de Datos Personales, y qué otras obligaciones formales aplican (ej. designar responsable de tratamiento local).]

### Anexo [Próximo país] — plantilla para replicar

* [ ]
