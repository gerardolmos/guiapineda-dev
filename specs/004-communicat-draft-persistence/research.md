# Research: Persistencia segura del borrador de Comunicats

## Decision 1: Ampliar el adaptador compartido, no duplicarlo

**Decision**: Extender `src/lib/submissionDraft.ts` con scope `comunicat` y soporte estricto para
grupos de radios allowlisted, manteniendo su API y la semántica de Agenda.

**Rationale**: El helper ya resuelve envelope, allowlist, sesión de pestaña, fallos y ciclo de
limpieza. Comunicats solo añade una clase necesaria de control: `tipus_remitent` es un grupo de seis
radios. Centralizar la frontera evita dos implementaciones de seguridad divergentes.

**Alternatives considered**: crear un helper exclusivo duplicaría seguridad; persistir el radio
aparte dividiría el contrato; generalizar todos los controles abriría tipos excluidos.

## Decision 2: Scope y clave propios, compartidos entre idiomas

**Decision**: Usar `{ version: 1, scope: "comunicat", fields }` bajo
`guiapineda:submission-draft:v1:comunicat` para CA, ES y EN.

**Rationale**: Separa Agenda de Comunicats sin separar idiomas. Las tres rutas comparten origen y
representan una única propuesta durante la sesión.

**Alternatives considered**: la clave de Agenda colisionaría; claves por idioma romperían continuidad;
`localStorage`, timestamps o TTL aumentarían retención y contradicen la decisión humana.

## Decision 3: Proyección cerrada de siete valores

**Decision**: El caller suministra exactamente siete nombres. El adaptador guarda strings de
controles textuales permitidos y el valor exacto del radio; restaura radios solo por coincidencia con
una opción vigente.

**Rationale**: La lista positiva excluye imagen, honeypot, consentimiento, hidden, token y campos
futuros. La coincidencia exacta impide inventar tipos de remitente.

**Alternatives considered**: `FormData`, denylist y coerción se rechazan por ampliar o reinterpretar
datos fuera del contrato.

## Decision 4: Restaurar antes de verificación y derivar después

**Decision**: Restaurar directamente antes de iniciar verificación; después arrancar el controlador
fresco y reconciliar silenciosamente el primer paso y todo estado derivado.

**Rationale**: El email reaparece como texto sin convertirse en autorización. Recalcular aplica las
reglas actuales sin persistir estado obsoleto.

**Alternatives considered**: eventos sintéticos podrían activar efectos laterales; persistir paso,
preview o validez está fuera de allowlist; volver al último paso fue rechazado en CLARIFY.

## Decision 5: Mantener valores inválidos y bloquear

**Decision**: No recortar strings allowlisted. Recalcular formato y longitudes, incluyendo validación
explícita de `maxlength` para asignaciones por script con mensajes CA/ES/EN, siguiendo Agenda.

**Rationale**: `maxlength` nativo no garantiza `tooLong` en valores asignados por JS. La SPEC exige
valor visible y bloqueo hasta corrección.

**Alternatives considered**: truncar pierde contenido; rechazar todo el envelope pierde campos
recuperables; confiar solo en validez nativa no cubre restauración programática.

## Decision 6: Ciclo de vida nativo de pestaña

**Decision**: Guardar en `input`/`change`, limpiar en reset y después de éxito confirmado, conservar
ante fallo y delegar el final a `sessionStorage`.

**Rationale**: Replica Agenda y evita pérdida durante navegación lingüística.

**Alternatives considered**: limpiar al submit perdería datos ante error; unload/pagehide rompería
CA/ES/EN; un botón nuevo queda fuera de alcance.

## Decision 7: Validación local sin dependencia nueva

**Decision**: Build, sondas temporales fuera del repositorio, inspección de contrato y matriz local
CA/ES/EN, incluyendo regresión de Agenda.

**Rationale**: No existe runner, lint ni `astro check`; añadirlos excede el alcance y el build solo
no demuestra comportamiento.

**Alternatives considered**: Vitest/Playwright requieren decisión de QA separada; el E2E remoto no
existe todavía.

## Existing implementation conclusion

No se necesita markup ni copy nuevo. Los siete controles y las tres variantes ya comparten un
componente. La implementación mínima modifica el helper y el orquestador de Comunicats; cualquier
necesidad fuera de esos archivos debe detener IMPLEMENT.
