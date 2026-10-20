import { useNavigate } from 'react-router-dom';

import { APP_ROUTES } from '../../../../app/config/routes';
import { RoleForm } from '../components/RoleForm';

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
    <main className="create-role-page">
      <section className="create-role-page__content">
        <h1 className="create-role-page__title">Crear rol</h1>

        <RoleForm onCancel={handleCancel} onCreated={handleCreated} />
      </section>
    </main>
  );
}
