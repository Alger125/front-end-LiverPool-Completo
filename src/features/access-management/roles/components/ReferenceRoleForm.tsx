import { useEffect, useState } from 'react';
import { usePermissionCatalogQuery } from '../../api/permissions.queries';
import { setHasUnsavedChanges } from '../../../../shared/auth';
import {
  createRole,
  getRoleExtendedMetadata,
  saveRoleExtendedMetadata,
  type RoleConditionField,
  type RoleRuleCondition,
} from '../api/roles.api';
import { createRoleSchema } from '../schemas/create-role.schema';
import './ReferenceRoleForm.css';

interface Props {
  onCancel: () => void;
  onCreated: () => void;
}
const fields: RoleConditionField[] = ['Puesto', 'Ubicación', 'Negocio', 'Zona'];
const suggestions: Record<RoleConditionField, string[]> = {
  Puesto: ['Gerente de Tienda', 'Jefatura de Departamento', 'Administrador de Plataforma'],
  Ubicación: ['Ubicación Centro', 'Ubicación Norte', 'Liverpool Atizapán'],
  Negocio: ['Liverpool', 'Suburbia'],
  Zona: ['Zona Centro', 'Zona Norte'],
};

export function ReferenceRoleForm({ onCancel, onCreated }: Props) {
  const catalog = usePermissionCatalogQuery();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [conditions, setConditions] = useState<RoleRuleCondition[]>([
    { id: 'position', field: 'Puesto', operator: '=', value: '' },
    { id: 'location', field: 'Ubicación', operator: '=', value: '' },
    { id: 'business', field: 'Negocio', operator: '=', value: '' },
  ]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setHasUnsavedChanges(dirty);
    return () => setHasUnsavedChanges(false);
  }, [dirty]);
  function markDirty() {
    setDirty(true);
    setError('');
  }
  function cancel() {
    if (
      !dirty ||
      window.confirm('Tienes cambios sin guardar. ¿Deseas salir sin aplicar los cambios?')
    )
      onCancel();
  }
  function toggle(code: string) {
    markDirty();
    setPermissions((current) =>
      current.includes(code) ? current.filter((p) => p !== code) : [...current, code]
    );
  }
  function updateCondition(id: string, patch: Partial<RoleRuleCondition>) {
    markDirty();
    setConditions((current) => current.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  async function save() {
    const valuesFor = (field: RoleConditionField) =>
      conditions.filter((c) => c.field === field && c.value.trim()).map((c) => c.value.trim());
    const values = {
      name,
      description,
      permissionCodes: permissions,
      locationCodes: valuesFor('Ubicación'),
      departmentCodes: [],
      jobFunctionCodes: valuesFor('Puesto'),
      businessCodes: valuesFor('Negocio'),
      zoneCodes: valuesFor('Zona'),
      scopeLocationCodes: valuesFor('Ubicación'),
      scopeDepartmentCodes: [],
      canViewManagedLocations: true,
    };
    if (conditions.some((c) => !c.value.trim())) {
      setError('Completa las condiciones o elimina las filas que no necesites.');
      return;
    }
    const parsed = createRoleSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los datos del rol.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await createRole(parsed.data);
      const metadata = getRoleExtendedMetadata(created.id, created.code);
      saveRoleExtendedMetadata(created.id, { ...metadata, conditions });
      setHasUnsavedChanges(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear el rol.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      className="reference-role"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 2) void save();
      }}
    >
      {error && (
        <p className="reference-role__error" role="alert">
          {error}
        </p>
      )}
      {step === 1 ? (
        <>
          <h2>Datos del rol</h2>
          <div className="reference-role__data">
            <label>
              ID Rol
              <input value="Autogenerado" readOnly />
            </label>
            <label>
              Nombre del rol *
              <input
                value={name}
                onChange={(e) => {
                  markDirty();
                  setName(e.target.value);
                }}
                required
                maxLength={100}
              />
            </label>
            <label>
              Descripción *
              <input
                value={description}
                onChange={(e) => {
                  markDirty();
                  setDescription(e.target.value);
                }}
                required
                maxLength={500}
              />
            </label>
          </div>
          <h2>Reglas de asignación de permisos</h2>
          <div className="reference-role__workspace">
            <div>
              {catalog.isPending && <p role="status">Cargando catálogo de permisos…</p>}
              {catalog.isError && (
                <div role="alert">
                  No fue posible cargar el catálogo de permisos.{' '}
                  <button type="button" onClick={() => void catalog.refetch()}>
                    Reintentar
                  </button>
                </div>
              )}
              {catalog.data?.modules.length === 0 && (
                <p role="status">El catálogo de permisos está vacío.</p>
              )}
              <div className="reference-role__matrix">
                {catalog.data?.modules.map((module) => (
                  <div className="reference-role__module" key={module.code}>
                    <strong>{module.displayName}</strong>
                    <div className="reference-role__permissions">
                      {module.permissions
                        .filter((p) => p.assignable && p.status === 'ACTIVE')
                        .map((permission) => (
                          <label
                            key={permission.code}
                            className={permissions.includes(permission.code) ? 'is-checked' : ''}
                          >
                            <input
                              type="checkbox"
                              checked={permissions.includes(permission.code)}
                              onChange={() => toggle(permission.code)}
                            />
                            {permission.displayName}
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="reference-role__summary">
              <h2>Resumen del Rol</h2>
              <ul>
                <li>{permissions.length} permisos seleccionados</li>
                <li>
                  {
                    new Set(
                      catalog.data?.modules
                        .filter((m) => m.permissions.some((p) => permissions.includes(p.code)))
                        .map((m) => m.code)
                    ).size
                  }{' '}
                  módulos con acceso
                </li>
                <li>Asignación por condiciones</li>
                <li>Guardado explícito</li>
              </ul>
            </aside>
          </div>
        </>
      ) : (
        <>
          <h2>Asignación de Roles</h2>
          <div className="reference-role__workspace">
            <section className="reference-role__conditions">
              <h3>Reglas de Condición 1</h3>
              {conditions.map((condition, index) => (
                <div className="reference-role__condition" key={condition.id}>
                  <select
                    aria-label={`Campo de condición ${index + 1}`}
                    value={condition.field}
                    onChange={(e) =>
                      updateCondition(condition.id, {
                        field: e.target.value as RoleConditionField,
                        value: '',
                      })
                    }
                  >
                    {fields.map((field) => (
                      <option key={field}>{field}</option>
                    ))}
                  </select>
                  <select
                    aria-label={`Operador de condición ${index + 1}`}
                    value={condition.operator}
                    onChange={(e) =>
                      updateCondition(condition.id, { operator: e.target.value as '=' | 'IN' })
                    }
                  >
                    <option value="=">Es igual a</option>
                    <option value="IN">Es uno de</option>
                  </select>
                  <input
                    aria-label={`Valor de condición ${index + 1}`}
                    list={`values-${condition.id}`}
                    value={condition.value}
                    placeholder="Selecciona o escribe un valor"
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                  />
                  <datalist id={`values-${condition.id}`}>
                    {suggestions[condition.field].map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                  <button
                    type="button"
                    aria-label={`Eliminar condición ${index + 1}`}
                    onClick={() => {
                      markDirty();
                      setConditions((current) => current.filter((c) => c.id !== condition.id));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="reference-role__add"
                type="button"
                onClick={() => {
                  markDirty();
                  setConditions((current) => [
                    ...current,
                    { id: crypto.randomUUID(), field: 'Ubicación', operator: '=', value: '' },
                  ]);
                }}
              >
                + Añadir condición
              </button>
            </section>
            <aside className="reference-role__rule">
              <h3>Regla Resultante</h3>
              <p>
                {conditions
                  .filter((c) => c.value.trim())
                  .map((c) => `${c.field} ${c.operator === '=' ? '=' : 'IN'} ${c.value}`)
                  .join(' AND ') || 'Completa las condiciones para visualizar la regla.'}
              </p>
              <small>Se evaluarán todas las condiciones definidas.</small>
            </aside>
          </div>
        </>
      )}
      <footer className="reference-role__actions">
        <button type="button" onClick={step === 1 ? cancel : () => setStep(1)} disabled={saving}>
          {step === 1 ? 'Cancelar' : 'Atrás'}
        </button>
        {step === 1 ? (
          <button
            className="is-primary"
            key="continue"
            type="button"
            disabled={!catalog.data?.modules.length}
            onClick={(event) => {
              event.preventDefault();
              if (!name.trim() || !description.trim()) {
                setError('Captura el nombre y la descripción del rol.');
                return;
              }
              if (!permissions.length) {
                setError('Selecciona al menos un permiso.');
                return;
              }
              setError('');
              setStep(2);
            }}
          >
            Continuar
          </button>
        ) : (
          <button key="create" className="is-primary" type="submit" disabled={saving}>
            {saving ? 'Creando…' : 'Crear'}
          </button>
        )}
      </footer>
    </form>
  );
}
