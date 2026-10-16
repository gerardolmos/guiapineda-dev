# Research — 013

- Decisión: variar solo el argumento de confirmación approve. Razón: el defecto nace en PrivateModerationImagePanel.jsx:329, no en el lifecycle. Alternativas descartadas: cambiar la publicación (prohibido), modal nuevo/helper compartido (innecesario).
- Evidencia: SECTION_BY_MODEL mapea solicitud-millora a millora. approveUnlocked deriva a approveMilloraUnlocked y ensurePublishedMillora crea status published o publica draft. No se ejecuta ninguno en QA.
- Decisión: conservar catalán actual; no traducir panel ni alterar frontend. Razón: superficie administrativa existente, mensaje explícito de efecto.
- Decisión: esbuild.transformSync local para compilar JSX y VM con dobles para hooks/HTTP/confirm. Alternativas: arrancar Strapi/full build o instalar runner (innecesario/riesgo DB). Los módulos esbuild, React y react-dom/server existen; no instalar.
- Baseline limpio: frontend 34bd6509ba3481605ed2dc536e26e807fecea7ae; backend 47ca26a0a54fd1c0193afd659b6ba3657b264793. No hooks extensions.yml. No AGENTS aplicables encontrados. Sin aclaraciones pendientes.
