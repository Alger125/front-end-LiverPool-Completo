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
5. [Perfiles de Prueba y Roles del Sistema](#perfiles-de-prueba-y-roles-del-sistema)
6. [Guía de Instalación y Ejecución Local](#guía-de-instalación-y-ejecución-local)
7. [Scripts Disponibles y Testing](#scripts-disponibles-y-testing)
8. [Mapa de Rutas de la Aplicación](#mapa-de-rutas-de-la-aplicación)

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

## 📖 Mapeo de Casos de Uso y Funcionalidades

### Feature 1: Autenticación SSO, Layout, Home y Buscador Global
* **`CU-SEC-001` (Login SSO Corporativo):**
  * Pantalla split morada/blanca con credenciales simuladas, badge de *"Conexión Segura"* y control de errores excepcionales (FE-01 a FE-07).
* **`CU-SEC-007` (Cierre de Sesión Seguro y Expiración):**
  * Dropdown de usuario en el header con avatar y rol, modal de confirmación, detección de cambios pendientes sin guardar, pantalla de *"Sesión finalizada"* y *"Su sesión ha expirado"*, sincronización multi-pestaña.
* **`CU-HOM-001` & `CU-HOM-002` (Home y Gobernanza de Módulos):**
  * Saludo personalizado (*"Hola, [Nombre]"*), contexto de sesión (perfil activo, colaborador, ubicación, alcance, excepción vigente) y tarjetas modulares dinámicas autorizadas según permisos efectivos.
* **`CU-HOM-003` (Buscador Global con Alcance):**
  * Barra con lupa en header y vista `/search` con búsqueda reactiva en tiempo real sobre departamentos, grupos, secciones y colaboradores acotados al alcance del usuario.

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

---

### Feature 5: Módulo de Reportes Oficiales
* **Hub Central de Reportes (`/reports`):**
  * Acceso unificado según permisos de usuario.
* **`CU-EST-002` (Reporte por Rol y Periodo):**
  * Flujo de 3 pasos: Filtros generales (Mes/Año, Negocio, Zona, Departamento) → Selección de columnas en 3 bloques (*Estructura*, *Puestos y Personas*, *Relaciones*) → Vista previa y descarga real en **`.CSV`** y **`.TXT`**.
* **`CU-EST-003` (Reporte General por Rango de Fechas):**
  * Flujo de 3 pasos con validación de fechas (no invertidas y máximo 1 año calendario), selección de columnas autorizadas y exportación condicionada al permiso `REPORT_GENERAL_DOWNLOAD`.

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
