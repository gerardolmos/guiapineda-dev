# Research — 014

## Inspección y alternativas
- A Home: `src/pages/index.astro` se centra en categorías, alta comercio y foto editorial opcional. Crear otro bloque sería mayor cambio y solo cubriría un origen.
- B Tauler: `src/pages/tauler.astro` enlaza detalles a partir de `items`; con cero contenido no hay tarjetas. Añadir accesos propios sería posible, pero no cubriría todas las páginas sin paso intermedio.
- C Sobre: `src/templates/AboutPage.astro` tiene tres tarjetas de participación (Comunicats, Millorem, Foto). Dos tarjetas nuevas requieren copy explicativo adicional y navegación indirecta desde Home.
- D Header: cuatro destinos principales en escritorio y móvil; añadir dos aumenta protagonismo y densidad innecesariamente.
- D Footer: `src/components/SiteFooter.astro` ya tiene una lista estable de cinco destinos secundarios. `Layout.astro` lo renderiza siempre, con traducciones comunes y sin condición de contenido.
- E Combinación: duplicaría accesos y cambios sin necesidad para F02.

## Decisión
Añadir únicamente dos entradas al footer existente. Reutilizar su render, estilos, foco y patrón de URL. Cuatro archivos productivos: footer y tres diccionarios, dos claves por idioma. Etiquetas iguales a los índices existentes: Agenda Oberta/Agenda Abierta/Open Agenda y Veus de Pineda/Voces de Pineda/Voices of Pineda. No extraer copy de los índices a una abstracción nueva.

## F06
NOT_INCLUDED. El fallback de SiteHeader asigna guide a Agenda/Veus. Es deuda real, pero la inserción de enlaces en footer no requiere tocar activeSection. Se deja pendiente conforme a la instrucción expresa, sin ampliar revisión de rutas.

## QA disponible
Node 24.14.1, node_modules existente y Chrome local; QA anterior usa Chrome/CDP con WebSocket nativo. Se reutiliza ese enfoque sin dependencias ni importar sus pruebas de backend. Builds en copias temporales aisladas, sin .env, con fetch sustituido por respuestas sintéticas cerradas; nunca Strapi real ni SQLite.
No quedan incógnitas técnicas que requieran investigación externa o agentes.
