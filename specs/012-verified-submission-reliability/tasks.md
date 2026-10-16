# Tasks: Verified Submission Reliability

**Feature**: 012-verified-submission-reliability | **Fecha**: 2026-10-16 | **Branch observada**: main
**Input**: spec.md, plan.md, research.md, data-model.md, contracts/submission-reliability.md, quickstart.md y Constitution 1.0.0.
**Estado**: tareas futuras; ninguna ejecutada. IMPLEMENT no iniciado. Sin commit/push.

## Convenciones y límites

Cada tarea incluye archivo, dependencia, requisito y evidencia de aceptación. Todos los IDs están en orden de ejecución. Las cuatro historias tienen prioridad P1; US4 se ejecuta primero para respetar el orden seguro del PLAN: pruebas de contrato → transporte interno → recuperación común → feedback → integración y regresiones. Los casos que reproducen un defecto deben fallar por ese defecto antes del cambio correspondiente; los casos positivos y de comportamiento preservado pueden pasar ya en baseline. Errores de infraestructura no cuentan como reproducción.

Allowlist de implementación cerrada:

| Archivo | Escritura permitida |
|---|---|
| src/lib/emailVerificationController.ts | Registro y recuperación común |
| src/lib/netlifySubmission.ts | Taxonomía e integración cliente |
| src/components/EmailVerificationBlock.astro | Feedback y destino por scope |
| netlify/functions/_shared/strapi-submission.mjs | Solo transporte interno activo |
| scripts/qa/submission-recovery-qa.mjs | Nuevo harness específico |
| scripts/qa/commerce-submission-qa.mjs | Solo dos dobles de éxito 204 incompatibles |

`scripts/qa/multisection-reporting-qa.mjs` y los QA de drafts son solo ejecución/lectura. Los cinco flows, ocho handlers, package.json, lockfile, infraestructura y todo guiapineda-strapi permanecen read-only. No SQLite, .env, servicios reales, nuevas dependencias, schemas, migraciones, DB o moderación. Los artefactos SDD de esta feature pueden reflejar avance y CONVERGE; no amplían la allowlist ejecutable.

Si una tarea requiere otro archivo: registrar BLOCKER con evidencia en este tasks.md, detener la parte dependiente y solicitar ampliación antes de editar; no declarar safe to implement. No hay blockers pendientes tras las correcciones SDD de ANALYZE descritas al final.

Preflight de generación: frontend main, HEAD=origin/main local `4355ee1c7c8207304bc5af3025ea994141e78990`; backend main, HEAD=origin/main local `47ca26a0a54fd1c0193afd659b6ba3657b264793`; ambos 0/0. Sin staged/modified; solo siete artefactos SDD 012 untracked en frontend; backend limpio. Sin hooks extensions.yml.


## Phase 1: Setup

**Objetivo**: Confirmar alcance y preparar aislamiento sin instalar nada.

**Validación independiente**: Baseline y guardas registrados antes de cambios.

- [X] T001 Repetir preflight de ambos repositorios y contrastar `specs/012-verified-submission-reliability/plan.md`: branch, HEAD, origin/main local, ahead/behind, staged, modified y untracked; STOP ante cambios ajenos. Registrar baseline en este `tasks.md` sin abrir SQLite. **Dep:** ninguna. **Traza:** FR-017, Constitution IV/VII; gate Git.

- [X] T002 Crear estructura de modos unit/functions/dom/build/browser/cleanup-probes en `scripts/qa/submission-recovery-qa.mjs` con inventario esperado, fallo ante skips, bloqueo de red externa y recursos temporales identificados por ownership. Validar que no lee .env/backend/SQLite ni instala dependencias. **Dep:** T001. **Traza:** FR-014/017; guardas QA.


## Phase 2: Foundational

**Objetivo**: Fijar modelo efímero y fronteras de prueba comunes.

**Validación independiente**: Módulos reales cargables sin red; tipos no contienen datos privados.

- [X] T003 Definir en `src/lib/emailVerificationController.ts` el tipo común de fallo sin política duplicada: kind con los cuatro valores del contrato, «status opcional, reason opcional, requestStarted», y «persistence (not-started para fallo local/prerechazo probado, unknown para post/ambiguous)». Para verification-invalid usar unknown sin inferir intentos anteriores. «No payload, email ni token en el error o logs». Validar compatibilidad con Error en transporte. **Dep:** T002. **Traza:** FR-002–005/014; QA01–05.

- [X] T004 Añadir a `scripts/qa/submission-recovery-qa.mjs` cargador VM de módulos reales con linker controlado y stripTypeScriptTypes cuando proceda; sustituir únicamente fronteras Redis/email/fetch/Strapi, con GETDEL de memoria y contadores. Añadir DOM mínimo y reloj controlado, sin reescribir fuentes con regex. Validar carga de los ocho handlers y ausencia de conexiones externas. **Dep:** T003. **Traza:** FR-013/014; QA09/13–24.


## Phase 3: US4 — Aceptación confirmada (P1, F03)

**Objetivo**: Cerrar primero el contrato compartido de los ocho consumidores.

**Validación independiente**: Matriz interna positiva y negativa ejecutada sobre ocho handlers, sin falso éxito.

