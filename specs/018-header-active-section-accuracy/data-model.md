# Presentation model — no persistence

Input: pathname de Layout y lang ca/es/en existentes. Normalización existente elimina barras finales y prefijo lingüístico. Estado derivado activeSection: tauler | guide | comunicats | millores | null. Única transición de clasificación propuesta: familias exactas agenda/veus y sus descendientes, guide→null. No estado de usuario, almacenamiento, esquema, API ni lectura de datos. Dos representaciones del mismo estado: escritorio y móvil. null produce cero enlaces activos en cada representación.
