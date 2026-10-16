# Tasks: Millora Publication Confirmation

Input: spec.md, plan.md, research.md, data-model.md, contracts/confirmation.md, quickstart.md. Rutas backend relativas a ../guiapineda-strapi; SDD relativas a frontend. Closed allowlist en plan.md. Sin commit/push.

## Phase 1: Setup
- [X] T001 Verificar baseline limpio de ambos repositorios, checklist y alcance; registrar evidencia en `specs/013-millora-publication-confirmation/tasks.md`. FR06/07; QA04.

## Phase 2: Foundation
- [X] T002 Construir QA mínimo en `../guiapineda-strapi/scripts/qa/millora-publication-confirmation-qa.mjs`, transformación JSX en memoria, dobles cerrados, comparación baseline y botón real; ejecutar --baseline y reproducir fallo del contrato nuevo sin editar producto. FR01–05; QA01–03/05.

## Phase 3: US1 — Aprobación informada (P1)
Objetivo y test independiente: confirmación correcta de Millorem, cancelación sin acción y aceptación sin comportamiento nuevo.
- [X] T003 [US1] Añadir únicamente variante millora del mensaje approve en `../guiapineda-strapi/src/admin/components/PrivateModerationImagePanel.jsx` según contracts/confirmation.md, manteniendo todas las demás ramas. FR01–05; SC01–03; QA01/02.
- [X] T004 [US1] Ejecutar `../guiapineda-strapi/scripts/qa/millora-publication-confirmation-qa.mjs`: Millorem, cinco secciones restantes, approve/reject aceptar/cancelar, start-review, busy y error; verificar endpoint/action/body/estado equivalentes y JSX válido. FR01–05; SC01–03; QA01–03/05.

## Phase 4: Cierre
- [X] T005 Revisar diff completo, invariantes de lifecycle/servicio/publicación/frontend y ausencia de residuos; registrar limitación de check JSX sin full build en `specs/013-millora-publication-confirmation/tasks.md`. FR05–07; SC04; QA04/05.
- [X] T006 Ejecutar CONVERGE según skill sobre `specs/013-millora-publication-confirmation/{spec,plan,tasks}.md` y código actual; cero gaps o registrar tareas. FR01–07; SC01–04.
- [X] T007 Cerrar evidencias y Git status de ambos repositorios en `specs/013-millora-publication-confirmation/tasks.md`, sin commit/push. FR06/07; SC04.

## Dependencies & Execution Order
T001 → T002 → T003 → T004 → T005 → T006 → T007. Una historia, 2 tareas US1; 5 de preparación/QA/cierre. No paralelismo útil: se comparte el único componente y su oráculo. No agentes necesarios.

## Implementation Strategy
Un incremento mínimo: rojo reproducido, variante contextual, verde y regresiones. MVP = US1 completa, sin despliegue. Matriz: FR01–03→T002/003/004; FR04/05→T002/003/004/005; FR06/07→T001/005/007; SC01–03→T004; SC04→T005/007. CONVERGE cubre todos.

## Evidencia

Preflight 2026-10-17: ambos main, limpios, 0/0; frontend 34bd6509ba3481605ed2dc536e26e807fecea7ae, backend 47ca26a0a54fd1c0193afd659b6ba3657b264793. Checklist 16/16 PASS. Sin hooks extensions.yml. Selector feature.json ignorado actualizado por SPECIFY; scripts muestran nombre lógico feature pero no cambian rama main.

ANALYZE (read-only antes de IMPLEMENT): 7 FR y 4 SC cubiertos, 7 tareas, cobertura 100%, ambigüedades/duplicaciones/CRITICAL/HIGH: 0. Constitution I–VII sin conflicto. No archivos productivos modificados al evaluar. Evidencia registrada posteriormente durante IMPLEMENT.

T002 PASS: --baseline ejecutado antes de edición, mismo archivo que HEAD backend; confirma negación falsa y que contrato nuevo falla. Cancelación sin post.
T003 PASS: solo variante millora del argumento confirm approve, 5 líneas añadidas/1 sustituida.
T004 PASS: 42 escenarios diferenciales, seis secciones × siete escenarios (approve aceptar/cancelar, reject aceptar/cancelar, start-review, busy, error). Contrato Millorem correcto; mensajes restantes idénticos; endpoint/action/body/estados/busy/errores equivalentes al baseline. Transformación JSX completa en memoria PASS.
T005 PASS: Git diff --check, allowlist e invariancia de bytes fuera del argumento confirm. Lifecycle, millora-publication y package/lock iguales a HEAD; frontend público sin diff. QA no carga app/config/.env/DB, no importa servicios, no abre red/puertos y no genera outputs ni temporales. Solo UI administrativa y QA nuevo en backend; solo SDD en frontend. Limitación: no full Strapi build ni navegador/admin real; check JSX y handler real con hooks/HTTP/confirm simulados, proporcional al cambio de copy. No publicación real.

T006 CONVERGE PASS: 7 FR, 4 SC, 5 escenarios de aceptación, 8 decisiones de diseño, 7 principios constitucionales. Missing/partial/contradicts/unrequested: 0/0/0/0; ninguna severidad pendiente. No modificación de tasks durante evaluación ni fase vacía; esta anotación y cierre posterior pertenecen a IMPLEMENT. No hooks extensions.yml.
T007 PASS: 7/7 tareas. Frontend main HEAD 34bd6509ba3481605ed2dc536e26e807fecea7ae, solo directorio SDD 013 untracked (selector local feature.json ignorado). Backend main HEAD 47ca26a0a54fd1c0193afd659b6ba3657b264793, un JSX modificado y un QA untracked. Ambos staged 0; ahead/behind 0/0 frente a origin/main local. Sin cambios ajenos ni residuos generados. Diff productivo: 1 archivo, 5 inserciones/1 eliminación. Sin DB/SQLite, dependencias, servicios reales, deploy, commit ni push. Safe to commit YES; revisión humana pendiente antes del cierre Git.