- [X] T005 [US4] Añadir en `scripts/qa/submission-recovery-qa.mjs` prueba positiva 201 objeto ok boolean true, cuerpo completo y propiedades adicionales; no exigir documentId, receipt ni Content-Type nuevo. Verificar ocho consumidores y conservar payload/endpoints. **Dep:** T004. **Traza:** FR-009/011/013; QA13.

- [X] T006 [US4] Añadir en `scripts/qa/submission-recovery-qa.mjs` pruebas separadas 201 ok:false, ok ausente/string/number, null/array/string/number/bool, JSON malformado, HTML y body vacío. Cada una debe rechazar y producir error público sin éxito. **Dep:** T005. **Traza:** FR-009/010; QA14–16.

- [X] T007 [US4] Añadir en `scripts/qa/submission-recovery-qa.mjs` casos 204, 200, 202 incluso con ok:true y representantes 4xx/5xx; verificar rechazo interno y 503 submission:unavailable en los ocho handlers reales. **Dep:** T006. **Traza:** FR-010/013; QA17–21.

- [X] T008 [US4] Endurecer exclusivamente createInternalStrapiSubmission en `netlify/functions/_shared/strapi-submission.mjs`: status===201, JSON objeto no null/no array y ok===true; cualquier desviación lanza error sanitizado. Mantener helper histórico, multipart, secretos y scopes. Ejecutar matriz de T005–T007 hasta verde. **Dep:** T007. **Traza:** FR-009–011/013/014; QA13–21.

- [X] T009 [US4] Añadir en `scripts/qa/submission-recovery-qa.mjs` pruebas de deadline antes de headers, body pendiente, parseo que finaliza tarde y doble que ignora abort; probar network error y body interrumpido. Exigir rechazo, ausencia de éxito tardío y limpieza de timers sin esperas de 15 s reales. **Dep:** T008. **Traza:** FR-010/012; QA22–24.

- [X] T010 [US4] Aplicar en `netlify/functions/_shared/strapi-submission.mjs` un único plazo de 15.000 ms para fetch + lectura + parseo + validación: carrera acotada, AbortController compartido, comprobación monotónica tras parseo y finally exterior. Cancelación no bloqueante cuando sea posible; no renovar timer en headers. Ejecutar T009 y comprobar que todo camino cierra. **Dep:** T009. **Traza:** FR-012; QA22–24.

- [X] T011 [US4] Cambiar únicamente los dos dobles de éxito 204 de `scripts/qa/commerce-submission-qa.mjs` por 201 con objeto ok:true. Revisar diff de esas dos expectativas; 204 permanece como caso negativo en el harness nuevo, sin refactor del QA comercial. **Dep:** T010. **Traza:** FR-009/015; QA17/25.

- [X] T012 [US4] Ejecutar modos --unit y --functions de `scripts/qa/submission-recovery-qa.mjs` con Node --experimental-vm-modules: repetir todos los casos internos sobre ocho consumidores; contrastar inventario esperado, cero falsos éxitos y contrato público 503 tras fallo interno. No marcar historia completa con casos omitidos. **Dep:** T011. **Traza:** FR-009–015, SC-004; QA13–24.


## Phase 4: US1 — Recuperar sin repetir formulario (P1, F01)

**Objetivo**: Conectar transporte y controlador sin editar cinco flows.

**Validación independiente**: Rechazo inválido/post-consumo → reset único → nueva verificación → envío explícito exitoso, con snapshots intactos.

- [X] T013 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` casos DOM con controlador/helper reales para token ausente/inválido y 503 submission:unavailable; comprobar reset completo, un evento, botones bloqueados e init repetida sin listeners duplicados. **Dep:** T012. **Traza:** FR-003/004; QA02/03/06.

- [X] T014 [US1] Crear en `src/lib/emailVerificationController.ts` WeakMap por formulario y puente exportado: «reinicializar devuelve misma instancia», «No serializar registro ni estados en sessionStorage». Registrar tras validar controles y devolver API existente en segunda inicialización. Verificar la parte de inicialización idempotente de T013 sin crear ciclo de imports; el reset integrado de T013 se valida al completar T017. **Dep:** T013. **Traza:** FR-004/014; QA06.

- [X] T015 [US1] Clasificar en `src/lib/netlifySubmission.ts` 400 + ok:false + verification:required/invalid como verification-invalid, con JSON objeto y razón exacta. Construir error tipado compatible con catches actuales; probar combinaciones status/reason incompatibles como desconocidas. **Dep:** T014. **Traza:** FR-003; QA02.

- [X] T016 [US1] Clasificar en `src/lib/netlifySubmission.ts` 503 + ok:false + submission:unavailable como post-consumption-failure, con persistencia unknown: consumo conocido no prueba ausencia de guardado. Probar con excepción del transporte interno real simulado. **Dep:** T015. **Traza:** FR-004/005; QA03/04.

- [X] T017 [US1] Conectar `src/lib/netlifySubmission.ts` al puente de `src/lib/emailVerificationController.ts` una sola vez por fallo; en el controlador ejecutar reset() para invalid/post/ambiguous y no para safe. Usar evento existente; si falta controlador impedir fetch con error local. Validar token/challenge/código/flag/timer y orden del catch real, sin limpiar solo hidden. **Dep:** T016. **Traza:** FR-003/004/007; QA02–06/09.

- [X] T018 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` snapshots antes/después de recovery para email, textos, selects/radios y resto de contenido; afirmar que `src/lib/emailVerificationController.ts` no invoca form.reset ni emite input/change y corregir solo el controlador si falla. **Dep:** T017. **Traza:** FR-006, SC-002; QA07.

