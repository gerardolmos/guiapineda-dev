# Research — 016

## Preflight
Frontend main HEAD/origin/main 5eab8e1ca7e396f521b766a8693f2d683a9fef81; backend main HEAD/origin/main c2f405312bb7dcd8dc6bd1abce42d317e0e3e879. Ambos limpios, 0/0. Constitution 1.0.0. Sin AGENTS.md encontrado ni extensions.yml/hooks/presets adicionales. No SQLite.

## Decisión y fundamento
CommunicatSubmissionPage oculta selector global y solo renderiza el flow. Agenda/Veus tienen barra de idiomas fuera de pasos. Existe LanguageSwitcher.astro con enlaces href/hreflang/lang, aria-current y focus visible, por lo que se reutiliza localmente desde el template sin tocarlo ni extraer componentes de otros formularios. Label: Idioma / Idioma / Language. Links a las tres páginas comprobadas. Barra fuera de los pasos para que siga disponible en autor/contenido/revisión.
Alternativas descartadas: habilitar selector global (innecesario tocar navegación), duplicar selector de Agenda (componente existente adecuado), añadir handlers de guardado (input/change ya guardan sin debounce).

## Contrato de draft y verificación
comunicatSubmissionFlow inicializa draft antes del controller con siete campos: tipus_remitent, autor, titol, resum, contingut, nombre_contacto, email_contacto. submissionDraft usa sessionStorage, clave por scope sin idioma, version1; solo fields allowlisted y tipos admitidos. Excluye hidden/file/checkbox/password; no token/código/consentimiento/honeypot. Restablece radios válidos. Falla de storage no impide formulario.
Al cargar, controller.resetVerification borra challenge/verifiedEmail/token/código y marca false. reconcileDraftState abre autor, limpia imagen/consentimiento y recalcula validaciones. Reset limpia draft y estado; éxito usa submitVerifiedSubmissionForm estricto y clearDraft. No alterar garantías de 012.

## QA seguro
Reutilizar patrón del harness aislado 015, no importar ni ejecutar QA histórico multisection-reporting (su grupo feature003 lee DB). Auditar código del harness nuevo antes de ejecutar. Copia solo frontend/public/config/package, enlaza node_modules existente, no .env. CMS sintético por preload; browser fetch interceptado para verificación y comunication submission; red externa bloqueada. Sin servicios reales ni backend runtime.
