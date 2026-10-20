# Research — Feature018

2026-10-20. Inspección de fuentes únicamente; no navegador/build/tests ejecutados.

- Evidencia: src/components/SiteHeader.astro:32–45 normaliza barras y prefijos ES/EN; reconoce Tauler, Comunicats, Millorem, Foto/404; resto cae en guide. Líneas48–70: cuatro enlaces, sin Agenda/Veus. Ambos renderizadores (aprox.99–110 y180–191) derivan visual y aria-current del mismo activeSection.
- src/layouts/Layout.astro:28,59–61 transmite Astro.url.pathname; query y hash no entran en clasificación.
- src/pages/{agenda,veus}, src/pages/{es,en}/{agenda,veus}: index.astro, [slug].astro y formulario en cada combinación. Slugs de formulario localizados; nombres de sección agenda/veus estables. Detalles requieren contenido para generarse: QA debe usar solo paths/contenido sintéticos.
- Decisión: null para ambas familias con frontera de segmento. Razón: no existe destino propio en el menú y el enlace Guía apunta al índice de categorías, no a estas secciones. La ausencia de activo expresa el alcance real del menú.
- Alternativas descartadas: añadir enlaces (rediseño no autorizado), marcar Tauler (no representa la página), cambiar globalmente aria-current o todos los fallbacks (fuera de scope), extraer router/helper (innecesario).
- Regresión: preservar la semántica histórica de otras rutas, incluidos sobre/enviado/alta y aliases de Comunicats que caigan en fallback; esta feature no certifica exactitud global de esas decisiones.
- QA propuesto: render aislado del header real usando Astro/dependencias instaladas, páginas sintéticas y navegador local, sin importar páginas/CMS/Functions ni servicios de backend. Aislamiento debe comprobarse antes de ejecutarlo. Sin suite histórica que lee SQLite.
- Baseline Git: frontend main 9585533df4bab4979a58c0aab83da21036f3e5df; backend main c2f405312bb7dcd8dc6bd1abce42d317e0e3e879. Sin tracked diffs; frontend conserva 55 documentos untracked previos (017/prerrequisito). Ningún archivo previo se modifica.