- [X] T019 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` comprobaciones independientes de Files seleccionados en página viva; preservar identidad/contenido y no prometer persistencia tras recarga. Confirmar después con navegador nativo en fase final. **Dep:** T018. **Traza:** FR-006, SC-002; QA07.

- [X] T020 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` comprobación explícita de consentimiento marcado/desmarcado y selecciones tras cada recovery; no modificarlos para forzar el evento de estado. **Dep:** T019. **Traza:** FR-006, SC-002; QA07.

- [X] T021 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` snapshots de sessionStorage de los cuatro scopes con draft: error no borra; éxito confirmado aplica limpieza actual; Foto no crea draft. No editar módulos de persistencia. **Dep:** T020. **Traza:** FR-006/016/017; QA12.

- [X] T022 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` ciclo de nueva solicitud/código sin recarga ni edición de email, GETDEL que rechaza segundo uso del token viejo y segundo intento explícito con token nuevo. Incluir fallos sucesivos y doble click; verificar no reutilización silenciosa. **Dep:** T021. **Traza:** FR-004/007/014, SC-001/006; QA08/09/11.

- [X] T023 [US1] Añadir en `scripts/qa/submission-recovery-qa.mjs` contadores que demuestren que reset, espera y verificación posterior no disparan submissions; solo nueva acción explícita incrementa el conteo. No añadir retry ni submit/requestSubmit a `src/lib/emailVerificationController.ts`. **Dep:** T022. **Traza:** FR-007, SC-005; QA10.

- [X] T024 [US1] Separar aceptación de navegación en `src/lib/netlifySubmission.ts`: éxito público solo 201 objeto ok:true, navigation=caller de Millorem intacto, error de navegación posterior no se reclasifica como fallo de envío. Validar destinos y orden actual de limpieza en `scripts/qa/submission-recovery-qa.mjs`. **Dep:** T023. **Traza:** FR-016; QA11/12.


## Phase 5: US2 — Corregir sin reverificación innecesaria (P1, F01)

**Objetivo**: Conservar autorización únicamente ante evidencia previa al consumo.

**Validación independiente**: Corregir y enviar con mismo token vigente; caducidad y cambio de email siguen invalidándolo.

- [X] T025 [US2] Añadir en `scripts/qa/submission-recovery-qa.mjs` matriz finita scope/status/reason del contrato: ejercer parsers reales para razones alcanzables y cero consumos por rechazo seguro; las combinaciones finitas inalcanzables se prueban solo como clasificación sintética, sin inventar un recorrido de parser; añadir negativos con razón, campo o status desconocidos y fallos locales antes de fetch. **Dep:** T024. **Traza:** FR-002/014, SC-003; QA01.

- [X] T026 [US2] Implementar en `src/lib/netlifySubmission.ts` tabla cerrada de rechazos seguros de contracts/submission-reliability.md; exigir objeto ok:false y tupla exacta. Separar preparación local de requestStarted; preservar autorización solo antes de invocar fetch o en tupla probada. No regex de prefijos ni status aislado. **Dep:** T025. **Traza:** FR-002; QA01.

- [X] T027 [US2] Comprobar en `scripts/qa/submission-recovery-qa.mjs` que `src/lib/emailVerificationController.ts` no resetea ni prolonga TTL ante safe; corregir dato y enviar con mismo token aún válido. Cubrir caducidad durante error y cambio de email, validación local sin fetch y ausencia de controlador sin consumo. **Dep:** T026. **Traza:** FR-002/014, SC-003; QA01/06.


## Phase 6: US3 — Entender incertidumbre (P1, F01)

**Objetivo**: Clasificar lo desconocido y comunicar sin contradicciones en tres idiomas.

**Validación independiente**: Pérdida de respuesta antes/después de persistencia simulada: misma incertidumbre, datos conservados y cero retry.

- [X] T028 [US3] Añadir en `scripts/qa/submission-recovery-qa.mjs` escenarios de red, timeout, lectura interrumpida, JSON público inválido, 503 verification:unavailable y tuplas desconocidas, incluyendo 429; simular aceptación guardada seguida de pérdida de respuesta y pérdida anterior al guardado. **Dep:** T027. **Traza:** FR-005, SC-005; QA05/22–24.

- [X] T029 [US3] Implementar fallback ambiguous en `src/lib/netlifySubmission.ts` desde invocación de fetch; exigir reset mediante puente único, persistence unknown y ningún éxito ante respuesta pública inválida. Verificar T028; no inferir consumo ausente desde un status. **Dep:** T028. **Traza:** FR-005/007; QA05/10.

- [X] T030 [US3] Añadir en `src/components/EmailVerificationBlock.astro` copy común CA/ES/EN para safe, autorización inválida y post/ambiguous conforme al contrato: envío no confirmado, pudo llegar, verificar de nuevo, decidir explícitamente, no reenvío automático. No sistema global nuevo de traducciones; no alterar copy Comercio/denuncias. **Dep:** T029. **Traza:** FR-001/008; QA28–30.

- [X] T031 [US3] Declarar en `src/components/EmailVerificationBlock.astro` data-submission-feedback-target para agenda-submit-error, comunicat-submit-error, veu-submit-error, millora-submit-error y foto-mes-submit-error por scope. Validar cinco destinos dentro de sus formularios; fuera de F01 no añadir política. **Dep:** T030. **Traza:** FR-001/008/015; QA25–30.

