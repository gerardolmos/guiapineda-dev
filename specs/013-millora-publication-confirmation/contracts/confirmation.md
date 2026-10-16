# UI contract — 013

Millora + approve: antes de petición se muestra publicación en Strapi, no actualización inmediata de web estática y build/deploy posterior. No negar publicación; mantener aviso condicional de imagen.
Otras cinco secciones + approve: mensaje idéntico al baseline.
Reject de todas las secciones: mensaje idéntico al baseline.
Start-review: sin confirmación nueva.
Cancelar approve/reject: cero post, cero cambio de estado, sin activar busy.
Confirmar: un post al endpoint existente `/api/internal/moderation/{section}/{encodeURIComponent(documentId)}/{action}` con cuerpo vacío; mismo retorno, busy y error que baseline. Busy impide doble acción.
Publicación, lifecycle y servicios: read-only. Ningún endpoint nuevo ni contrato HTTP modificado.
