# Matriz completa de Comercio

Entrada pública significa frontera Function/servicio; referencias no son entrada del visitante. PUBLICABLE no autoriza publicación ni borrado. No se fija retención legal.

| Campo | REQUIRED ON PUBLIC SUBMISSION | REQUIRED WHILE ACTIVE | Clasificación | OPTIONAL AFTER TERMINAL / tratamiento |
|---|---|---|---|---|
| `idioma_solicitud` | sí | sí | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |
| `nombre` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `descripcion_corta` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `descripcion_completa` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `direccion` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `telefono` | opcional | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `whatsapp` | opcional | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `email` | opcional | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `web` | opcional | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `categoria` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `subcategoria` | condicional por catálogo | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `atencion_presencial` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `atencion_domicilio` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `atencion_online` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `recogida_local` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `reparto` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `horario_semanal` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `servicios` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `redes_sociales` | sí | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `informacion_adicional` | opcional | conservar contrato entrada; no ampliar obligatoriedad | PUBLICABLE (propuesto, no publicado) | preservar; política adicional no definida |
| `logo` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE Media heredado; ownership UNKNOWN | no borrar; presencia bloquea cleanup automático hasta resolver ownership |
| `imagen_principal` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE Media heredado; ownership UNKNOWN | no borrar; presencia bloquea cleanup automático hasta resolver ownership |
| `galeria` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE Media heredado; ownership UNKNOWN | no borrar; presencia bloquea cleanup automático hasta resolver ownership |
| `nombre_contacto` | sí | sí | PRIVATE operativo | rechazo:null; aprobación:preservar |
| `email_contacto` | sí | sí | PRIVATE operativo | null en ambos terminales (vigente) |
| `telefono_contacto` | opcional | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE operativo | rechazo:null; aprobación:preservar |
| `aceptacion_privacidad` | sí | sí | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |
| `estado_solicitud` | no; generado/gestionado servidor | sí | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |
| `observaciones_internas` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE / finalidad exacta UNKNOWN | preservar; política adicional no definida |
| `imagen_principal_quarantena_id` | servidor: principal obligatoria | sí | QUARANTINE REFERENCE / PRIVATE | rechazo:null tras cleanup; aprobación:preservar |
| `logo_quarantena_id` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | QUARANTINE REFERENCE / PRIVATE | rechazo:null tras cleanup; aprobación:preservar |
| `galeria_quarantena_ids` | servidor: array, puede [] | sí | QUARANTINE REFERENCE / PRIVATE | rechazo:[] tras cleanup; aprobación:preservar |
| `moderacion_iniciada_en` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |
| `moderacion_iniciada_por_admin_id` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |
| `moderacion_resuelta_en` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |
| `moderacion_resuelta_por_admin_id` | no; generado/gestionado servidor | conservar contrato entrada; no ampliar obligatoriedad | PRIVATE trazabilidad técnica/consentimiento | preservar; política adicional no definida |

Contacto comercial publicable telefono/whatsapp/email/web: al menos uno exigido en entrada; no confundir email con email_contacto. Modalidades: cinco booleanos, al menos uno true. id/documentId/createdAt/updatedAt generados por framework se preservan; no son entrada pública ni PII de evidencia. autoría/consentimiento/notas pueden tener finalidad probatoria pendiente: no limpiar por simetría con contacto operativo.