- [X] T032 [US3] Actualizar feedback desde `src/lib/emailVerificationController.ts` antes de rethrow: reemplazar textContent del párrafo existente, role=alert si falta; dejar visibilidad/scroll al catch actual. Si destino falta, mostrar aviso común y fallar QA. Probar que no persiste mensaje antiguo contradictorio ni se usa innerHTML. **Dep:** T031. **Traza:** FR-005/008; QA03/05/28–30.

- [X] T033 [US3] Añadir en `scripts/qa/submission-recovery-qa.mjs` pruebas de texto final tras catches reales para las cuatro clases, incluidas secuencias de errores distintos y destino ausente; exigir equivalencia CA/ES/EN y prohibir afirmar que no se guardó en post/ambiguous. **Dep:** T032. **Traza:** FR-001/005/008, SC-005; QA05/28–30.


## Phase 7: Validación transversal y cierre

**Objetivo**: Completar navegador, regresiones, controles de alcance y CONVERGE.

**Validación independiente**: Todos los gates siguientes son obligatorios; no confundir tests definidos con tests pasados.

- [X] T034 Implementar --build en `scripts/qa/submission-recovery-qa.mjs`: copia permitida con marker/manifest propio 012, dependencias existentes y fixtures de ocho colecciones, quince rutas F01 y superficies de regresión. Excluir .env/.tmp/.git/backend, no consultar CMS real ni modificar dist/.astro originales. Validar aislamiento antes de build. **Dep:** T033. **Traza:** FR-013–017; QA11/25–30.

- [X] T035 Implementar --browser en `scripts/qa/submission-recovery-qa.mjs` usando Chrome CDP/preview loopback y bloqueo de red externa; recorrer controles nativos y verificación simulada con estado por intento. Interceptar medios externos, no falsificar verificación mediante hidden; asegurar ejecución de flows reales. **Dep:** T034. **Traza:** FR-001/006/014; QA06–12/25–30.

- [X] T036 Implementar y ejecutar --cleanup-probes en `scripts/qa/submission-recovery-qa.mjs` para assertion fallida, fallo build/preview, excepción y señales. Comprobar cierre de PIDs/puertos propios, root marcado y ningún borrado ajeno; conservar error principal y denunciar cleanup fallido. **Dep:** T035. **Traza:** FR-017, Constitution IV; guardas QA.

- [X] T037 Añadir y ejecutar recorrido de Agenda (agenda) en `scripts/qa/submission-recovery-qa.mjs`: cuatro clases de error, datos/archivo/consentimiento/draft aplicable conservados, corrección segura, nueva verificación y envío explícito exitoso. Ejecutar en CA/ES/EN, contar requests y verificar destino y texto final; sin editar su flow. **Dep:** T036. **Traza:** FR-001–008/016, SC-001/002/003/005/006; QA01–12/28–30.

- [X] T038 Añadir y ejecutar recorrido de Comunicats (comunicat) en `scripts/qa/submission-recovery-qa.mjs`: cuatro clases de error, datos/archivo/consentimiento/draft aplicable conservados, corrección segura, nueva verificación y envío explícito exitoso. Ejecutar en CA/ES/EN, contar requests y verificar destino y texto final; sin editar su flow. **Dep:** T037. **Traza:** FR-001–008/016, SC-001/002/003/005/006; QA01–12/28–30.

- [X] T039 Añadir y ejecutar recorrido de Veus (veu) en `scripts/qa/submission-recovery-qa.mjs`: cuatro clases de error, datos/archivo/consentimiento/draft aplicable conservados, corrección segura, nueva verificación y envío explícito exitoso. Ejecutar en CA/ES/EN, contar requests y verificar destino y texto final; sin editar su flow. **Dep:** T038. **Traza:** FR-001–008/016, SC-001/002/003/005/006; QA01–12/28–30.

- [X] T040 Añadir y ejecutar recorrido de Millorem (millora) en `scripts/qa/submission-recovery-qa.mjs`: cuatro clases de error, datos/archivo/consentimiento/draft aplicable conservados, corrección segura, nueva verificación y envío explícito exitoso. Ejecutar en CA/ES/EN, contar requests y verificar destino y texto final; sin editar su flow. **Dep:** T039. **Traza:** FR-001–008/016, SC-001/002/003/005/006; QA01–12/28–30.

- [X] T041 Añadir y ejecutar recorrido de Foto del Mes (foto-mes) en `scripts/qa/submission-recovery-qa.mjs`: cuatro clases de error, datos/archivo/consentimiento/draft aplicable conservados, corrección segura, nueva verificación y envío explícito exitoso. Ejecutar en CA/ES/EN, contar requests y verificar destino y texto final; sin editar su flow. **Dep:** T040. **Traza:** FR-001–008/016, SC-001/002/003/005/006; QA01–12/28–30.

- [X] T042 Ejecutar `scripts/qa/commerce-submission-qa.mjs` y regresión Comercio CA/ES/EN en `scripts/qa/submission-recovery-qa.mjs`: política requiresReverification, datos, mensajes, reset único, payload y endpoint intactos. Solo las dos modificaciones de T011 permitidas. **Dep:** T041. **Traza:** FR-015, SC-007; QA25.

