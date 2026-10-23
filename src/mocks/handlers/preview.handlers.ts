import { http, HttpResponse } from 'msw';

/** Browser preview only: pages retain their existing local fixtures without a running API. */
export const previewHandlers = [
  http.get('*/api/v1/users/me/profile', () => HttpResponse.json(null)),
  http.get('*/api/v1/users/me/modules', () => HttpResponse.json([])),
  http.get('*/api/v1/geography/zones', () => HttpResponse.json([])),
  http.get('*/api/v1/structures/tree', () => HttpResponse.json([])),
  http.get('*/api/v1/structures/compras-pac/tree', () => HttpResponse.json([])),
  http.get('*/api/v1/structures/departments/:id/groups', () => HttpResponse.json([])),
];
