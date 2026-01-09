/**
 * Cache compartido para datos de filtros (autores y obras)
 * Evita múltiples llamadas a la API desde diferentes componentes
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface Autor {
  value: string;
  label: string;
}

interface Obra {
  value: string;
  label: string;
}

class FilterDataCache {
  private autoresCache: CachedData<Autor[]> | null = null;
  private obrasCache: CachedData<Obra[]> | null = null;
  private readonly TTL = 5 * 60 * 1000; // 5 minutos
  private loadingPromises: {
    autores?: Promise<Autor[]>;
    obras?: Promise<Obra[]>;
  } = {};

  /**
   * Obtener autores desde cache o API
   */
  async getAutores(): Promise<Autor[]> {
    // Verificar cache válido
    if (this.autoresCache && Date.now() - this.autoresCache.timestamp < this.TTL) {
      return this.autoresCache.data;
    }

    // Si ya hay una petición en curso, esperar a que termine
    if (this.loadingPromises.autores) {
      return this.loadingPromises.autores;
    }

    // Cargar desde API
    this.loadingPromises.autores = this.loadAutoresFromAPI();
    
    try {
      const data = await this.loadingPromises.autores;
      this.autoresCache = {
        data,
        timestamp: Date.now()
      };
      return data;
    } finally {
      delete this.loadingPromises.autores;
    }
  }

  /**
   * Obtener obras desde cache o API
   */
  async getObras(): Promise<Obra[]> {
    // Verificar cache válido
    if (this.obrasCache && Date.now() - this.obrasCache.timestamp < this.TTL) {
      return this.obrasCache.data;
    }

    // Si ya hay una petición en curso, esperar a que termine
    if (this.loadingPromises.obras) {
      return this.loadingPromises.obras;
    }

    // Cargar desde API
    this.loadingPromises.obras = this.loadObrasFromAPI();
    
    try {
      const data = await this.loadingPromises.obras;
      this.obrasCache = {
        data,
        timestamp: Date.now()
      };
      return data;
    } finally {
      delete this.loadingPromises.obras;
    }
  }

  /**
   * Cargar autores desde la API
   */
  private async loadAutoresFromAPI(): Promise<Autor[]> {
    try {
      const response = await fetch('/api/autores');
      if (!response.ok) {
        throw new Error('Error al cargar autores');
      }
      const data = await response.json();
      return data.data?.map((autor: any) => ({
        value: autor.slug,
        label: autor.nombre
      })) || [];
    } catch (error) {
      console.error('Error cargando autores:', error);
      return [];
    }
  }

  /**
   * Cargar obras desde la API
   */
  private async loadObrasFromAPI(): Promise<Obra[]> {
    try {
      const response = await fetch('/api/obras');
      if (!response.ok) {
        throw new Error('Error al cargar obras');
      }
      const data = await response.json();
      return data.data?.map((obra: any) => ({
        value: obra.slug,
        label: obra.titulo
      })) || [];
    } catch (error) {
      console.error('Error cargando obras:', error);
      return [];
    }
  }

  /**
   * Invalidar cache de autores
   */
  invalidateAutores(): void {
    this.autoresCache = null;
  }

  /**
   * Invalidar cache de obras
   */
  invalidateObras(): void {
    this.obrasCache = null;
  }

  /**
   * Invalidar todo el cache
   */
  invalidateAll(): void {
    this.autoresCache = null;
    this.obrasCache = null;
  }

  /**
   * Precargar todos los datos
   */
  async preload(): Promise<void> {
    await Promise.all([
      this.getAutores(),
      this.getObras()
    ]);
  }
}

// Instancia singleton
export const filterDataCache = new FilterDataCache();

