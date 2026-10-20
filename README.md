# front-end-LiverPool-Completo

> **Gestión de Estructuras Comerciales (ZDeptos — El Puerto de Liverpool)**  
> Plataforma corporativa frontend integral para la administración, visualización, planificación, gobierno de accesos, auditoría y conciliación de estructuras comerciales organizacionales para las tiendas **Liverpool**, **Suburbia** y **Corporativo (PAC, Hardline, Softline)**.

---

## 📋 Tabla de Contenidos

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrategia de Ramas por Feature (Git Workflow)](#estrategia-de-ramas-por-feature-git-workflow)
4. [Mapeo de Casos de Uso y Funcionalidades](#mapeo-de-casos-de-uso-y-funcionalidades)
   - [Feature 1: Autenticación SSO, Layout, Home y Buscador Global](#feature-1-autenticación-sso-layout-home-y-buscador-global)
   - [Feature 2: Roles, Permisos y Asignación por Excepción](#feature-2-roles-permisos-y-asignación-por-excepción)
   - [Feature 3: Estructuras Jerárquicas, Grupos y Secciones](#feature-3-estructuras-jerárquicas-grupos-y-secciones)
   - [Feature 4: Planeación Futura, Cierre de Periodo y Concurrencia](#feature-4-planeación-futura-cierre-de-periodo-y-concurrencia)
   - [Feature 5: Módulo de Reportes Oficiales](#feature-5-módulo-de-reportes-oficiales)
   - [Feature 6: Historial de Auditoría y Cargas Iniciales Masivas](#feature-6-historial-de-auditoría-y-cargas-iniciales-masivas)
5. [Especificación Integral de Contratos DTO y Schemas OpenAPI 3.0](#especificación-integral-de-contratos-dto-y-schemas-openapi-30)
6. [Perfiles de Prueba y Roles del Sistema](#perfiles-de-prueba-y-roles-del-sistema)
7. [Guía de Instalación y Ejecución Local](#guía-de-instalación-y-ejecución-local)
8. [Scripts Disponibles y Testing](#scripts-disponibles-y-testing)
9. [Mapa de Rutas de la Aplicación](#mapa-de-rutas-de-la-aplicación)

---

## 🎯 Visión General del Proyecto

**ZDeptos** es la solución de Liverpool para gobernar la jerarquía comercial desde la Alta Dirección hasta la Sección en piso de venta. Permite:
- Resolver la asignación de responsables y personal comercial con soporte de **herencia jerárquica** y detección de **vacantes**.
- Blindar la continuidad operativa mediante el concepto de **Sección Ancla (🔒)**, impidiendo desasignaciones o eliminaciones que dejen huérfanos a los colaboradores.
- Planificar en paralelo el mes vigente y el mes siguiente (Mes+1), programando publicaciones futuras automáticas.
- Bloquear ediciones al cierre del ciclo operativo (Día 25) para el cálculo confiable de planes de venta.
- Administrar el catálogo de roles, alcance organizacional y excepciones temporales.
- Generar reportes tabulares con exportación real en **`.CSV`** y **`.TXT`**.
- Proveer trazabilidad e inmutabilidad en una bitácora de auditoría histórica y procesar cargas masivas iniciales.

---

## 🛠 Stack Tecnológico

| Capa / Herramienta | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Core** | **React 19** + **TypeScript ~5.8** | Construcción de interfaces reactivas tipadas de alto rendimiento |
| **Bundler** | **Vite 7** | Compilación ultrarrápida y Hot Module Replacement (HMR) |
| **Ruteo** | **React Router DOM v7** | Navegación SPA con guardas de permiso por ruta (`RoutePermissionGuard`) |
| **Estado y Mocks** | **TanStack React Query v5** + **MSW v2 (Mock Service Worker)** | Simulación fidedigna de APIs REST corporativas, contratos y estado asíncrono |
| **Formularios** | **React Hook Form v7** + **Zod v4** | Validación declarativa de esquemas y contratos de datos |
| **Diseño y Estilos** | **CSS Modular Personalizado (100% Responsive)** | Paleta oficial Liverpool (`#762a91`, `#5e1f72`, `#eadcf0`), soporte Mobile, Tablet y Desktop |
| **Testing** | **Vitest** + **Testing Library** | 18 pruebas automáticas de integración que validan los flujos de negocio |

---

## 🌿 Estrategia de Ramas por Feature (Git Workflow)

Para facilitar el mantenimiento, la revisión de código por pares y atender solicitudes de cambio específicas de forma aislada, el repositorio se encuentra estructurado en las siguientes ramas:

* **`main`**: Rama principal de producción con todas las features integradas, build verificado y pruebas aprobadas.
* **`feature/1-auth-home-search`**:
  * Autenticación SSO (`CU-SEC-001`), logout y expiración (`CU-SEC-007`), Header/Sidebar unificado, Home (`CU-HOM-001`, `CU-HOM-002`) y Buscador Global (`CU-HOM-003`).
* **`feature/2-roles-permisos-excepciones`**:
  * Catálogo de roles (`CU-SEC-004`), detalle solo lectura (`CU-SEC-002`), edición con concurrencia 409 (`CU-SEC-005`), eliminación con advertencia de impacto (`CU-SEC-003`) y gestión de excepciones a colaboradores (`CU-SEC-006`).
* **`feature/3-estructuras-grupos-secciones`**:
  * Árbol de Operaciones y Corporativo (`CU-EST-001`), administración en 3 columnas de grupos y secciones (`CU-ADM-002`), protección de Sección Ancla y elegibilidad de borrado (`CU-ADM-003`), y traslado de secciones entre grupos con impacto en colaboradores (`CU-ADM-004`).
* **`feature/4-planeacion-futura-publicaciones`**:
  * Planeación paralela Mes Actual vs Mes Siguiente (`CU-ADM-005`), programación y cancelación de publicaciones futuras (`CU-ADM-006`), bloqueo por cierre de periodo operativo (`CU-ADM-007`), y control de concurrencia departamental (`CU-ADM-008`).
* **`feature/5-reportes-rol-general`**:
  * Hub de reportes oficiales, wizard de 3 pasos de Reporte por Rol (`CU-EST-002`), wizard de Reporte General con validación de fechas (`CU-EST-003`), y exportadores a `CSV` y `TXT`.
* **`feature/6-historial-cargas-masivas`**:
  * Bitácora de auditoría transversal con panel lateral de estadísticas y comparador antes/después (`CU-HIS-001`), y módulo de Cargas Iniciales Masivas con validador y descarga de plantilla (`CU-CIN-001`).

---

## 📖 Mapeo de Casos de Uso, Funcionalidades y Endpoints API

> **Nota sobre Métodos HTTP:** En la arquitectura REST, las operaciones de actualización (**UPDATE**) se implementan mediante **`PUT`** (para reemplazo o actualización completa de entidad) y **`PATCH`** (para modificación parcial de campos, como mover secciones entre grupos en `PATCH /structures/departments/:id/sections/move`). El método `UPDATE` no existe en la especificación HTTP; se utilizan `PUT` y `PATCH`.

---

### Feature 1: Autenticación SSO, Layout, Home y Buscador Global
* **`CU-SEC-001` (Login SSO Corporativo):**
  * Pantalla split morada/blanca con credenciales simuladas, badge de *"Conexión Segura"* y control de errores excepcionales (FE-01 a FE-07).
* **`CU-SEC-007` (Cierre de Sesión Seguro y Expiración):**
  * Dropdown de usuario en el header con avatar y rol, modal de confirmación, detección de cambios pendientes sin guardar, pantalla de *"Sesión finalizada"* y *"Su sesión ha expirado"*, sincronización multi-pestaña.
* **`CU-HOM-001` & `CU-HOM-002` (Home y Gobernanza de Módulos):**
  * Saludo personalizado (*"Hola, [Nombre]"*), contexto de sesión (perfil activo, colaborador, ubicación, alcance, excepción vigente) y tarjetas modulares dinámicas autorizadas según permisos efectivos.
* **`CU-HOM-003` (Buscador Global con Alcance):**
  * Barra con lupa en header y vista `/search` con búsqueda reactiva en tiempo real sobre departamentos, grupos, secciones y colaboradores acotados al alcance del usuario.

#### 📡 Endpoints Conectados (Feature 1)

| Método HTTP | Endpoint API | Caso de Uso / HU | Descripción, Parámetros y Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/sso/callback` | `CU-SEC-001` / `HU-01` | **Inicio de Sesión SSO:** Valida token Microsoft Entra ID (`accessToken`), consulta el usuario en PostgreSQL (`zd_security.app_user`), resuelve roles/permisos en BD y crea sesión. |
| `POST` | `/api/v1/auth/session/keep-alive` | `CU-SEC-001` / `CU-SEC-007` | **Latido de Sesión:** Renueva la vigencia de la sesión activa en el backend (inactividad 15 min). Header `x-session-id`. |
| `POST` | `/api/v1/auth/logout` | `CU-SEC-007` / `HU-03` | **Cierre de Sesión:** Invalida el token en blacklist e inserta evento en auditoría. Body: `{ reason: "MANUAL" \| "INACTIVITY" }`. |
| `GET` | `/api/v1/auth/session` | `CU-SEC-001` / `CU-SEC-007` | **Validación de Sesión:** Verifica si la sesión continúa activa y retorna tiempo antes de expiración. |
| `GET` | `/api/v1/users/me/profile` | `CU-HOM-001` / `HU-07` | **Perfil y Saludo:** Consulta datos en PostgreSQL (`zd_security.app_user`), saludo *"Hola, [Nombre]"*, rol activo y tiendas autorizadas. |
| `GET` | `/api/v1/users/me/modules` | `CU-HOM-002` / `HU-08` | **Módulos Autorizados:** Lista los módulos habilitados dinámicamente según permisos asignados en BD. |
| `GET` | `/api/v1/search` | `CU-HOM-003` / `HU-09` | **Búsqueda Global Unificada:** Búsqueda reactiva en tiempo real sobre departamentos, colaboradores y secciones. Query: `?q={criterio}&limit=10`. |
| `GET` | `/api/v1/search/departments` | `CU-HOM-003` / `HU-10` | **Buscador de Departamentos:** Filtro de departamentos comerciales acotados a tiendas autorizadas. Query: `?q={nombreOcodigo}`. |
| `GET` | `/api/v1/search/employees` | `CU-HOM-003` / `HU-11` | **Buscador de Colaboradores:** Filtro de colaboradores por nombre o número de nómina. Query: `?q={nombreOempleado}`. |
| `GET` | `/api/v1/search/sections` | `CU-HOM-003` / `HU-12` | **Buscador de Secciones:** Filtro de secciones comerciales dentro del alcance. Query: `?q={nombreOcodigo}`. |

---

### Feature 2: Roles, Permisos y Asignación por Excepción
* **`CU-SEC-004` (Catálogo de Roles y Permisos):**
  * Tabla con buscador en tiempo real por ID, nombre, descripción o permiso, columna de *Regla de Alcance*, acciones directas *Ver*, *Editar*, *Eliminar* y acceso a excepciones.
* **`CU-SEC-002` (Detalle de Rol en Solo Lectura):**
  * Ficha técnica del rol con desglose de permisos activos por módulo y regla de alcance organizacional.
* **`CU-SEC-005` (Edición de Rol con Concurrencia 409):**
  * Constructor de reglas por Puesto/Ubicación/Negocio, matriz modular de permisos y detección de conflicto de versión concurrente (`problem-version-conflict.json`).
* **`CU-SEC-003` (Eliminación con Advertencia de Impacto):**
  * Modal de advertencia que consulta previamente `/impact`, muestra los usuarios afectados y bloquea la baja de roles protegidos por sistema.
* **`CU-SEC-006` (Asignación por Excepción a Colaboradores):**
  * Buscador de empleado, asignación temporal de rol y ubicación con justificación obligatoria y revocación anticipada.

#### 📡 Endpoints Conectados (Feature 2)

| Método HTTP | Endpoint API | Caso de Uso / HU | Descripción, Parámetros y Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/roles` | `CU-SEC-004` / `HU-13` | **Catálogo de Roles:** Lista de roles con buscador y regla de alcance resultante. |
| `POST` | `/api/v1/roles` | `CU-SEC-004` / `HU-14` | **Crear Rol:** Alta de rol con nombre, descripción, segmentación y matriz de permisos. Body: `CreateRoleDto`. |
| `GET` | `/api/v1/roles/:roleId` | `CU-SEC-002` / `CU-SEC-005` | **Detalle de Rol:** Consulta la ficha técnica del rol en solo lectura o para edición. |
| `PUT` | `/api/v1/roles/:roleId` | `CU-SEC-005` / `HU-15` | **Actualizar Rol (UPDATE):** Actualización completa del rol con control de concurrencia optimista (`409 Conflict`) mediante el header `If-Match: "{version}"`. |
| `DELETE` | `/api/v1/roles/:roleId` | `CU-SEC-003` / `HU-16` | **Baja de Rol:** Baja lógica de rol; bloquea la eliminación si es un rol protegido del sistema. |
| `POST` | `/api/v1/roles/:roleId/clone` | `CU-SEC-004` / `HU-17` | **Clonar Rol:** Clona un rol existente como plantilla base para nuevas creaciones. |
| `GET` | `/api/v1/roles/:roleId/segmentation` | `CU-SEC-004` / `HU-18` | **Consultar Segmentación:** Consulta la regla de alcance por negocio, zona o tienda. |
| `PUT` | `/api/v1/roles/:roleId/segmentation` | `CU-SEC-004` / `HU-18` | **Actualizar Segmentación (UPDATE):** Define el alcance geográfico y de puestos del rol. |
| `GET` | `/api/v1/roles/:roleId/impact` | `CU-SEC-003` / `HU-19` | **Matriz de Impacto:** Previsualiza usuarios y asignaciones afectadas antes de eliminar el rol. |
| `GET` | `/api/v1/permissions/grouped` | `CU-SEC-004` / `CU-SEC-005` | **Matriz de Permisos Agrupada:** Catálogo de permisos clasificados por módulo funcional (`SECURITY_ROLES`, `STRUCTURE_CONFIG`, etc.). |
| `GET` | `/api/v1/permissions` | `CU-SEC-004` | **Catálogo Plano de Permisos:** Lista completa de permisos del sistema para validaciones internas. |
| `GET` | `/api/v1/users` | `CU-SEC-006` / `HU-20` | **Catálogo de Colaboradores:** Consulta y autocompletado de colaboradores para asignar roles o excepciones. |
| `GET` | `/api/v1/access-scopes` | `CU-SEC-006` / `HU-21` | **Catálogo de Alcances:** Lista de tiendas, zonas y áreas para definir el alcance de excepciones. |
| `GET` | `/api/v1/role-exceptions` | `CU-SEC-006` / `HU-22` | **Listado de Excepciones:** Consulta de excepciones temporales activas, programadas o revocadas. |
| `POST` | `/api/v1/role-exceptions` | `CU-SEC-006` / `HU-23` | **Crear Excepción:** Asigna un rol temporal a un colaborador con fecha de inicio/fin y justificación obligatoria. |
| `GET` | `/api/v1/role-exceptions/:id` | `CU-SEC-006` / `HU-24` | **Detalle de Excepción:** Información completa de la excepción temporal. |
| `PUT` | `/api/v1/role-exceptions/:id` | `CU-SEC-006` / `HU-25` | **Actualizar Excepción (UPDATE):** Modifica la vigencia o justificación de una excepción activa. |
| `POST` | `/api/v1/role-exceptions/:id/revoke` | `CU-SEC-006` / `HU-26` | **Revocar Excepción:** Revocación anticipada de una excepción de acceso temporal con motivo obligatorio. |
| `POST` | `/api/v1/role-exceptions/impact` | `CU-SEC-006` / `HU-27` | **Impacto de Revocación:** Calcula los permisos que el colaborador perderá antes de confirmar la revocación. |
| `POST` | `/api/v1/role-exceptions/bulk` | `CU-SEC-006` / `HU-28` | **Carga Masiva de Excepciones:** Procesamiento en bloque de múltiples excepciones temporales. |

---

### Feature 3: Estructuras Jerárquicas, Grupos y Secciones
* **`CU-EST-001` (Estructuras de Operaciones y Corporativo):**
  * Navegación multinivel sin `N/A`: Dirección → Gerencia → Coordinación → Departamento → Grupo → Sección.
  * Soporte para formatos **Liverpool** y **Suburbia**, y corporativo **PAC**, **Hardline** y **Softline**.
  * Distintivos visuales para **Sección Ancla (🔒)**, **Responsable Heredado (↳)**, **Vacantes** y **Publicación Futura**.
  * Acciones conectadas en cada nodo: `+` (Administrar grupos), `✎` (Editar grupo), `↺` (Bitácora de auditoría del nodo).
* **`CU-ADM-001` (Tabla Contenedora y Publicaciones Programadas):**
  * Vista maestra de grupos comerciales, responsables titulares y adicionales (`+N`), última actualización y bandeja de publicaciones programadas.
* **`CU-ADM-002` (Editor de Grupos y Secciones en 3 Columnas):**
  * Workspace comparativo (*Grupos* | *Secciones Asignadas* | *Catálogo Disponible*).
  * Modal para crear y renombrar grupos con departamento padre fijo y validación de nombres duplicados.
  * Protección estricta: las Secciones Ancla (🔒) no pueden ser desasignadas.
* **`CU-ADM-003` (Eliminación con Validación de Elegibilidad):**
  * Bloqueo inmediato con modal *"Movimiento no permitido"* si el grupo contiene una Sección Ancla o es el único grupo del departamento.
  * Modal de confirmación para grupos elegibles (ej. Grupo 004) liberando sus secciones al catálogo disponible.
* **`CU-ADM-004` (Movimiento de Secciones entre Grupos):**
  * Pantalla interactiva *Grupo Origen* vs *Grupo Destino*, bandeja de *Cambios pendientes de guardar* y modal *"Confirmar movimientos"* detallando los colaboradores anclados impactados.

#### 📡 Endpoints Conectados (Feature 3)

| Método HTTP | Endpoint API | Caso de Uso / HU | Descripción, Parámetros y Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/geography/zones` | `CU-EST-001` / `HU-29` | **Catálogo de Zonas:** Zonas geográficas operativas (Metro Centro, Golfo, Norte, etc.). |
| `GET` | `/api/v1/geography/zones/:zoneId/locations` | `CU-EST-001` / `HU-30` | **Tiendas de la Zona:** Ubicaciones y formatos (Liverpool / Suburbia) asociadas a una zona. |
| `GET` | `/api/v1/structures/tree` | `CU-EST-001` / `HU-31` | **Árbol de Estructura Comercial:** Jerarquía Tienda $\rightarrow$ Depto $\rightarrow$ Grupo $\rightarrow$ Sección con Sección Ancla (🔒), Responsable Heredado (↳) y vacantes. Query: `?locationId={uuid}&period={YYYY-MM}`. |
| `GET` | `/api/v1/structures/locations/:locationId/summary` | `CU-EST-001` / `HU-32` | **Resumen de Tienda:** Métricas consolidadas de departamentos, grupos y secciones de una tienda. |
| `GET` | `/api/v1/structures/departments/:departmentId/groups` | `CU-ADM-001` / `CU-ADM-002` | **Grupos del Departamento:** Lista de grupos comerciales con secciones asignadas, sección ancla y colaboradores vinculados. |
| `GET` | `/api/v1/structures/departments/:departmentId/aggregated-sections` | `CU-ADM-001` / `HU-33` | **Secciones Consolidadas:** Vista agrupada de todas las secciones del departamento. |
| `GET` | `/api/v1/structures/departments/:departmentId/available-sections` | `CU-ADM-002` / `CU-ADM-004` | **Secciones Disponibles:** Catálogo de secciones no ancladas disponibles para ser asociadas o trasladadas. |
| `POST` | `/api/v1/structures/departments/:departmentId/groups` | `CU-ADM-002` / `HU-34` | **Crear Grupo:** Alta de nuevo grupo comercial en el departamento con validación de nombre único. Body: `{ name: string, displayCode?: string }`. |
| `PUT` | `/api/v1/structures/groups/:groupId` | `CU-ADM-002` / `HU-35` | **Renombrar Grupo (UPDATE):** Modificación del nombre o código de despliegue del grupo comercial. |
| `DELETE` | `/api/v1/structures/groups/:groupId` | `CU-ADM-003` / `HU-36` | **Eliminar Grupo:** Validación de elegibilidad; **bloquea la eliminación** si contiene Sección Ancla o es el único grupo del depto. |
| `PATCH` | `/api/v1/structures/departments/:departmentId/sections/move` | `CU-ADM-004` / `HU-37` | **Mover Secciones entre Grupos (PATCH):** Traslado transaccional parcial de una o varias secciones entre grupos. Body: `{ sectionIds: string[], sourceGroupId: string, targetGroupId: string }`. *(¡Lleva método PATCH por ser modificación parcial de estado!)* |
| `POST` | `/api/v1/structures/groups/:groupId/sections` | `CU-ADM-004` / `HU-38` | **Asignar Sección:** Vincula una sección disponible al grupo comercial. |
| `DELETE` | `/api/v1/structures/groups/:groupId/sections/:sectionId` | `CU-ADM-004` / `HU-39` | **Desasignar Sección:** Desvincula una sección del grupo; bloquea si es Sección Ancla (🔒). |
| `POST` | `/api/v1/structures/departments/:departmentId/publish` | `CU-ADM-004` / `HU-40` | **Publicar Cambios de Estructura:** Aplica formalmente las modificaciones realizadas en la estructura operativa del departamento. |
| `GET` | `/api/v1/structures/compras-pac/tree` | `CU-EST-001` / `DEC-01` | **Árbol Compras y PAC:** Estructura corporativa de Compras (Hardline/Softline) y PAC con exclusión de áreas no comerciales. Query: `?structureType=COMPRAS\|PAC`. |
| `GET` | `/api/v1/structures/config/base-departments` | `DEC-15` / `HU-022` | **Configuración Deptos Base:** Consulta departamentos base de Compras y PAC. |
| `PUT` | `/api/v1/structures/config/base-departments` | `DEC-15` / `HU-022` | **Actualizar Deptos Base (UPDATE):** Guarda la configuración de departamentos base corporativos. |
| `GET` | `/api/v1/structures/suburbia-advisors` | `DEC-16` / `HU-19` | **Asesores Suburbia:** Consulta del nodo 70051507 (Asesor Especializado Experiencia Cliente). |
| `GET` | `/api/v1/structures/collaborators/:id/managed-sections` | `HU-041` | **Secciones que Administra Colaborador:** Consulta de Sección Ancla + secciones heredadas del grupo. |

---

### Feature 4: Planeación Futura, Cierre de Periodo y Concurrencia
* **`CU-ADM-005` (Planeación en Paralelo Mes Actual vs Siguiente):**
  * Conmutador de periodos (*Octubre 2026 Vigente* vs *Noviembre 2026 Planificación*).
  * Tabla comparativa con estados: *Vigente*, *Modificado*, *Nuevo*, *En edición*, traslados de grupo y colaboradores impactados.
* **`CU-ADM-006` (Programación y Cancelación de Publicaciones Futuras):**
  * Modal para programar traslados con fecha de vigencia dentro de una ventana de 6 meses, hora y justificación obligatoria.
  * Registro de auditoría y cancelación de publicaciones pendientes.
* **`CU-ADM-007` (Bloqueo por Cierre de Periodo Operativo):**
  * Modo solo lectura cuando el calendario operativo inicia el cálculo de planes (Día 25).
  * Banner de advertencia, candados en nodos y modal explicativo de periodo bloqueado.
* **`CU-ADM-008` (Control de Versiones y Concurrencia Departamental):**
  * Detección de conflicto 409 si otro usuario modifica el departamento, visualizando versión consultada vs vigente y botón *"Actualizar información"*.

#### 📡 Endpoints Conectados (Feature 4)

| Método HTTP | Endpoint API | Caso de Uso / HU | Descripción, Parámetros y Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/structures/departments/:departmentId/future-draft/init` | `CU-ADM-005` / `HU-42` | **Inicializar Borrador Futuro:** Clona la topología del mes actual para planificar en paralelo el mes siguiente (Mes+1). |
| `GET` | `/api/v1/structures/scheduled-changes` | `CU-ADM-006` / `HU-43` | **Bandeja de Cambios Programados:** Lista de publicaciones programadas pendientes de entrar en vigor por periodo. |
| `POST` | `/api/v1/structures/scheduled-changes` | `CU-ADM-006` / `HU-44` | **Programar Publicación Futura:** Agenda el cambio de estructura con fecha/hora de vigencia (ventana hasta 6 meses) y motivo justificado. |
| `PUT` | `/api/v1/structures/scheduled-changes/:changeId` | `CU-ADM-006` / `HU-45` | **Modificar Cambio Programado (UPDATE):** Modifica la fecha de vigencia o notas de un cambio programado no aplicado. |
| `POST` | `/api/v1/structures/scheduled-changes/:changeId/cancel` | `CU-ADM-006` / `HU-46` | **Cancelar Publicación Programada:** Cancela un cambio programado antes de su fecha de activación. |
| `GET` | `/api/v1/structures/calendar/operational-cutoff` | `CU-ADM-007` / `BR-07` | **Consultar Corte Operativo:** Consulta la fecha/hora de corte operativo semanal/mensual (Día 25 / martes 23:59:59) que bloquea ediciones. |
| `PUT` | `/api/v1/structures/calendar/operational-cutoff` | `CU-ADM-007` / `BR-07` | **Actualizar Corte Operativo (UPDATE):** Modificación administrativa de la ventana de corte operativo. |
| `POST` | `/api/v1/structures/periods/:periodCode/activate` | `CU-ADM-005` / `HU-47` | **Cierre y Activación de Periodo:** Concluye el periodo de planeación y activa oficialmente el nuevo periodo como vigente. |

---

### Feature 5: Módulo de Reportes Oficiales
* **Hub Central de Reportes (`/reports`):**
  * Acceso unificado según permisos de usuario.
* **`CU-EST-002` (Reporte por Rol y Periodo):**
  * Flujo de 3 pasos: Filtros generales (Mes/Año, Negocio, Zona, Departamento) → Selección de columnas en 3 bloques (*Estructura*, *Puestos y Personas*, *Relaciones*) → Vista previa y descarga real en **`.CSV`** y **`.TXT`**.
* **`CU-EST-003` (Reporte General por Rango de Fechas):**
  * Flujo de 3 pasos con validación de fechas (no invertidas y máximo 1 año calendario), selección de columnas autorizadas y exportación condicionada al permiso `REPORT_GENERAL_DOWNLOAD`.

#### 📡 Endpoints Conectados (Feature 5)

| Método HTTP | Endpoint API | Caso de Uso / HU | Descripción, Parámetros y Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/metadata/columns` | `CU-EST-002` / `HU-48` | **Metadatos de Columnas:** Catálogo dinámico de columnas disponibles en 3 bloques (*Estructura*, *Puestos y Personas*, *Relaciones*). |
| `GET` | `/api/v1/reports/role-based` | `CU-EST-002` / `HU-49` | **Reporte por Rol y Periodo:** Generación tabular con filtros de Mes/Año, Negocio, Zona, Tienda y Departamento. |
| `GET` | `/api/v1/reports/general` | `CU-EST-003` / `HU-50` | **Reporte General por Rango de Fechas:** Validación de fechas (máximo 1 año calendario) y extracción consolidada. |
| `GET` | `/api/v1/reports/compensations` | `CU-REP-002` / `HU-51` | **Reporte de Compensaciones:** Generación de información para conciliación de compensaciones y nómina. |
| `GET` | `/api/v1/reports/export/csv` | `CU-EST-002` / `CU-EST-003` | **Exportación a CSV:** Descarga directa del reporte generado en formato `.CSV` con codificación UTF-8 / Latin1. |
| `GET` | `/api/v1/reports/export/txt` | `CU-EST-002` / `CU-EST-003` | **Exportación a TXT:** Descarga directa del reporte en formato `.TXT` delimitado para procesamiento batch. |

---

### Feature 6: Historial de Auditoría y Cargas Iniciales Masivas
* **`CU-HIS-001` (Consulta de Bitácora y Auditoría Transversal):**
  * Filtros por rango *Desde / Hasta*, *Ubicación*, *Tipo de Acción* y *Usuario*.
  * **Panel Lateral de Resumen Estadístico:** Métricas en tiempo real de movimientos, usuarios únicos y acciones registradas.
  * **Descarga en `.CSV`** de toda la bitácora filtrada.
  * **Modal de Detalle del Movimiento:** Ficha completa con usuario, puesto, motivo y comparador visual *Antes vs Después*.
* **`CU-CIN-001` (Cargas Iniciales Masivas):**
  * Botón para descargar la **plantilla oficial vigente `.CSV`**.
  * Zona drag & drop para subir archivos `.CSV` o `.XLSX`.
  * **Motor de conciliación previa:** Detección de filas válidas, advertencias y errores bloqueantes.
  * Modal para aplicar los registros válidos directamente a la estructura comercial activa.

#### 📡 Endpoints Conectados (Feature 6)

| Método HTTP | Endpoint API | Caso de Uso / HU | Descripción, Parámetros y Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/audit/logs` | `CU-HIS-001` / `HU-52` | **Bitácora de Auditoría:** Consulta paginada con filtros por fechas, usuario, tienda y tipo de acción (`AUTH_*`, `STRUCTURE_*`, `ROLE_*`). |
| `GET` | `/api/v1/audit/logs/:eventId` | `CU-HIS-001` / `HU-53` | **Detalle de Evento de Auditoría:** Ficha técnica del movimiento con comparador visual de diff Antes (`before_value`) vs Después (`after_value`). |
| `GET` | `/api/v1/admin/batch-import/layout` | `CU-CIN-001` / `HU-54` | **Descargar Plantilla Oficial:** Descarga el layout oficial vigente `.CSV` / `.XLSX` para la carga masiva de estructuras. |
| `POST` | `/api/v1/admin/batch-import` | `CU-CIN-001` / `HU-55` | **Ejecutar Carga Masiva:** Subida de archivo (multipart/form-data), motor de conciliación previa con conteo de filas válidas, advertencias y errores bloqueantes. |


---

## 📘 Especificación Integral de Contratos DTO y Schemas OpenAPI 3.0

Esta sección documenta formalmente los contratos tipados en **TypeScript** (Request DTOs, Query DTOs, Response DTOs y Errores RFC 9457) que la arquitectura frontend consume del backend integrado ([http://localhost:3000/api/docs](http://localhost:3000/api/docs)). Permite al equipo de frontend copiar y tipar directamente los modelos en `src/types/` o `src/services/api/`.

### 1. Cabeceras Obligatorias y Manejo de Errores Estándar (RFC 9457)

#### Cabeceras HTTP Obligatorias
* `Content-Type: application/json`
* `x-dev-api-key: dev-api-key-zdeptos-2026`: Requerida para autenticación en entorno local.
* `x-session-id: <uuid>`: ID de sesión emitido por `POST /api/v1/auth/sso/callback`.
* `If-Match: "<version>"`: Requerido en mutaciones concurrentes (`PUT /roles/:id`, `PUT /groups/:id`, `DELETE /groups/:id`, `DELETE /groups/:id/sections/:id`).

#### Estructura Estándar de Errores (RFC 9457 & 409 Conflict)
```typescript
export interface ProblemDetailsResponse {
  type: string;        // URI identificador del tipo de error
  title: string;       // Resumen legible del error
  status: number;      // Código HTTP (400, 401, 403, 404, 409, 422, 500)
  detail: string;      // Explicación técnica o de regla de negocio
  instance?: string;   // Endpoint o recurso que originó la falla
  code?: string;       // Código interno (ej. "ANCHOR_SECTION_LOCKED", "DUPLICATE_GROUP_NAME")
  invalidParams?: Array<{ field: string; message: string }>;
}

export interface VersionConflictErrorResponse {
  statusCode: 409;
  error: "Conflict";
  message: string;     // ej. "Conflicto de concurrencia: el departamento ha sido modificado por otro usuario."
  expectedVersion: number;
  currentVersion: number;
}
```

---

### 2. Feature 1: Autenticación SSO y Gestión de Sesiones (`/api/v1/auth/*`)
Archivo DTO backend: `src/modules/auth/presentation/dto/auth.dto.ts`

```typescript
// POST /api/v1/auth/sso/callback
export interface SsoCallbackRequestDto {
  accessToken: string; // Token delegado emitido por MS Entra ID
  idToken?: string;
  sessionId?: string;
}

// Respuesta de sesión (POST /auth/sso/callback, POST /auth/keepalive, GET /auth/session)
export interface AuthenticatedSessionResponseDto {
  ok: boolean;
  sessionId: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED_INACTIVITY";
  expiresAt: string;     // ISO Date: ej. "2026-10-19T18:45:00.000Z"
  idleTimeoutMs: number; // 900000 ms = 15 min de inactividad
  user: {
    id: string;
    oid?: string;
    tid?: string;
    name?: string;       // ej. "César Coronado"
    email?: string;      // ej. "ccoronado@liverpool.com.mx"
    roles: string[];     // ["ROL-001", "ROL-004"]
    permissions: string[]; // ["STRUCTURE_VIEW", "GROUP_CREATE", ...]
    authorizedGroups: string[];
    scopes: string[];    // Tiendas o zonas autorizadas
  };
}

// POST /api/v1/auth/keepalive
export interface KeepAliveRequestDto {
  eventType?: string; // Default: "SESSION_REFRESH"
  sessionId?: string;
}

// POST /api/v1/auth/logout
export interface LogoutRequestDto {
  closeType?: "MANUAL" | "INACTIVITY";
  sessionId?: string;
}

export interface LogoutResponseDto {
  ok: boolean;
  message: string;
  closeType: "MANUAL" | "INACTIVITY";
  sessionId?: string;
  multiTabInvalidated: boolean;
  ssoLogoutUrl?: string; // URL corporativa de cierre en Microsoft Entra ID
}
```

---

### 3. Feature 1: Home, Identidad y Buscador Global (`/api/v1/users/me/*`, `/api/v1/search/*`)
Archivo DTO backend: `src/modules/home-search/presentation/dto/home-search.dto.ts`

```typescript
// GET /api/v1/users/me/profile
export interface UserExceptionSummaryDto {
  exceptionId: string;
  roleCode: string;
  roleName: string;
  validFrom: string;
  validTo: string | null;
  scopes: string[];
}

export interface UserProfileResponseDto {
  userId: string;
  displayName: string;
  greeting: string;        // "Hola, César Coronado"
  avatarInitials: string;  // "CC"
  email: string;
  employeeNumber?: string | null;
  positionTitle?: string | null;
  status: string;
  activeRole: string;      // "Administrador de Plataforma"
  roles: Array<{ code: string; name: string }>;
  activeExceptions: UserExceptionSummaryDto[];
  effectiveScope: {
    isGlobal: boolean;
    scopeSummary: string;
    authorizedLocationIds: string[];
    authorizedLocationNames: string[];
  };
  lastAccessAt: string;
}

// GET /api/v1/users/me/modules
export interface AuthorizedModuleItemDto {
  code: "ESTRUCTURAS" | "ROLES_PERMISOS" | "REPORTES" | "HISTORIAL";
  title: string;    // "Gestión de Estructuras"
  subtitle: string; // "Zona → Sección"
  route: string;    // "/estructuras"
  actions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
    canExport: boolean;
  };
}

export interface UserModulesResponseDto {
  userId: string;
  modules: AuthorizedModuleItemDto[];
  effectivePermissions: string[];
}

// GET /api/v1/search/unified (y buscadores específicos)
export interface GlobalSearchQueryDto {
  q: string;             // Texto de búsqueda (mínimo 1 carácter)
  locationId?: string;   // UUID de tienda opcional
  departmentId?: string; // UUID de departamento opcional
  groupId?: string;      // UUID de grupo opcional
  limit?: number;        // Default: 10 (máx. 50)
}

export interface DepartmentSearchResultDto {
  id: string;
  code: string;
  name: string;
  entityType: "MANAGEMENT" | "DEPARTMENT" | "GROUP";
  locationId: string;
  locationName: string;
  breadcrumb: string;  // "Zona 2 / Liverpool Atizapán / Hardline / Línea Blanca"
  detailRoute: string; // "/estructuras?locationId=...&nodeId=..."
  reportRoute?: string | null;
}

export interface EmployeeSearchResultDto {
  id: string;
  employeeNumber: string;
  fullName: string;
  positionCode: string;
  positionTitle: string;
  locationId: string;
  locationName: string;
  departmentId: string;
  departmentName: string;
  groupName?: string | null;
  anchorSection?: string | null;
  status: string;
  breadcrumb: string;
}

export interface SectionSearchResultDto {
  id: string;
  code: string;
  name: string;
  locationId: string;
  locationName: string;
  departmentId?: string | null;
  departmentName?: string | null;
  groupName?: string | null;
  assignmentStatus: "ASIGNADA" | "DISPONIBLE";
  isAnchor: boolean;   // true: Sección Ancla fija 🔒
  breadcrumb: string;
}

export interface GlobalSearchUnifiedResponseDto {
  query: string;
  total: number;
  scopeContext: string;
  message?: string;
  departments: DepartmentSearchResultDto[];
  employees: EmployeeSearchResultDto[];
  sections: SectionSearchResultDto[];
}
```

---

### 4. Feature 2: Gestión de Roles, Permisos y Segmentación (`/api/v1/roles/*`)
Archivo DTO backend: `src/modules/roles/presentation/dto/roles.dto.ts`

```typescript
// GET /api/v1/roles
export interface SearchRolesQuery {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;     // 0-indexed, default: 0
  pageSize?: number; // default: 20
  sort?: string;     // "name,asc", "code,desc", "updatedAt,desc"
}

// POST /api/v1/roles
export interface CreateRoleRequest {
  name: string;
  description: string;
  permissionCodes: string[];
}

// PUT /api/v1/roles/:roleId
export interface UpdateRoleRequest extends CreateRoleRequest {
  version: number; // Concurrencia optimista
}

// DELETE /api/v1/roles/:roleId
export interface DeleteRoleRequest {
  reason: string;
  version: number;
}

// POST /api/v1/roles/:roleId/clone (HU-009 / CU-SEC-002 FA-03)
export interface CloneRoleRequest {
  name: string;
  description?: string;
  additionalPermissionCodes?: string[];
  excludedPermissionCodes?: string[];
}

// GET & PUT /api/v1/roles/:roleId/segmentation (HU-55 / RN-054)
export type SegmentationAttribute =
  | "JOB_POSITION"
  | "LOCATION"
  | "ZONE"
  | "DEPARTMENT"
  | "JOB_LEVEL"
  | "FUNCTION"
  | "BUSINESS_DIVISION"
  | "USER_EMAIL";

export type SegmentationOperator = "EQUALS" | "IN" | "CONTAINS";

export interface SegmentationRuleItemDto {
  attribute: SegmentationAttribute;
  operator: SegmentationOperator;
  values: string[];
}

export interface UpdateRoleSegmentationRequest {
  rules: SegmentationRuleItemDto[];
  scopeLevel: "GLOBAL" | "DIVISION" | "ZONE" | "LOCATION" | "DEPARTMENT" | "GROUP";
}
```

---

### 5. Feature 2: Asignaciones de Roles, Excepciones y Alcance (`/api/v1/*`)
Archivo DTO backend: `src/modules/access-management/dto.ts`

```typescript
export interface ScopeSelectionDto {
  accessScopeId: string;        // UUID de Tienda, Zona o Departamento
  includeDescendants?: boolean; // Default: true
}

// POST /api/v1/role-assignments
export interface CreateAssignmentDto {
  userId: string;
  roleId: string;
  origin: "GROUP_MAPPING" | "RULE_BASED" | "MANUAL";
  scopes: ScopeSelectionDto[];
  validFrom: string;
  validTo?: string | null;
  notes?: string | null;
}

// PUT /api/v1/role-assignments/:assignmentId
export interface UpdateAssignmentDto {
  scopes: ScopeSelectionDto[];
  validFrom: string;
  validTo?: string | null;
  notes?: string | null;
  version: number;
}

// POST /api/v1/role-exceptions
export interface CreateExceptionDto {
  userId: string;
  roleId: string;
  scopes: ScopeSelectionDto[];
  validFrom: string;
  validTo: string;       // Requerido en excepciones
  justification: string; // Mínimo 10 caracteres
  ticketReference?: string | null;
}

// POST /api/v1/role-exceptions/bulk (HU-017 / CU-SEC-006 FA-05)
export interface BulkCreateExceptionDto {
  userIds: string[];     // Múltiples colaboradores en lote
  roleId: string;
  scopes: ScopeSelectionDto[];
  validFrom: string;
  validTo: string;
  justification: string;
  ticketReference?: string | null;
}

// POST /api/v1/role-assignments/:id/revoke o /role-exceptions/:id/revoke
export interface RevokeDto {
  reason: string;
  version: number;
}
```

---

### 6. Feature 3: Geografía Comercial y Filtros en Cascada (`/api/v1/geography/*`)
Archivo DTO backend: `src/modules/geography/dto/geography-response.dto.ts`

```typescript
// GET /api/v1/geography/zones
export interface CommercialZoneResponseDto {
  id: string;   // UUID
  code: string; // "ZONA-CENTRO"
  name: string; // "Metro Centro"
}

// GET /api/v1/geography/zones/:zoneId/locations
export interface CommercialLocationResponseDto {
  id: string;   // UUID
  code: string; // "LOC-001"
  name: string; // "Liverpool Demo Insurgentes"
}
```

---

### 7. Feature 3: Estructuras Comerciales, Árbol y Grupos P-02 (`/api/v1/structures/*`)
Archivos DTO backend: `src/modules/structures/presentation/dto/`

```typescript
// GET /api/v1/structures/tree?locationId=...&period=... (CU-EST-001)
export interface SectionResponseDto {
  id: string;
  code: string;
  name: string;
  assignmentOrigin: "ANCHOR" | "MANUAL" | "INITIAL_LOAD" | "SCHEDULED";
  isAnchor: boolean; // Bandera de Sección Ancla fija 🔒
}

export interface GroupCollaboratorDto {
  employeeId: string;
  assignmentIdExternal: string;
  fullName: string;
  positionId: string;
  positionTitle: string;
  anchorSectionId: string;
  anchorSectionCode: string;
  anchorSectionName: string;
}

export interface CommercialGroupResponseDto {
  id: string;
  sequenceNumber: number;
  displayCode: string; // "Grupo 001", "Grupo 002" (Autonumeración atómica P-02)
  name: string;
  sections: SectionResponseDto[];
  collaborators: GroupCollaboratorDto[];
}

export interface NodeLeaderDto {
  employeeId?: string | null;
  name: string;
  positionTitle: string;
  avatarUrl?: string | null;
  isVacant: boolean;
}

export interface TreeNodeResponseDto {
  id: string;
  externalCode: string | null;
  displayName: string;
  levelType: "LOCATION" | "MANAGEMENT" | "DEPARTMENT" | "GROUP" | "SECTION";
  depth: number;
  parentId: string | null;
  leader?: NodeLeaderDto | null;
  leaders?: NodeLeaderDto[];
  departmentVersion?: number | null; // Token de versión para If-Match
  aggregatedSectionsCount?: number;
  isReadOnly?: boolean;
  periodCode?: string;
  periodStatus?: string;
  groups?: CommercialGroupResponseDto[];
  children: TreeNodeResponseDto[];
}

// POST /api/v1/structures/departments/:departmentId/groups
export interface CreateGroupDto {
  name: string; // ej. "Grupo Belleza 1"
}

export interface CommercialGroupCreatedResponseDto {
  id: string;
  businessStructureId: string;
  departmentNodeId: string;
  sequenceNumber: number;
  displayCode: string; // "Grupo 003"
  name: string;
  effectiveStart: string;
  effectiveEnd: string | null;
  status: string;
  version: string;
  createdBy: string | null;
  createdAt: string;
}

// PUT /api/v1/structures/groups/:groupId
export interface UpdateGroupNameDto {
  name: string;
}

// PATCH /api/v1/structures/departments/:departmentId/sections/move (Drag & Drop)
// Regla RN-030: Rechaza el movimiento con 422 si la sección es Sección Ancla (🔒)
export interface MoveSectionDto {
  sectionId: string;     // UUID de sección (virtual)
  targetGroupId: string; // UUID del grupo destino
}

export interface MoveSectionResponseDto {
  message: string;
  sectionId: string;
  newGroupId: string;
}

// POST /api/v1/structures/groups/:groupId/sections
export interface AssignSectionDto {
  sectionId: string;
}

export interface AssignSectionResponseDto {
  message: string;
  assignmentId: string;
  groupId: string;
  sectionId: string;
  sectionCode: string;
  assignmentOrigin: string;
  newDepartmentVersion: number;
}

// POST /api/v1/structures/departments/:departmentId/publish
export interface PublishDepartmentDto {
  period?: string; // YYYY-MM
  notes?: string;
}

export interface PublishDepartmentResponseDto {
  message: string;
  departmentId: string;
  periodCode: string;
  version: number;
  publishedAt: string;
  totalGroups: number;
  totalSections: number;
}
```

---

### 8. Feature 4: Planeación Futura, Cambios Programados y Corte (`/api/v1/structures/*`)
Archivo DTO backend: `src/modules/structures/presentation/dto/structures-planning.dto.ts`

```typescript
// GET & PUT /api/v1/structures/calendar/operational-cutoff (CU-ADM-007)
export interface OperationalCutoffResponseDto {
  periodCode: string;     // "2026-10"
  status: "OPEN" | "HISTORICAL" | "CLOSED";
  editingStart: string;
  editingEnd: string;
  isEditable: boolean;
  daysRemaining: number;
  cutoffDate: string;     // "2026-10-01"
}

// POST /api/v1/structures/scheduled-changes (CU-ADM-006)
export interface CreateScheduledChangeDto {
  departmentId: string;
  effectiveDate: string;  // Ventana: hasta 6 meses futuros
  changeType: "SECTION_MOVE" | "GROUP_CREATE" | "GROUP_INACTIVATE";
  payload: Record<string, unknown>;
  justification: string;
}
```

---

### 9. Feature 5: Reportes Dinámicos y Exportación CSV / TXT (`/api/v1/reports/*`)
Archivo DTO backend: `src/modules/reports/presentation/dto/report-query.dto.ts`

```typescript
// GET /api/v1/reports/role-based
export interface ReportRoleBasedQueryDto {
  startDate?: string;    // YYYY-MM-DD
  endDate?: string;      // YYYY-MM-DD
  period?: string;       // YYYY-MM
  zoneId?: string;
  locationId?: string;
  managementId?: string;
  departmentId?: string;
  groupId?: string;
  employeeId?: string;
  positionId?: string;
  columns?: string;      // "location,department,group,sectionName"
  selectAll?: boolean;
  page?: number;         // Default: 1
  limit?: number;        // Default: 50, máx: 200
}

// GET /api/v1/reports/general
export interface ReportGeneralQueryDto extends ReportRoleBasedQueryDto {
  division?: "LIVERPOOL" | "SUBURBIA" | "COMPRAS" | "PAC";
}

// GET /api/v1/reports/export/csv y /export/txt
export interface ReportExportQueryDto {
  reportType: "ROLE_BASED" | "GENERAL" | "COMPENSATIONS";
  period?: string;
  startDate?: string;
  endDate?: string;
  locationId?: string;
  departmentId?: string;
  columns?: string;
  variant?: string;
  division?: "LIVERPOOL" | "SUBURBIA" | "COMPRAS" | "PAC";
}
```

---

### 10. Feature 6: Historial y Auditoría Transversal (`/api/v1/audit/*`)
Archivo DTO backend: `src/modules/audit/presentation/dto/`

```typescript
// GET /api/v1/audit/logs
export interface AuditLogsQueryDto {
  startDate?: string;
  endDate?: string;
  locationId?: string;
  action?: string;       // "SECTION_MOVED", "GROUP_CREATED", etc.
  entityType?: string;   // "GROUP", "SECTION", "DEPARTMENT", "ROLE"
  actorUserId?: string;
  userSearch?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogItemDto {
  eventId: string;
  timestamp: string;
  actor: {
    userId: string;
    userName: string;
    email: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  locationName?: string;
  departmentName?: string;
  correlationId?: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  diffSummary?: string;
}

export interface PaginatedAuditLogsResponseDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  items: AuditLogItemDto[];
}
```

---

### 11. Feature 6: Cargas Masivas Iniciales (`/api/v1/admin/batch-import/*`)
Archivo DTO backend: `src/modules/batch-import/presentation/dto/batch-import.dto.ts`

```typescript
// POST /api/v1/admin/batch-import (CU-CIN-001)
export interface BatchImportRowDto {
  locationCode: string;
  parentDepartmentCode: string;
  groupName: string;
  groupCode?: string;
  sectionCode: string;
  assignmentOrigin: "INITIAL_LOAD" | "ANCHOR";
}

export interface BatchImportDto {
  fileName: string;
  dryRun: boolean;      // true: validación previa; false: persistencia en BD
  period: string;       // YYYY-MM
  rows: BatchImportRowDto[];
}

export interface BatchImportValidationErrorDto {
  rowNumber: number;
  field: string;
  value?: unknown;
  message: string;
}

export interface BatchImportResultDto {
  success: boolean;
  dryRun: boolean;
  period: string;
  validRowsCount: number;
  invalidRowsCount: number;
  processedGroupsCount: number;
  processedAssignmentsCount: number;
  errors: BatchImportValidationErrorDto[];
  summary: string;
}
```

---

### 12. Sistema y Monitoreo (Health Check) (`/api/v1/health`)

```typescript
// GET /api/v1/health
export interface HealthResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  uptime: number;
  database: "connected" | "disconnected";
}
```

---

## 👤 Perfiles de Prueba y Roles del Sistema

Para validar visualmente todos los flujos y alcances en pantalla, la página de **Inicio (`/`)** cuenta con un conmutador rápido de perfiles:

| Perfil de Prueba | Usuario | Rol Asignado | Módulos Autorizados |
| :--- | :--- | :--- | :--- |
| **Admin Seguridad** | `aocampo` | Administrador de Plataforma | Inicio, Estructuras, Roles y permisos, Reportes, Historial, Cargas Iniciales |
| **Gestor Ubicación** | `aramirez` | Gestor de Estructura Comercial | Inicio, Estructuras (Operaciones y Corporativo), Reportes |
| **Usuario Reportes** | `cruiz` | Analista de Información Comercial | Inicio, Reportes (Solo lectura y previsualización) |
| **Excepción Activa** | `atorres` | Colaborador con Asignación Temporal | Inicio, Estructuras con alcance asignado por excepción en Perisur |

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js**: v18.0.0 o superior (recomendado Node 20+ LTS).
- **npm**: v9.0.0 o superior.

### Instalación paso a paso

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Alger125/front-end-LiverPool-Completo.git
   cd front-end-LiverPool-Completo
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre tu navegador en: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Scripts Disponibles y Testing

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo Vite con HMR |
| `npm run build` | Compila la aplicación para producción con TypeScript (`tsc -b && vite build`) |
| `npm run preview` | Previsualiza localmente el build de producción generado en `dist/` |
| `npx vitest run` | Ejecuta las suites de pruebas unitarias y de integración |

### Ejecución de Suites de Integración de las Features
```bash
# Ejecutar todas las suites de features de negocio:
npx vitest run src/features/authentication/tests/feature1-auth-home-search.test.tsx \
               src/features/access-management/roles/tests/feature2-roles-permissions-exceptions.test.tsx \
               src/features/gestion-estructuras/tests/feature3-estructuras-grupos.test.tsx \
               src/features/reports/tests/feature4-5-6-planning-reports-history.test.tsx
```

---

## 🗺 Mapa de Rutas de la Aplicación

| Ruta | Componente | Caso de Uso | Módulo |
| :--- | :--- | :--- | :--- |
| `/login` | `LoginPage` | `CU-SEC-001` | Autenticación SSO |
| `/logout-success` | `SessionEndedPage` | `CU-SEC-007` | Cierre de Sesión |
| `/session-expired` | `SessionEndedPage` | `CU-SEC-007` | Expiración de Sesión |
| `/` | `HomePage` | `CU-HOM-001`, `CU-HOM-002` | Inicio y Bienvenida |
| `/search` | `GlobalSearchPage` | `CU-HOM-003` | Buscador Global |
| `/roles` | `RoleListPage` | `CU-SEC-004` | Catálogo de Roles |
| `/roles/create` | `CreateRolePage` | `CU-SEC-002` | Crear Rol |
| `/roles/:roleId` | `RoleDetailPage` | `CU-SEC-002` | Detalle de Rol |
| `/roles/:roleId/edit` | `EditRolePage` | `CU-SEC-005` | Editar Rol |
| `/access-management/exceptions` | `RoleExceptionsPage` | `CU-SEC-006` | Asignación por Excepción |
| `/structures` | `GestionEstructurasHome` | `CU-EST-001` | Hub de Estructuras |
| `/structures/operations` | `OperacionesPage` | `CU-EST-001` | Estructura Operaciones |
| `/structures/corporate` | `CorporativoPage` | `CU-EST-001` | Estructura Corporativo |
| `/structures/operations/departments/:id/groups` | `DepartmentGroupsPage` | `CU-ADM-001` a `CU-ADM-004` | Administración de Grupos |
| `/structures/planning` | `FuturePlanningPage` | `CU-ADM-005` a `CU-ADM-008` | Planeación Futura |
| `/reports` | `ReportsHubPage` | `CU-EST-002`, `CU-EST-003` | Hub y Wizards de Reportes |
| `/history` | `HistoryPage` | `CU-HIS-001` | Historial y Auditoría |
| `/initial-loads` | `InitialLoadsPage` | `CU-CIN-001` | Cargas Iniciales Masivas |

---

*Desarrollado para El Puerto de Liverpool · Sistema de Gestión de Estructuras Comerciales (ZDeptos).*
