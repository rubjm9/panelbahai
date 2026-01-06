import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import dbConnect from './mongodb';

let gridFSBucket: GridFSBucket | null = null;

/**
 * Obtiene o crea el bucket de GridFS
 */
async function getGridFSBucket(): Promise<GridFSBucket> {
  if (gridFSBucket) {
    return gridFSBucket;
  }

  try {
    await dbConnect();
    const conn = mongoose.connection.db;
    
    if (!conn) {
      throw new Error('Database connection not available');
    }

    gridFSBucket = new GridFSBucket(conn, {
      bucketName: 'archivos'
    });

    return gridFSBucket;
  } catch (error) {
    console.error('Error obteniendo GridFS bucket:', error);
    throw error;
  }
}

/**
 * Sube un archivo a GridFS
 * @param file Archivo a subir
 * @param metadata Metadatos adicionales (opcional)
 * @returns ID del archivo en GridFS
 */
export async function uploadFile(
  file: File | Buffer,
  metadata?: { obraId?: string; tipo?: string; filename?: string; [key: string]: any }
): Promise<string> {
  const bucket = await getGridFSBucket();
  
  // Convertir File a Buffer si es necesario
  let buffer: Buffer;
  let filename: string;
  let contentType: string | undefined;
  
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
    filename = file.name;
    contentType = file.type || undefined;
  } else {
    buffer = file;
    filename = metadata?.filename || `file-${Date.now()}`;
  }

  // Determinar content-type si no está disponible
  if (!contentType && filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'epub': 'application/epub+zip'
    };
    contentType = mimeTypes[ext || ''] || 'application/octet-stream';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
      metadata: metadata || {}
    });

    uploadStream.on('error', (error) => {
      reject(error);
    });

    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(buffer);
  });
}

/**
 * Descarga un archivo de GridFS
 * @param fileId ID del archivo en GridFS
 * @returns Buffer del archivo y metadatos
 */
export async function downloadFile(fileId: string): Promise<{
  buffer: Buffer;
  filename: string;
  contentType?: string;
  metadata?: any;
}> {
  const bucket = await getGridFSBucket();
  const objectId = new ObjectId(fileId);

  // Obtener metadatos del archivo
  const files = await bucket.find({ _id: objectId }).toArray();
  
  if (files.length === 0) {
    throw new Error('File not found');
  }

  const fileInfo = files[0];
  
  // Descargar el archivo
  const chunks: Buffer[] = [];
  const downloadStream = bucket.openDownloadStream(objectId);

  return new Promise((resolve, reject) => {
    downloadStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    downloadStream.on('error', (error) => {
      reject(error);
    });

    downloadStream.on('end', () => {
      resolve({
        buffer: Buffer.concat(chunks),
        filename: fileInfo.filename,
        contentType: fileInfo.contentType,
        metadata: fileInfo.metadata
      });
    });
  });
}

/**
 * Busca un archivo por nombre
 * @param filename Nombre del archivo
 * @returns ID del archivo o null si no existe
 */
export async function findFileByName(filename: string): Promise<string | null> {
  const bucket = await getGridFSBucket();
  
  const files = await bucket.find({ filename }).toArray();
  
  if (files.length === 0) {
    return null;
  }

  // Retornar el más reciente si hay múltiples
  const latestFile = files.sort((a, b) => 
    b.uploadDate.getTime() - a.uploadDate.getTime()
  )[0];

  return latestFile._id.toString();
}

/**
 * Elimina un archivo de GridFS
 * @param fileId ID del archivo
 */
export async function deleteFile(fileId: string): Promise<void> {
  const bucket = await getGridFSBucket();
  const objectId = new ObjectId(fileId);
  
  await bucket.delete(objectId);
}

/**
 * Verifica si un archivo existe
 * @param fileId ID del archivo
 * @returns true si existe, false si no
 */
export async function fileExists(fileId: string): Promise<boolean> {
  try {
    const bucket = await getGridFSBucket();
    const objectId = new ObjectId(fileId);
    const files = await bucket.find({ _id: objectId }).toArray();
    return files.length > 0;
  } catch (error) {
    return false;
  }
}

