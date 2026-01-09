/**
 * Tipos compartidos para la capa de servicios
 */

import { IAutor } from '@/models/Autor';
import { IObra } from '@/models/Obra';
import { IParrafo } from '@/models/Parrafo';
import { ISeccion } from '@/models/Seccion';

// Tipos para respuestas públicas (sin campos internos)
export type PublicAutor = Pick<IAutor, 'nombre' | 'slug' | 'biografia' | 'orden'> & {
  _id: string;
};

export type PublicObra = Pick<
  IObra,
  | 'titulo'
  | 'slug'
  | 'descripcion'
  | 'fechaPublicacion'
  | 'esPublico'
  | 'archivoDoc'
  | 'archivoPdf'
  | 'archivoEpub'
> & {
  _id: string;
  autor: {
    _id: string;
    nombre: string;
    slug: string;
    biografia?: string;
  };
};

export type PublicSeccion = Pick<
  ISeccion,
  'titulo' | 'slug' | 'nivel' | 'orden'
> & {
  _id: string;
  subsecciones: PublicSeccion[];
};

export type PublicParrafo = Pick<IParrafo, 'numero' | 'texto' | 'orden'> & {
  _id: string;
  seccion?: {
    titulo: string;
    slug: string;
  };
};

// Tipo para obra completa con secciones y párrafos
export type ObraCompleta = {
  obra: PublicObra;
  secciones: PublicSeccion[];
  parrafos: PublicParrafo[];
};

// Tipos para inputs de admin
export type CreateObraInput = {
  titulo: string;
  autor: string; // ObjectId
  descripcion?: string;
  fechaPublicacion?: Date;
  esPublico?: boolean;
  orden?: number;
};

export type UpdateObraInput = Partial<Pick<
  IObra,
  'titulo' | 'descripcion' | 'fechaPublicacion' | 'esPublico' | 'orden' | 'estado' | 'contenido'
>>;

export type UpdateParrafoInput = Partial<Pick<
  IParrafo,
  'numero' | 'texto' | 'seccion' | 'orden'
>>;


