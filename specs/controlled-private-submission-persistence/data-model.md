# Exact local schema inventory / Admin preservation matrix

Source-only; no model loading or database access. System timestamps createdAt/updatedAt are framework-managed; all six draftAndPublish:false. All use estado_solicitud with pendent/en_revisio/aprovat/rebutjat. No dynamic zones.


## solicitud-agenda

Scalars: idioma_solicitud: enumeration; titol: string; resum: text; descripcio: text; imatge_quarantena_id: string; organitzador: string; data_inici: date; hora_inici: time; data_final: date; hora_final: time; lloc: string; adreca: string; enllac_oficial: string; nombre_contacto: string; email_contacto: email; aceptacion_privacidad: boolean; estado_solicitud: enumeration; observaciones_internas: text; moderacion_iniciada_en: datetime; moderacion_iniciada_por_admin_id: integer; moderacion_resuelta_en: datetime; moderacion_resuelta_por_admin_id: integer

Components: none

Relations and Media: imatge: media

JSON: none

Current update: Admin Content Manager→document-manager→documents.update→entries.updateEntry→Query Engine; moderation updateSubmission→documents.update. Preserve scalar validation, status policy, null presentation, error mapping, timestamps and reload/retry. Commerce additionally retains its authorized-write guard and repeatable-component ordering; other five retain their section-specific moderation/publication side effects outside this adapter.


## solicitud-comercio

Scalars: idioma_solicitud: enumeration; nombre: string; descripcion_corta: string; descripcion_completa: text; direccion: string; telefono: string; whatsapp: string; email: email; web: string; atencion_presencial: boolean; atencion_domicilio: boolean; atencion_online: boolean; recogida_local: boolean; reparto: boolean; informacion_adicional: text; nombre_contacto: string; email_contacto: email; telefono_contacto: string; aceptacion_privacidad: boolean; estado_solicitud: enumeration; observaciones_internas: text; imagen_principal_quarantena_id: string; logo_quarantena_id: string; moderacion_iniciada_en: datetime; moderacion_iniciada_por_admin_id: integer; moderacion_resuelta_en: datetime; moderacion_resuelta_por_admin_id: integer

Components: horario_semanal: component → guiapineda.horario-dia; servicios: component → guiapineda.servicio; redes_sociales: component → guiapineda.red-social

Relations and Media: categoria: relation → api::categoria-comercio.categoria-comercio; subcategoria: relation → api::subcategoria.subcategoria; logo: media; imagen_principal: media; galeria: media

JSON: galeria_quarantena_ids: json

Current update: Admin Content Manager→document-manager→documents.update→entries.updateEntry→Query Engine; moderation updateSubmission→documents.update. Preserve scalar validation, status policy, null presentation, error mapping, timestamps and reload/retry. Commerce additionally retains its authorized-write guard and repeatable-component ordering; other five retain their section-specific moderation/publication side effects outside this adapter.


## solicitud-comunicat

Scalars: idioma_solicitud: enumeration; tipus_remitent: enumeration; autor: string; titol: string; resum: text; contingut: text; imatge_quarantena_id: string; nombre_contacto: string; email_contacto: email; aceptacion_privacidad: boolean; estado_solicitud: enumeration; observaciones_internas: text; moderacion_iniciada_en: datetime; moderacion_iniciada_por_admin_id: integer; moderacion_resuelta_en: datetime; moderacion_resuelta_por_admin_id: integer

Components: none

Relations and Media: imatge: media

JSON: none

Current update: Admin Content Manager→document-manager→documents.update→entries.updateEntry→Query Engine; moderation updateSubmission→documents.update. Preserve scalar validation, status policy, null presentation, error mapping, timestamps and reload/retry. Commerce additionally retains its authorized-write guard and repeatable-component ordering; other five retain their section-specific moderation/publication side effects outside this adapter.


## solicitud-foto-mes

Scalars: idioma_solicitud: enumeration; autor: string; email_contacto: email; titol: string; lloc: string; imatge_quarantena_id: string; aceptacion_privacidad: boolean; aceptacion_autoria_publicacion: boolean; estado_solicitud: enumeration; observaciones_internas: text; moderacion_iniciada_en: datetime; moderacion_iniciada_por_admin_id: integer; moderacion_resuelta_en: datetime; moderacion_resuelta_por_admin_id: integer

Components: none

Relations and Media: imatge: media

JSON: none

Current update: Admin Content Manager→document-manager→documents.update→entries.updateEntry→Query Engine; moderation updateSubmission→documents.update. Preserve scalar validation, status policy, null presentation, error mapping, timestamps and reload/retry. Commerce additionally retains its authorized-write guard and repeatable-component ordering; other five retain their section-specific moderation/publication side effects outside this adapter.


## solicitud-millora

Scalars: idioma_solicitud: enumeration; categoria: enumeration; zona: enumeration; autor_public: string; titol: string; resum: text; contingut: text; imatge_quarantena_id: string; email_contacto: email; aceptacion_privacidad: boolean; estado_solicitud: enumeration; observaciones_internas: text; moderacion_iniciada_en: datetime; moderacion_iniciada_por_admin_id: integer; moderacion_resuelta_en: datetime; moderacion_resuelta_por_admin_id: integer

Components: none

Relations and Media: imatge: media

JSON: none

Current update: Admin Content Manager→document-manager→documents.update→entries.updateEntry→Query Engine; moderation updateSubmission→documents.update. Preserve scalar validation, status policy, null presentation, error mapping, timestamps and reload/retry. Commerce additionally retains its authorized-write guard and repeatable-component ordering; other five retain their section-specific moderation/publication side effects outside this adapter.


## solicitud-veu

Scalars: idioma_solicitud: enumeration; titol: string; resum: text; contingut: text; imatge_quarantena_id: string; tipo_autoria: enumeration; autor_public: string; nombre_contacto: string; email_contacto: email; aceptacion_privacidad: boolean; estado_solicitud: enumeration; observaciones_internas: text; moderacion_iniciada_en: datetime; moderacion_iniciada_por_admin_id: integer; moderacion_resuelta_en: datetime; moderacion_resuelta_por_admin_id: integer

Components: none

Relations and Media: imatge: media

JSON: none

Current update: Admin Content Manager→document-manager→documents.update→entries.updateEntry→Query Engine; moderation updateSubmission→documents.update. Preserve scalar validation, status policy, null presentation, error mapping, timestamps and reload/retry. Commerce additionally retains its authorized-write guard and repeatable-component ordering; other five retain their section-specific moderation/publication side effects outside this adapter.

## Final additional models (2026-10-19)
Six private schemas: revision integer required/default1 min1 max2147483647 private/noneditable. Public create assigns1 server-side; existing nulls backfill1 only under maintenance authorization. No other private schema changed.
Internal millorem-publication-operation: draftAndPublish:false, no localization/public routes; fields source_key string required immutable DB-unique; revision integer1..2147483647 default1; state enum PREPARED/STORAGE_READY/MEDIA_READY/LINKED/PUBLISHED; target_document_id string required; image_manifest JSON nullable; media_id integer nullable; last_error_class string nullable; plus automatic createdAt/updatedAt. That is SEVEN custom fields (source_key,revision,state,target_document_id,image_manifest,media_id,last_error_class). Manifest JSON contains frozenQ and prepared flag, then opkey/hash/size/dimensions/canonical key, immutable once prepared. No-image branch has null manifest/media. See contract for conditional stage invariants.
All new operations constructed within private approval/target transaction; no partial committed row missing target. Unique source index at DB abstraction layer mandatory. No public/Media field addition. Ledger starts empty, historical sources require verified mapping.