- [X] T043 Ejecutar regresión denuncia comunicat CA/ES/EN en `scripts/qa/submission-recovery-qa.mjs`: reset propio, email/motivo/contexto y mensajes actuales conservados, payload/endpoint intactos; no puente F01 ni doble reset. **Dep:** T042. **Traza:** FR-015, SC-007; QA26.

- [X] T044 Ejecutar `scripts/qa/multisection-reporting-qa.mjs` por separado con --group scope, schema, backend, function, client, integration y language (nunca sin argumentos ni --group feature003, que lee SQLite), sin editarlo y regresión navegador CA/ES/EN en `scripts/qa/submission-recovery-qa.mjs`: email limpiado según política actual, motivo/contexto conservados y ningún doble reset. Si exige cambio, BLOCKER antes de ampliar allowlist. **Dep:** T043. **Traza:** FR-015, SC-007; QA27.

- [X] T045 Validar matriz completa CA en `scripts/qa/submission-recovery-qa.mjs`: cinco formularios y tres superficies de regresión; comprobar significado del feedback, destinos, estados y recuperación tras catch. Exigir evidencia funcional por superficie; no basta existencia de rutas. **Dep:** T044. **Traza:** FR-001/008/015/016, SC-006/007; QA28.

- [X] T046 Validar matriz completa ES en `scripts/qa/submission-recovery-qa.mjs`: cinco formularios y tres superficies de regresión; comprobar significado del feedback, destinos, estados y recuperación tras catch. Exigir evidencia funcional por superficie; no basta existencia de rutas. **Dep:** T045. **Traza:** FR-001/008/015/016, SC-006/007; QA29.

- [X] T047 Validar matriz completa EN en `scripts/qa/submission-recovery-qa.mjs`: cinco formularios y tres superficies de regresión; comprobar significado del feedback, destinos, estados y recuperación tras catch. Exigir evidencia funcional por superficie; no basta existencia de rutas. **Dep:** T046. **Traza:** FR-001/008/015/016, SC-006/007; QA30.

- [X] T048 Ejecutar `scripts/qa/veu-draft-persistence-qa.mjs --dom` y `scripts/qa/millora-draft-persistence-qa.mjs --dom` conforme a quickstart, revisando guards antes de arrancar. No ejecutar el --transport antiguo: asume HTTP 200 y formulario sin controlador. Reproducir y ejecutar sus seis casos en `scripts/qa/submission-recovery-qa.mjs`: omitted-automatic, explicit-automatic, caller, http-failure, json-failure e invalid-json, con controlador real registrado y 201 para éxitos; mantener espera mínima, conteos de navegación y overlay oculto en error. Validar errores tipados sin depender del texto histórico. Comprobar error conserva/éxito limpia y no modificar estos QA. **Dep:** T047. **Traza:** FR-006/016; QA12.

- [X] T049 Ejecutar suite completa `scripts/qa/submission-recovery-qa.mjs` según comandos de quickstart.md: --unit, --functions, --dom, --build, --browser y --cleanup-probes. Comparar inventario real con matriz QA01–30, ocho consumidores internos y quince combinaciones F01; reportar cualquier skip o fallo sin PASS global. **Dep:** T048. **Traza:** FR-001–016, SC-001–007; QA01–30.

- [X] T050 Validar compilación TS/Astro aplicable mediante build aislado de `scripts/qa/submission-recovery-qa.mjs --build` y carga de módulos TS reales. Inspeccionar `package.json` y `tsconfig.json` read-only: no hay script lint/check ni tsc/@astrojs/check en las rutas inspeccionadas; si siguen ausentes, registrar no disponible sin instalar ni afirmar typecheck completo. Si existe un check local compatible, ejecutarlo en copia aislada sin red ni cambios config. **Dep:** T049. **Traza:** Constitution V y quality gates; compilación/checks existentes.

- [X] T051 Revisar diff completo contra la allowlist de `specs/012-verified-submission-reliability/plan.md`: GETDEL, scopes, expiración, límites, autenticación, privacidad, imágenes, endpoints y ausencia de retry intactos. Comprobar por Git backend sin cambios y auditar comandos/guardas para confirmar que no hubo servicios reales ni acceso SQLite; no abrir SQLite para demostrarlo. **Dep:** T050. **Traza:** FR-014/015/017, Constitution III–VII; gate seguridad/alcance.

- [X] T052 Ejecutar CONVERGE conforme a `.agents/skills/speckit-converge/SKILL.md` sobre spec/plan/este `tasks.md`, únicamente en fase posterior autorizada. Asociar evidencias a requisitos y QA; cualquier gap queda como tarea pendiente, nunca éxito implícito. Si exige fuera de allowlist registrar BLOCKER y detener ampliación. **Dep:** T051. **Traza:** FR-001–017, SC-001–007; gate CONVERGE.

- [X] T053 Cerrar `specs/012-verified-submission-reliability/tasks.md` solo con todos los gates satisfechos: FR F01/F03, QA01–30, cero falso éxito/reutilización silenciosa/auto-retry, datos conservados, tres idiomas y regresiones correctas. Registrar git diff --stat y git status de ambos repositorios, backend intacto, no SQLite ni expansión, y limitaciones de checks. Si CONVERGE añadió pendientes, resolver y revalidar lo afectado antes de este cierre. Sin commit/push. **Dep:** T052. **Traza:** FR-001–017, SC-001–007; cierre obligatorio.


