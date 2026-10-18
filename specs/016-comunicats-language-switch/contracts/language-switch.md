# UI contract

| Idioma | Ruta |
|---|---|
| ca | /envia-un-comunicat |
| es | /es/enviar-comunicado |
| en | /en/comunicats/send-an-announcement |

Nav local accesible con label Idioma/Idioma/Language. Idioma actual aria-current=page; otros idiomas enlaces nativos. Sin query/hash para transportar datos. Disponible antes del formulario independientemente del paso. Se reutiliza contrato de draft y verificación sin cambios: siete campos texto/radio permitidos, cero autorización/archivo/consentimiento persistidos; idioma_solicitud refleja destino. API de verificación y submission no cambia.
