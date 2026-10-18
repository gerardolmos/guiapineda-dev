# Data Model

Sin entidades nuevas. Envelope v1, scope `comunicat`, clave `guiapineda:submission-draft:v1:comunicat`.
Campos string existentes: tipus_remitent, autor, titol, resum, contingut, nombre_contacto, email_contacto. Idioma no forma parte del draft; cada ruta establece idioma_solicitud propio. Archivo, consentimiento, token, código y verified no son campos de borrador.
Transición: editar → input/change guarda allowlist → navegación de idioma → restaurar allowlist → verificación nueva + consentimiento explícito → envío → éxito borra draft. Reset borra draft como antes.