## Dependencies & Execution Order

Cadena explícita conservadora: cada tarea depende del ID anterior, indicado en su línea. Setup T001–T002 → Foundation T003–T004 → US4 T005–T012 → US1 T013–T024 → US2 T025–T027 → US3 T028–T033 → validación transversal T034–T053. No iniciar IMPLEMENT en esta fase; ANALYZE es el siguiente paso autorizado por separado.

Las historias comparten transporte/controlador y harness, por lo que no se marcan tareas [P]. US4 se prueba independientemente a nivel interno; US1 prueba recuperación inválida/post-consumo; US2 prueba preservación segura; US3 prueba incertidumbre. Los recorridos nativos completos dependen del build/browser de fase 7 y son necesarios para cerrar la feature.

### Ejemplos de paralelismo por historia

- US4: no paralelizar T005–T007/T009 porque escriben el mismo harness; tampoco ejecutar la matriz mientras T008/T010 cambian el transporte.
- US1: no paralelizar registro y puente ni las pruebas sobre un harness en edición; completar T013–T024 en secuencia.
- US2: separar pruebas de tabla, implementación y validación final; ninguna pareja independiente de escritura.
- US3: aunque copy y transporte están en archivos distintos, validar juntos exige contrato y wiring estabilizados; mantener secuencia T028–T033.

No hay delegación ni ejecución paralela requerida. Esta decisión evita conflictos en el único harness y refleja el alcance mínimo del PLAN.

## Trazabilidad F01/F03 y QA

| Bloque | Tareas | Cobertura |
|---|---|---|
| F03 / US4 | T005–T012 | FR-009–013; QA13–24; SC-004 |
| F01 / US1 | T013–T024 | FR-003/004/006/007/014/016; QA02–04/06–12 |
| F01 / US2 | T025–T027 | FR-002; QA01; SC-003 |
| F01 / US3 | T028–T033 | FR-005/008; QA05/10/22–24/28–30 |
| Cinco F01 nativos | T037–T041 | FR-001–008/016; QA01–12 en quince combinaciones |
| Regresiones | T042–T044 | FR-015; QA25–27; SC-007 |
| Idiomas | T045–T047 | FR-001/008; QA28–30 |
| Drafts | T021/T048 | FR-006/016; QA12 |
| Suite/compilación/seguridad/cierre | T049–T053 | FR-014/017 y gates constitucionales |

| QA | Tareas responsables |
|---|---|
| QA01 | T025–T027, T037–T041 |
| QA02 | T013/T015/T017, T037–T041 |
| QA03 | T013/T016/T017, T037–T041 |
| QA04 | T012/T016, T037–T041 |
| QA05 | T028–T033, T037–T041 |
| QA06 | T013/T014/T017/T027 |
| QA07 | T018–T020, T037–T041 |
| QA08 | T022, T037–T041 |
| QA09 | T004/T022, T037–T041 |
| QA10 | T023/T029, T037–T041 |
| QA11 | T022/T024, T037–T041 |
| QA12 | T021/T024/T048, T037–T041 |
| QA13 | T005/T008/T012 |
| QA14 | T006/T008/T012 |
| QA15 | T006/T008/T012 |
| QA16 | T006/T008/T012 |
| QA17 | T007/T008/T011/T012 |
| QA18 | T007/T008/T012 |
| QA19 | T007/T008/T012 |
| QA20 | T007/T008/T012 |
| QA21 | T007/T008/T012 |
| QA22 | T009/T010/T012/T028 |
| QA23 | T009/T010/T012/T028 |
| QA24 | T009/T010/T012/T028 |
| QA25 | T042 |
| QA26 | T043 |
| QA27 | T044 |
| QA28 | T030–T033/T045 |
| QA29 | T030–T033/T046 |
| QA30 | T030–T033/T047 |

SC-001/002/006 → T018–T022 y T037–T041; SC-003 → T025–T027; SC-004 → T005–T012; SC-005 → T023/T028–T033; SC-007 → T042–T047. T049 exige inventario íntegro; T053 exige todos los criterios, no solo existencia de pruebas.

## Implementation Strategy

Incremento técnico inicial: contrato F03 con sus pruebas. MVP funcional de recuperación: US1 junto con US2 y US3, pues no se considera entregable una recuperación que invalide autorizaciones seguras o explique mal la incertidumbre. No desplegar parcialmente ni declarar feature completa por pasar un subconjunto. Completar regresiones y CONVERGE antes de cierre.

Las tareas no autorizan nuevas dependencias ni cambios fuera de allowlist para hacer pasar QA. Build transpila/compila lo aplicable pero no equivale a un typecheck exhaustivo: declarar la cobertura real. Guardar evidencias en el seguimiento SDD existente, sin generar otro harness ni informes con datos privados.


## Correcciones de ANALYZE — 2026-10-16

