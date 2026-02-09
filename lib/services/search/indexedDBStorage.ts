/**
 * Gestor de IndexedDB para cache persistente del índice de búsqueda
 * Permite guardar y recuperar el índice sin necesidad de descargarlo cada vez
 */

import { SearchDocument } from './types';

const DB_NAME = 'panel-bahai-search';
const DB_VERSION = 2; // Bumped to invalidate old cache with only title docs
const STORE_NAME = 'searchIndex';
const INDEX_VERSION_KEY = 'indexVersion';
const INDEX_DATA_KEY = 'indexData';
const INDEX_TIMESTAMP_KEY = 'indexTimestamp';

interface IndexedDBStorage {
  getIndex(): Promise<SearchDocument[] | null>;
  saveIndex(documents: SearchDocument[], version?: string): Promise<void>;
  clearIndex(): Promise<void>;
  isAvailable(): boolean;
  getIndexVersion(): Promise<string | null>;
  getIndexTimestamp(): Promise<number | null>;
}

class IndexedDBStorageImpl implements IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 horas por defecto

  /**
   * Verificar si IndexedDB está disponible
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  /**
   * Inicializar la base de datos
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    if (!this.isAvailable()) {
      throw new Error('IndexedDB no está disponible');
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject(new Error('Error abriendo IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Crear object store si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Obtener el índice desde IndexedDB
   */
  async getIndex(): Promise<SearchDocument[] | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(INDEX_DATA_KEY);

        request.onsuccess = () => {
          const result = request.result;
          
          if (!result || !result.value) {
            resolve(null);
            return;
          }

          // Verificar TTL
          const timestamp = result.timestamp || 0;
          const age = Date.now() - timestamp;
          
          if (age > this.TTL) {
            // Cache expirado
            resolve(null);
            return;
          }

          // Devolver datos
          resolve(result.value as SearchDocument[]);
        };

        request.onerror = () => {
          reject(new Error('Error leyendo de IndexedDB'));
        };
      });
    } catch (error) {
      console.warn('Error accediendo a IndexedDB:', error);
      return null;
    }
  }

  /**
   * Guardar el índice en IndexedDB
   */
  async saveIndex(documents: SearchDocument[], version?: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const timestamp = Date.now();

        // Guardar datos del índice
        const dataRequest = store.put({
          key: INDEX_DATA_KEY,
          value: documents,
          timestamp
        });

        // Guardar versión si se proporciona
        if (version) {
          store.put({
            key: INDEX_VERSION_KEY,
            value: version,
            timestamp
          });
        }

        // Guardar timestamp
        store.put({
          key: INDEX_TIMESTAMP_KEY,
          value: timestamp,
          timestamp
        });

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = () => {
          reject(new Error('Error guardando en IndexedDB'));
        };
      });
    } catch (error) {
      console.warn('Error guardando en IndexedDB:', error);
      // No rechazar, solo loguear el error
    }
  }

  /**
   * Limpiar el índice de IndexedDB
   */
  async clearIndex(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Eliminar todos los datos relacionados con el índice
        [INDEX_DATA_KEY, INDEX_VERSION_KEY, INDEX_TIMESTAMP_KEY].forEach(key => {
          store.delete(key);
        });

        transaction.oncomplete = () => {
          resolve();
        };

        transaction.onerror = () => {
          reject(new Error('Error limpiando IndexedDB'));
        };
      });
    } catch (error) {
      console.warn('Error limpiando IndexedDB:', error);
    }
  }

  /**
   * Obtener la versión del índice
   */
  async getIndexVersion(): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(INDEX_VERSION_KEY);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };

        request.onerror = () => {
          reject(new Error('Error leyendo versión de IndexedDB'));
        };
      });
    } catch (error) {
      console.warn('Error obteniendo versión de IndexedDB:', error);
      return null;
    }
  }

  /**
   * Obtener el timestamp del índice
   */
  async getIndexTimestamp(): Promise<number | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(INDEX_TIMESTAMP_KEY);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : null);
        };

        request.onerror = () => {
          reject(new Error('Error leyendo timestamp de IndexedDB'));
        };
      });
    } catch (error) {
      console.warn('Error obteniendo timestamp de IndexedDB:', error);
      return null;
    }
  }

  /**
   * Configurar TTL personalizado
   */
  setTTL(ttl: number): void {
    (this as any).TTL = ttl;
  }
}

// Instancia singleton
export const indexedDBStorage = new IndexedDBStorageImpl();

