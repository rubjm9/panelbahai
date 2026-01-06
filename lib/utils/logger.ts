/**
 * Logger estructurado
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  page?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  clearContext() {
    this.context = {};
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: this.context,
      ...(data && { data })
    };

    if (process.env.NODE_ENV === 'production') {
      // En producción, usar formato JSON
      console[level](JSON.stringify(logEntry));
    } else {
      // En desarrollo, formato legible
      console[level](`[${timestamp}] [${level.toUpperCase()}]`, message, {
        ...this.context,
        ...(data && { data })
      });
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  // Métodos específicos para eventos de UX
  logSearch(query: string, results: number, duration: number) {
    this.info('Búsqueda realizada', {
      query,
      results,
      duration,
      action: 'search'
    });
  }

  logIndexLoad(duration: number, documentCount: number) {
    this.info('Índice de búsqueda cargado', {
      duration,
      documentCount,
      action: 'index_load'
    });
  }

  logNavigation(target: string, duration: number) {
    this.info('Navegación a párrafo', {
      target,
      duration,
      action: 'navigate'
    });
  }

  logAdminAction(action: string, resource: string, success: boolean) {
    this.info(`Acción de admin: ${action}`, {
      action,
      resource,
      success,
      type: 'admin_action'
    });
  }
}

// Instancia singleton
export const logger = new Logger();