- A01 (HIGH, resuelto en SDD): el comando multisección sin argumentos ejecuta feature003, que lee `.tmp/data.db` en la línea 1407 del QA existente. Ejecutar únicamente los siete grupos explícitos scope/schema/backend/function/client/integration/language. No ejecutar feature003 ni afirmar que pasó la suite completa histórica. Su regresión funcional de denuncia comunicat queda cubierta por T043 y los ocho handlers del harness nuevo; no se sustituye ni se ejecuta la comprobación histórica del hash SQLite.
- A02 (HIGH, resuelto en SDD): el modo --transport de QA Millorem usa HTTP 200 como éxito y un objeto sin controlador. No ejecutarlo como gate compatible ni modificarlo: trasladar sus seis casos funcionales al harness 012, con 201 y controlador registrado. Mantener --dom de ambos QA de drafts. Esto conserva cobertura y la allowlist; no convierte fallos esperados en PASS ni rebaja el contrato.
- A03 (MEDIUM, resuelto en SDD): los tests positivos/de preservación no tienen que fallar en baseline; T014 valida solo inicialización de T013, y T017 valida el reset conectado. Las razones de tabla que son inalcanzables en parsers se comprueban sintéticamente, distinguiendo esa evidencia de integración real.

Estas correcciones no ejecutan QA, no cambian producción ni requieren archivos nuevos fuera de la allowlist. El diseño de navegación mantiene destinos y caller actuales; solo evita reclasificar aceptación confirmada dentro del helper, sin rediseñar los catches de los flows. El build aislado es validación local, no un nuevo mecanismo de rebuild/publicación.

## Evidencia IMPLEMENT

T001 PASS: preflight 2026-10-16; ambos main y HEAD/origin/main iguales a baseline; 0/0; backend limpio; frontend solo ocho SDD 012 untracked. Checklist 16/16. Sin acceso SQLite/.env. Sin extensions.yml. Ignore existente inspeccionado, sin cambios fuera de allowlist.

T002 PASS: harness exige modo explícito, rechaza modos pendientes y bloquea fetch externo; no lee entorno host. T003 PASS: tipo común sin campos privados, carga TS validada en VM.

T004 PASS: ocho handlers reales cargados en VM; Redis sustituido en frontera SDK, GETDEL en memoria; reloj y DOM mínimo disponibles. Fronteras externas sin red.

T005–T008 PASS: 23 casos unitarios y 184 sobre ocho handlers, acuse estricto y 503 público. Baseline reprodujo falso éxito; fixtures corregidas antes de considerar validación verde.

T009–T012 PASS: deadline inicialmente rojo por fetch que ignora abort; ahora cinco casos de deadline/red/body unitarios y en ocho handlers, timer sin pendientes. Matriz 184 contratos PASS. QA comercial diff limitado a dos acuses 204→201 JSON.

T013–T017 PASS: baseline rojo por instancia nueva; 15 casos DOM con módulos reales pasan, reset único y estado/timer/código/token limpios. Sin edición de flows ni ciclos.

T018–T024 PASS DOM: ningún evento de edición/reset, contenido y File conservados, draft real sessionStorage conservado en error y limpieza explícita tras éxito; Foto sin draft. Nueva verificación no envía, segundo gesto sí; ocho handlers rechazan segundo GETDEL. Navegación caller no navega. Validación nativa final pendiente en T037–T041.

T025–T032: tabla finita probada (incluye rechazo real por scope sin GETDEL), safe conserva TTL; casos desconocidos/red/JSON exigen reset sin filtrar detalles privados. Copy CA/ES/EN del contrato y targets comunes implementados. T033 pendiente de comprobar catches reales en navegador; no se declara evidencia nativa aún.

Reanudación IMPLEMENT: HEAD y allowlist coherentes, backend limpio. Sesión/log temporal/build anteriores no disponibles; se recrea únicamente build aislado. Evidencia de conversación previa: Agenda y Comunicats, CA/ES/EN, cuatro clases, PASS (24 recorridos); continuación desde Veus. T033 sigue pendiente hasta completar los cinco scopes.

T033–T041 PASS: 60 recorridos F01 (24 previos Agenda/Comunicats documentados en conversación + 36 en browser-evidence.log) con cuatro clases × tres idiomas, catches reales, FileList, consentimiento, sessionStorage, reset y éxito posterior. Build-evidence.log: 55 páginas y ocho colecciones fixtures, .astro/dist reales intactos. Cleanup-evidence.log: fallos, SIGINT/SIGTERM, ownership, puertos y recursos liberados; no skips.

T042–T047 PASS: commerce-evidence.log (QA completo); regression-browser-evidence.log (12 recorridos Comercio safe/post + dos denuncias post en CA/ES/EN, endpoints y políticas intactos, reset único, éxito y cleanup); multisection-evidence.log (siete grupos explícitos PASS; feature003 excluido). QA28–30 funcional, no solo rutas.


### BLOCKER B001 — T048 (2026-10-16)

El comando `node scripts/qa/veu-draft-persistence-qa.mjs --dom` pasa QA01–QA42 y falla en QA43 (línea 379). QA43 exige ausencia de `initSubmissionDraft` en milloraSubmissionFlow.ts, pero HEAD ya contiene el import en línea 3 y la inicialización en línea 12. Ambos archivos están sin diff: contradicción histórica de QA, no regresión de Feature 012.

El QA de Millorem `--dom` pasa; los seis casos de transporte migrados al harness 012 pasan. Los recorridos browser 012 conservan y limpian drafts según contrato. No se marca T048 completa ni se omite QA43 silenciosamente.

T049–T053 detenidas por dependencia. CONVERGE no ejecutado. Se solicita autorización para ampliar la allowlist únicamente a QA43 de scripts/qa/veu-draft-persistence-qa.mjs: mantener la exclusión de Foto/Comercio y exigir el draft ya existente de Millorem. No se ha editado ese archivo. No commit/push.

