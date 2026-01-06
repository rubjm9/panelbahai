export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Usuario from '@/models/Usuario';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { requireAdminAuth } from '@/lib/auth-helpers';

export default async function AdminUsuariosPage() {
  // Verificar autenticación admin
  await requireAdminAuth();
  
  await dbConnect();
  
  const usuarios = await Usuario.find({ activo: true })
    .sort({ fechaCreacion: -1 });

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-600" />;
      case 'editor':
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      default:
        return <UserX className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'editor':
        return 'Editor';
      default:
        return 'Visualizador';
    }
  };

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">
            Gestión de Usuarios
          </h1>
          <p className="text-primary-600 font-reading">
            Administra los usuarios del sistema
          </p>
        </div>
        <Link href="/admin/usuarios/nuevo" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Usuario
        </Link>
      </div>

      <div className="grid gap-6">
        {usuarios.map((usuario) => (
          <div key={usuario._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Users className="w-6 h-6 text-accent-600 mr-3" />
                  <h3 className="text-xl font-display font-semibold text-primary-900">
                    {usuario.nombre}
                  </h3>
                  <span className={`ml-3 px-2 py-1 text-sm rounded-sm ${getRoleColor(usuario.rol)}`}>
                    {getRoleLabel(usuario.rol)}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  {getRoleIcon(usuario.rol)}
                  <span className="ml-2 text-primary-600 font-sans">
                    {usuario.email}
                  </span>
                </div>
                
                <div className="text-sm text-primary-500 mb-4">
                  <p><strong>Registrado:</strong> {new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}</p>
                  <p><strong>Última actualización:</strong> {new Date(usuario.fechaActualizacion).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Link 
                  href={`/admin/usuarios/${usuario._id}`}
                  className="btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link 
                  href={`/admin/usuarios/${usuario._id}/editar`}
                  className="btn-secondary"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                {usuario.rol !== 'admin' && (
                  <button className="btn-secondary text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {usuarios.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-primary-800 mb-2">
              No hay usuarios registrados
            </h3>
            <p className="text-primary-500 mb-6">
              Comienza agregando el primer usuario al sistema
            </p>
            <Link href="/admin/usuarios/nuevo" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Usuario
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

