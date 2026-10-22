# Validación futura — no ejecutar en esta fase

1. Clonar schemas en memoria y probar validator instalado: nombre/principal null fallan antes, pasan en modelo propuesto; longitudes inválidas presentes siguen fallando. No importar aplicación Strapi ni conectar DB.
2. Builder Function y parser/servicio interno: missing/null/blank nombre, principal ausente/vacía, IDs aportados cliente, bypass create/admin; cero writes/consumo innecesario. Caso válido CA/ES/EN intacto.
3. Guard: activo no admite vaciados, rechazos no reponen privados, autorización solo permite limpieza monotónica y resolución válida; aprobación conserva nombre/teléfono/materiales y limpia email.
4. Servicios con documentos/filesystem en memoria: rechazo completo, asset ausente/null, duplicados, compartido otra solicitud/sección, Media relacionado, fallo de lectura de referencias, delete falla, update después de delete falla, segunda ejecución y cron retry. Nada de DB real ni cuarentena real.
5. Concurrencia controlada por barreras: lectura vs mutación/reject/cleaner; no borrar si cambió ownership. Multiworker no activado hasta estrategia validada.
6. Logs capturados con PII sentinela: no payload/error crudo, no evento completed en fallo, no segundo completed en no-op.
7. Admin montado con documentos sintéticos null/[] y respuestas404; editar, guardar activo y rechazado, renderizar estado pending y copy rechazo distinto de aprobación. No Strapi conectado a DB.
8. Carga/compilación de módulos sin bootstrap, regresiones de contrato005 adaptadas a nueva política; no ejecutar scripts que inspeccionen SQLite. Revisar allowlist y cambios de tipos generados sin servidor.

Estas son pruebas requeridas, NO resultados PASS. Ningún script de QA/migración se ha creado o ejecutado en esta fase.
