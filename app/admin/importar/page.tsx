import { redirect } from 'next/navigation';
import { requireAdminAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Importar Documentos - Admin | Panel Bahá\'í',
  description: 'Importar documentos Word al Panel de Traducción de Literatura Bahá\'í'
}

export default async function AdminImportPage() {
  // Verificar autenticación admin
  await requireAdminAuth();
  
  // Redirigir a la página de nueva obra donde ahora está integrada la funcionalidad de importar
  redirect('/admin/obras/nueva');
}