### Ampliación autorizada — 2026-10-16

El usuario autoriza «Sí, corregir solo QA43 y continuar». Se permite editar exclusivamente QA43 de `scripts/qa/veu-draft-persistence-qa.mjs`: exigir el draft existente de Millorem y mantener ausencia en Foto/Comercio. Esta excepción reemplaza la prohibición de editar ese único caso; los demás QA históricos continúan read-only. B001 resuelto: drafts-resolved-evidence.log registra QA01–QA43 PASS.

### Cierre de validación T048–T051

- T048: Veus 43/43 PASS tras corregir únicamente QA43 autorizado; Millorem DOM 16/16 y seis casos migrados del transporte en DOM 012 PASS. El QA histórico de Millorem permanece intacto.
- T049: suite 012 completa PASS. unit-evidence.log: 23 contratos, cinco condiciones de deadline/red/body y 369 tuplas de clasificación, más rechazo de parser real por scope sin GETDEL. functions-evidence.log: 184 contratos, cinco condiciones por cada uno de ocho handlers y rechazo de segundo uso en ocho scopes. dom-evidence.log: recuperación, safe/expiración/cambio email, ambigüedad y seis casos migrados PASS. final-browser-evidence.log: 60 recorridos F01 (cinco scopes × tres idiomas × cuatro clases) y 12 regresiones, sin skips. La revisión añadió aserciones explícitas pendientes de doble pulsación y fallos sucesivos de T022; pasan en navegador en los quince cruces. Sustituye la dependencia de evidencia conversacional para Agenda/Comunicats. QA01–12 cubiertos por clasificación/DOM/browser; QA13–24 por contratos/deadline/handlers; QA25–27 por regresiones; QA28–30 por matriz nativa completa.
- T050: final-build-evidence.log: 55 páginas, ocho colecciones locales, sin modificación de .astro/dist reales. Carga TS real en VM PASS. package.json no tiene lint/check; no hay ejecutable local tsc ni @astrojs/check. No se instaló nada y no se afirma typecheck exhaustivo. El primer intento sandbox bloqueó listen loopback con EPERM; la ejecución autorizada fuera de sandbox pasó, sin servicios reales.
- T051: git diff --check PASS; inventario automático de archivos contra allowlist PASS incluida excepción QA43. Cuatro archivos productivos, dos QA históricos limitados y nuevo harness; artefactos SDD. Backend git status vacío. Flows, ocho handlers, GETDEL, scopes, expiración, límites, auth, imágenes, endpoints y dependencias sin diff; sin retry. Fronteras VM sintéticas, fixtures CMS loopback y CDP bloqueando red externa. No acceso SQLite/.env ni ejecución feature003, ningún comando multisección sin argumentos, ningún servicio real.
- Cleanup: final-cleanup-evidence.log PASS para errores, excepciones y señales. Browser comprueba procesos/puertos y elimina root/perfil propios; inventario final sin roots QA, dist real ausente y .astro real inalterado.

### CONVERGE y cierre — T052/T053

CONVERGE PASS: 17 FR, 7 SC, 16 escenarios de aceptación de cuatro historias, 10 decisiones F01 más contrato/deadline F03 y aislamiento/regresiones del plan, 7 principios constitucionales. Código actual y evidencias satisfacen el alcance. Hallazgos missing/partial/contradicts/unrequested: 0/0/0/0; severidades: cero. No se añadió fase vacía ni se modificó tasks.md durante la evaluación CONVERGE. Posteriormente IMPLEMENT registra T052/T053 completadas. Sin hooks: extensions.yml ausente.

53/53 tareas cerradas. QA01–30 PASS, CA/ES/EN PASS, F01/F03 PASS, drafts/comercio/denuncias PASS, build/browser/cleanup PASS. B001 resuelto con ampliación expresa solo QA43; resto de allowlist respetada. Cero blockers. Sin backend modificado, sin SQLite, sin servicios reales, sin instalaciones ni commit/push. Safe to commit: YES, con limitación declarada de no typecheck exhaustivo disponible.

Git diff --stat (archivos tracked; no incluye harness nuevo ni SDD untracked):

```text
 netlify/functions/_shared/strapi-submission.mjs |  88 +++++-----
 scripts/qa/commerce-submission-qa.mjs           |   4 +-
 scripts/qa/veu-draft-persistence-qa.mjs         |   3 +-
 src/components/EmailVerificationBlock.astro     |  31 ++++
 src/lib/emailVerificationController.ts          |  53 +++++-
 src/lib/netlifySubmission.ts                    | 212 +++++++++++++-----------
 6 files changed, 248 insertions(+), 143 deletions(-)
```

Git status frontend:

```text
 M netlify/functions/_shared/strapi-submission.mjs
 M scripts/qa/commerce-submission-qa.mjs
 M scripts/qa/veu-draft-persistence-qa.mjs
 M src/components/EmailVerificationBlock.astro
 M src/lib/emailVerificationController.ts
 M src/lib/netlifySubmission.ts
?? scripts/qa/submission-recovery-qa.mjs
?? specs/012-verified-submission-reliability/
```

Git status backend: vacío. Los logs de evidencia locales pueden estar ignorados por la regla *.log; sus resultados e inventario quedan recogidos en este tasks.md.
