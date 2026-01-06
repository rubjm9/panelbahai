/**
 * Exportaciones admin de servicios
 * 
 * SOLO para usar en API routes o Server Actions con autenticación.
 * NO importar en Server Components públicos.
 */

export {
  createObra,
  updateObra,
  deleteObra,
} from './obraAdminService';

export {
  createParrafo,
  updateParrafo,
  deleteParrafo,
} from './parrafoAdminService';


