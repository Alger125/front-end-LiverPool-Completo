import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../../../app/config/routes';
import { ReferenceRoleForm } from '../components/ReferenceRoleForm';

import './CreateRolePage.css';

export function CreateRolePage() {
  const navigate = useNavigate();

  function handleCancel(): void {
    navigate(APP_ROUTES.roles);
  }

  function handleCreated(): void {
    navigate(APP_ROUTES.roles, {
      replace: true,
      state: {
        successMessage: 'Rol creado exitosamente',
      },
    });
  }

  return (
    <section className="create-role-page">
      <section className="create-role-page__content">
        <p className="reference-breadcrumb">Inicio / Roles y permisos / Crear Rol</p>
        <h1 className="create-role-page__title">Crear Rol</h1>

        <ReferenceRoleForm onCancel={handleCancel} onCreated={handleCreated} />
      </section>
    </section>
  );
}
