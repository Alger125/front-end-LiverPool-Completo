# Frontend basado en las pantallas de casos de uso

La referencia visual es el documento `Casos_de_Uso_Gestion_Estructuras_Comerciales_v1_0.docx` proporcionado para esta tarea. Contiene 57 imágenes, incluidas variantes de pantallas y marcas. No incluye un enlace al archivo de Figma ni sus componentes, fuentes o medidas originales. La implementación aproxima esas capturas y conserva los datos y contratos del frontend existente; no es una certificación de coincidencia píxel a píxel.

## Pantallas y recorridos

| Área | Referencias del documento | Implementación |
| --- | --- | --- |
| Acceso y sesión | Imágenes 3, 15, 35, 40, 42, 51, 56 | Panel de acceso morado, tarjeta SSO y estados de cierre y expiración. |
| Inicio y búsqueda | Imágenes 29, 32, 38, 43 | Tres tarjetas por permiso efectivo, encabezado, navegación y buscador. Historial sigue disponible en el menú. |
| Roles | Imágenes 5, 8, 9, 11, 17, 22, 46 | Catálogo de cinco columnas, alta en dos pasos, resumen, permisos, condiciones, edición, baja y excepciones. El ID real se genera al guardar. |
| Estructuras | Imágenes 1, 20, 37, 39, 41, 47, 52 | Organigrama por ubicación, selección de niveles, responsables, contadores y acceso a grupos. Se conserva la vista de tabla y sus filtros e historial. |
| Grupos y secciones | Imágenes 6, 7, 18, 21, 23, 28, 31, 36, 44, 45, 54 | Tabla de administración, editor de tres columnas, movimientos y confirmaciones de impacto y anclas. |
| Planeación | Imágenes 4, 10, 19, 24, 25, 26, 33, 49, 50 | Comparación de periodos en paralelo, cambios pendientes, publicaciones y calendario mensual. |
| Reportes | Imágenes 12, 13, 14, 27, 30, 48, 55 | Dos tarjetas de entrada, filtros, selección por bloques, vista previa y exportación CSV/TXT. |
| Historial | Imágenes 2, 16, 57 | Tabla, filtros, resumen, detalle antes/después y estado vacío. |

Las pantallas usan el catálogo de permisos, entidades y datos de muestra existentes, por lo que los nombres y cantidades pueden diferir de las capturas. Los colores, jerarquía, paneles, navegación y formas siguen la referencia. La adaptación móvil utiliza menús desplegables y desplazamiento dentro de tablas y organigramas.

## Ejecutar

```bash
npm ci
npm run dev
```

`postinstall` genera el worker MSW que necesita la vista de desarrollo. Está ignorado por Git por ser un archivo generado. `VITE_USE_MOCKS=true` usa los datos de muestra durante desarrollo; `VITE_USE_MOCKS=false` permite usar la API configurada. Las integraciones de producción y los endpoints existentes no se modifican.

Los controles de simulación se activan con `VITE_SHOW_DEMO_CONTROLS=true`. Por defecto se ocultan en la interfaz; los tests unitarios los mantienen habilitados para validar escenarios excepcionales.

El acceso SSO y las funciones que ya operaban con fixtures o estado local conservan ese comportamiento de demostración. Este cambio no implementa identidad corporativa, autorización de servidor, publicación automática, persistencia remota, auditoría central ni sincronización con Employee Central. La comparación y el calendario usan el periodo de muestra octubre/noviembre de 2026. El guardado del panel de cambios pendientes es un estado de la sesión de demostración.

## Verificación

```bash
npm run build
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

La suite de navegador cubre las tres tarjetas, los dos pasos de alta y el guardado por la API simulada, el organigrama y la vista de tabla, grupos y restricciones de baja, descarga CSV, detalle y vacío de historial, calendario de 31/30 días y adaptación móvil a 390 px. La suite existente sigue cubriendo edición y eliminación de roles, excepciones, movimiento de secciones y validaciones de reportes.

No se incluyó el documento funcional ni sus capturas en el repositorio público.
