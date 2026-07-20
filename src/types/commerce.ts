import type { StrapiBlock } from "../lib/strapiBlocks";

export type CommerceMedia = {
    id?: number;
    documentId?: string;
    name?: string | null;
    alternativeText?: string | null;
    caption?: string | null;
    width?: number | null;
    height?: number | null;
    url: string;
};

export type CommerceCategory = {
    nombre: string;
    nombre_es?: string | null;
    nombre_en?: string | null;
    slug: string;
    activa?: boolean;
};

export type CommerceSocialNetwork = {
    id?: number;
    plataforma:
        | "instagram"
        | "facebook"
        | "tiktok"
        | "youtube"
        | "linkedin"
        | "x"
        | "otra";
    url: string;
    usuario?: string | null;
    orden?: number | null;
};

export type CommerceService = {
    id?: number;
    nombre: string;
    nombre_en?: string | null;
    descripcion?: string | null;
    descripcion_en?: string | null;
    destacado?: boolean;
    orden?: number | null;
};

export type CommerceAction = {
    id?: number;
    tipo:
        | "reserva"
        | "cita"
        | "pedido"
        | "presupuesto"
        | "compra"
        | "carta"
        | "inscripcion"
        | "contacto"
        | "otra";
    etiqueta: string;
    etiqueta_en?: string | null;
    url: string;
    orden?: number | null;
};

export type CommerceHighlight = {
    id?: number;
    etiqueta: string;
    etiqueta_en?: string | null;
    valor: string;
    valor_en?: string | null;
    orden?: number | null;
};

export type CommerceScheduleDay = {
    id?: number;
    dia:
        | "lunes"
        | "martes"
        | "miercoles"
        | "jueves"
        | "viernes"
        | "sabado"
        | "domingo";
    cerrado?: boolean;
    apertura_1?: string | null;
    cierre_1?: string | null;
    apertura_2?: string | null;
    cierre_2?: string | null;
    observacion?: string | null;
    observacion_en?: string | null;
};

export type Commerce = {
    id?: number;
    documentId?: string;
    nombre: string;
    nombre_es?: string | null;
    nombre_en?: string | null;
    slug: string;
    activo?: boolean;

    descripcion_corta?: string | null;
    descripcion_corta_en?: string | null;
    descripcion_completa?: StrapiBlock[] | null;
    descripcion_completa_en?: StrapiBlock[] | null;

    direccion?: string | null;
    zona?: string | null;
    mapa_url?: string | null;
    indicaciones?: string | null;
    indicaciones_en?: string | null;

    telefono?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    web?: string | null;

    ambito_servicio?: string | null;
    ambito_servicio_en?: string | null;

    atencion_presencial?: boolean;
    atencion_domicilio?: boolean;
    atencion_online?: boolean;
    recogida_local?: boolean;
    reparto?: boolean;

    horario?: StrapiBlock[] | null;
    horario_semanal?: CommerceScheduleDay[] | null;

    imagen_principal?:
        | CommerceMedia
        | CommerceMedia[]
        | null;
    logo?: CommerceMedia | null;
    galeria?: CommerceMedia[] | null;

    redes_sociales?: CommerceSocialNetwork[] | null;
    servicios?: CommerceService[] | null;
    acciones_comerciales?: CommerceAction[] | null;
    datos_destacados?: CommerceHighlight[] | null;

    categoria?: CommerceCategory | null;
    subcategoria?: CommerceCategory | null;

    fecha_publicacion?: string | null;
};
