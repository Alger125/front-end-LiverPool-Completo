import { delay, http, HttpResponse } from "msw";

import groupedPermissions from "./fixtures/permissions-grouped.json";
import permissions from "./fixtures/permissions.json";
import notFoundProblem from "./fixtures/problem-not-found.json";
import protectedRoleProblem from "./fixtures/problem-protected-role.json";
import validationProblem from "./fixtures/problem-validation.json";
import versionConflictProblem from "./fixtures/problem-version-conflict.json";
import protectedRoleImpact from "./fixtures/role-impact-protected.json";
import roleImpact from "./fixtures/role-impact.json";
import roleDetail from "./fixtures/role-detail.json";
import rolesPage from "./fixtures/roles-page.json";
import { problemResponse } from "./problem-details";

const configuredApiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? "/api/v1"
)
  .trim()
  .replace(/\/+$/, "");

const API_BASE_PATH = (
  configuredApiBaseUrl || "/api/v1"
).startsWith("http")
  ? new URL(configuredApiBaseUrl).pathname.replace(/\/+$/, "")
  : `/${(configuredApiBaseUrl || "/api/v1").replace(/^\/+/, "")}`;

const ROLES_URL = `*${API_BASE_PATH}/roles`;
const PERMISSIONS_URL = `*${API_BASE_PATH}/permissions`;
const GROUPED_PERMISSIONS_URL = `${API_BASE_PATH}/permissions/grouped`;

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT = "name,asc";
const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE_SIZE = 100;

const ROLE_ID =
  "3d377584-c0c5-4391-b4f9-b11ae93f4bfd";

const PROTECTED_ROLE_ID =
  "06d6ef42-5fd5-4a85-8e9a-09c19a64185c";

const ROLE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "DELETED",
] as const;

const SORTABLE_FIELDS = [
  "code",
  "name",
  "status",
  "updatedAt",
] as const;

const SORT_DIRECTIONS = [
  "asc",
  "desc",
] as const;

type RoleStatus =
  (typeof ROLE_STATUSES)[number];

type SortField =
  (typeof SORTABLE_FIELDS)[number];

type SortDirection =
  (typeof SORT_DIRECTIONS)[number];

type RoleSummary =
  (typeof rolesPage.items)[number];

type RoleDetail =
  typeof roleDetail;

type Permission =
  (typeof permissions)[number];

type CreateRoleRequest = {
  name?: string;
  description?: string;
  permissionCodes?: string[];
};

type UpdateRoleRequest =
  CreateRoleRequest & {
    version?: number;
  };

type DeleteRoleRequest = {
  reason?: string;
  version?: number;
};

type RoleListQuery = {
  search: string;
  status?: RoleStatus;
  page: number;
  pageSize: number;
  sortField: SortField;
  sortDirection: SortDirection;
};

type ProblemResponse =
  ReturnType<typeof problemResponse>;

type QueryValidationResult =
  | {
      success: true;
      query: RoleListQuery;
    }
  | {
      success: false;
      response: ProblemResponse;
    };

let roles: RoleSummary[] =
  structuredClone(rolesPage.items);

let details = new Map<string, RoleDetail>([
  [ROLE_ID, structuredClone(roleDetail)],
]);

function toRoleSummary(
  role: RoleDetail,
): RoleSummary {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description,
    status: role.status,
    protected: role.protected,
    permissionCount: role.permissionCount,
    version: role.version,
    updatedAt: role.updatedAt,
  };
}

function isRoleStatus(
  value: string,
): value is RoleStatus {
  return ROLE_STATUSES.includes(
    value as RoleStatus,
  );
}

function isSortField(
  value: string,
): value is SortField {
  return SORTABLE_FIELDS.includes(
    value as SortField,
  );
}

function isSortDirection(
  value: string,
): value is SortDirection {
  return SORT_DIRECTIONS.includes(
    value as SortDirection,
  );
}

function parseInteger(
  value: string | null,
  fallback: number,
): number | null {
  if (value === null) {
    return fallback;
  }

  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    return null;
  }

  return parsed;
}

function invalidQueryResponse(
  detail: string,
  field?: string,
): ProblemResponse {
  return problemResponse(400, {
    title: "Solicitud inválida",
    code: "INVALID_QUERY",
    detail,
    errors: field
      ? [
          {
            field,
            message: detail,
          },
        ]
      : undefined,
  });
}

function parseRoleListQuery(
  request: Request,
): QueryValidationResult {
  const url = new URL(request.url);

  const search =
    (
      url.searchParams.get("search") ??
      ""
    ).trim();

  const rawStatus =
    url.searchParams.get("status");

  const rawPage =
    url.searchParams.get("page");

  const rawPageSize =
    url.searchParams.get("pageSize");

  const rawSort =
    url.searchParams.get("sort") ??
    DEFAULT_SORT;

  if (
    search.length >
    MAX_SEARCH_LENGTH
  ) {
    return {
      success: false,
      response: invalidQueryResponse(
        `La búsqueda no puede exceder ${MAX_SEARCH_LENGTH} caracteres.`,
        "search",
      ),
    };
  }

  if (
    rawStatus !== null &&
    !isRoleStatus(rawStatus)
  ) {
    return {
      success: false,
      response: invalidQueryResponse(
        "El estado debe ser ACTIVE, INACTIVE o DELETED.",
        "status",
      ),
    };
  }

  const page = parseInteger(
    rawPage,
    DEFAULT_PAGE,
  );

  if (
    page === null ||
    page < 0
  ) {
    return {
      success: false,
      response: invalidQueryResponse(
        "La página debe ser un número entero mayor o igual que cero.",
        "page",
      ),
    };
  }

  const pageSize = parseInteger(
    rawPageSize,
    DEFAULT_PAGE_SIZE,
  );

  if (
    pageSize === null ||
    pageSize < 1 ||
    pageSize > MAX_PAGE_SIZE
  ) {
    return {
      success: false,
      response: invalidQueryResponse(
        `El tamaño de página debe estar entre 1 y ${MAX_PAGE_SIZE}.`,
        "pageSize",
      ),
    };
  }

  const sortParts = rawSort
    .split(",")
    .map((part) => part.trim());

  if (sortParts.length !== 2) {
    return {
      success: false,
      response: invalidQueryResponse(
        'El orden debe usar el formato "campo,dirección".',
        "sort",
      ),
    };
  }

  const [
    sortField,
    sortDirection,
  ] = sortParts;

  if (!isSortField(sortField)) {
    return {
      success: false,
      response: invalidQueryResponse(
        "El campo de orden debe ser code, name, status o updatedAt.",
        "sort",
      ),
    };
  }

  if (
    !isSortDirection(sortDirection)
  ) {
    return {
      success: false,
      response: invalidQueryResponse(
        "La dirección de orden debe ser asc o desc.",
        "sort",
      ),
    };
  }

  return {
    success: true,
    query: {
      search:
        search.toLocaleLowerCase(
          "es-MX",
        ),
      status:
        rawStatus ?? undefined,
      page,
      pageSize,
      sortField,
      sortDirection,
    },
  };
}

function filterRoles(
  items: RoleSummary[],
  query: RoleListQuery,
): RoleSummary[] {
  return items.filter((role) => {
    const matchesStatus =
      query.status === undefined ||
      role.status === query.status;

    const matchesSearch =
      query.search.length === 0 ||
      [
        role.code,
        role.name,
        role.description ?? "",
      ].some((value) =>
        value
          .toLocaleLowerCase("es-MX")
          .includes(query.search),
      );

    return (
      matchesStatus &&
      matchesSearch
    );
  });
}

function sortRoles(
  items: RoleSummary[],
  field: SortField,
  direction: SortDirection,
): RoleSummary[] {
  const multiplier =
    direction === "desc"
      ? -1
      : 1;

  return [...items].sort(
    (left, right) => {
      if (field === "updatedAt") {
        const leftTimestamp =
          Date.parse(left.updatedAt);

        const rightTimestamp =
          Date.parse(right.updatedAt);

        return (
          (
            leftTimestamp -
            rightTimestamp
          ) * multiplier
        );
      }

      return (
        left[field].localeCompare(
          right[field],
          "es-MX",
          {
            numeric: true,
            sensitivity: "base",
          },
        ) * multiplier
      );
    },
  );
}

function buildRolePageResponse(
  request: Request,
) {
  const parsed =
    parseRoleListQuery(request);

  if (!parsed.success) {
    return parsed.response;
  }

  const filtered = filterRoles(
    roles,
    parsed.query,
  );

  const sorted = sortRoles(
    filtered,
    parsed.query.sortField,
    parsed.query.sortDirection,
  );

  const start =
    parsed.query.page *
    parsed.query.pageSize;

  const totalPages =
    filtered.length === 0
      ? 0
      : Math.ceil(
          filtered.length /
            parsed.query.pageSize,
        );

  return HttpResponse.json({
    items: sorted.slice(
      start,
      start +
        parsed.query.pageSize,
    ),
    page: parsed.query.page,
    pageSize:
      parsed.query.pageSize,
    totalItems: filtered.length,
    totalPages,
  });
}

function findSelectedPermissions(
  permissionCodes:
    | string[]
    | undefined,
): Permission[] {
  if (!permissionCodes) {
    return [];
  }

  const requestedCodes =
    new Set(permissionCodes);

  return permissions.filter(
    (permission) =>
      requestedCodes.has(
        permission.code,
      ),
  );
}

function createRoleCode(
  name: string,
): string {
  return name
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^A-Z0-9]+/g,
      "_",
    )
    .replace(
      /^_+|_+$/g,
      "",
    );
}

function hasDuplicateRoleName(
  name: string,
  excludedRoleId?: string,
): boolean {
  const normalizedName = name
    .trim()
    .toLocaleLowerCase("es-MX");

  return roles.some(
    (role) =>
      role.id !== excludedRoleId &&
      role.status !== "DELETED" &&
      role.name
        .trim()
        .toLocaleLowerCase(
          "es-MX",
        ) === normalizedName,
  );
}

async function readOptionalJson<T>(
  request: Request,
): Promise<T | undefined> {
  const contentLength =
    request.headers.get(
      "content-length",
    );

  if (contentLength === "0") {
    return undefined;
  }

  const text =
    await request.text();

  if (!text.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}

function validateRoleBody(
  body:
    | CreateRoleRequest
    | undefined,
): ProblemResponse | null {
  if (
    !body?.name ||
    body.name.trim().length < 3
  ) {
    return problemResponse(400, {
      ...validationProblem,
      detail:
        "El nombre del rol debe tener al menos 3 caracteres.",
      errors: [
        {
          field: "name",
          message:
            "El nombre del rol debe tener al menos 3 caracteres.",
          rejectedValue:
            body?.name,
        },
      ],
    });
  }

  if (
    !body.permissionCodes
      ?.length
  ) {
    return problemResponse(400, {
      ...validationProblem,
      detail:
        "Selecciona al menos un permiso.",
      errors: [
        {
          field:
            "permissionCodes",
          message:
            "Selecciona al menos un permiso.",
          rejectedValue:
            body.permissionCodes,
        },
      ],
    });
  }

  if (
    new Set(
      body.permissionCodes,
    ).size !==
    body.permissionCodes.length
  ) {
    return problemResponse(400, {
      ...validationProblem,
      detail:
        "La selección contiene permisos duplicados.",
      errors: [
        {
          field:
            "permissionCodes",
          message:
            "La selección contiene permisos duplicados.",
          rejectedValue:
            body.permissionCodes,
        },
      ],
    });
  }

  return null;
}

export function resetRolesMockState(): void {
  roles = structuredClone(
    rolesPage.items,
  );

  details = new Map([
    [
      ROLE_ID,
      structuredClone(roleDetail),
    ],
  ]);
}

const listRolesHandler = http.get(
  ROLES_URL,
  async ({ request }) => {
    await delay(250);

    return buildRolePageResponse(
      request,
    );
  },
);

const getRoleDetailHandler =
  http.get(
    `${ROLES_URL}/:roleId`,
    async ({ params }) => {
      await delay(180);

      const roleId = String(
        params.roleId,
      );

      const detail =
        details.get(roleId);

      const summary = roles.find(
        (role) =>
          role.id === roleId,
      );

      if (detail) {
        return HttpResponse.json(
          detail,
        );
      }

      if (summary) {
        const defaultCodes =
          summary.code === "SYSTEM_ADMIN"
            ? permissions.map((p) => p.code)
            : summary.code === "STRUCTURE_EDITOR"
              ? ["GROUP_VIEW", "GROUP_UPDATE", "SECTION_VIEW", "SECTION_ASSIGN"]
              : [];
        const fallbackDetail = {
          ...summary,
          permissions: findSelectedPermissions(defaultCodes),
        } as RoleDetail;
        return HttpResponse.json(fallbackDetail);
      }

      return problemResponse(
        404,
        {
          ...notFoundProblem,
          instance:
            `/api/v1/roles/${roleId}`,
        },
      );
    },
  );

const createRoleHandler =
  http.post(
    ROLES_URL,
    async ({ request }) => {
      await delay(300);

      const body =
        await readOptionalJson<CreateRoleRequest>(
          request,
        );

      const validationResponse =
        validateRoleBody(body);

      if (validationResponse) {
        return validationResponse;
      }

      if (
        !body?.name ||
        !body.permissionCodes
          ?.length
      ) {
        return problemResponse(
          400,
          {
            ...validationProblem,
            detail:
              "El cuerpo de la solicitud es inválido.",
          },
        );
      }

      const name =
        body.name.trim();

      if (
        hasDuplicateRoleName(
          name,
        )
      ) {
        return problemResponse(
          409,
          {
            title:
              "El rol ya existe",
            code:
              "ROLE_NAME_ALREADY_EXISTS",
            detail:
              "Ya existe un rol activo con el nombre especificado.",
            instance:
              "/api/v1/roles",
          },
        );
      }

      const selectedPermissions =
        findSelectedPermissions(
          body.permissionCodes,
        );

      if (
        selectedPermissions.length !==
        body.permissionCodes.length
      ) {
        return problemResponse(
          400,
          {
            ...validationProblem,
            detail:
              "Uno o más códigos de permiso no existen en el catálogo.",
            errors: [
              {
                field:
                  "permissionCodes",
                message:
                  "Uno o más códigos de permiso no existen en el catálogo.",
                rejectedValue:
                  body.permissionCodes,
              },
            ],
          },
        );
      }

      const id =
        crypto.randomUUID();

      const now =
        new Date().toISOString();

      const created = {
        id,
        code:
          createRoleCode(name),
        name,
        description:
          body.description
            ?.trim() ?? "",
        status: "ACTIVE",
        protected: false,
        permissionCount:
          selectedPermissions.length,
        version: 0,
        updatedAt: now,
        permissions:
          selectedPermissions,
      } as RoleDetail;

      roles.push(
        toRoleSummary(created),
      );

      details.set(id, created);

      return HttpResponse.json(
        created,
        {
          status: 201,
          headers: {
            Location:
              `${ROLES_URL}/${id}`,
          },
        },
      );
    },
  );

const updateRoleHandler =
  http.put(
    `${ROLES_URL}/:roleId`,
    async ({
      params,
      request,
    }) => {
      await delay(300);

      const roleId = String(
        params.roleId,
      );

      const summaryIndex =
        roles.findIndex(
          (role) =>
            role.id === roleId,
        );

      if (
        summaryIndex < 0
      ) {
        return problemResponse(
          404,
          {
            ...notFoundProblem,
            instance:
              `/api/v1/roles/${roleId}`,
          },
        );
      }

      const body =
        await readOptionalJson<UpdateRoleRequest>(
          request,
        );

      const validationResponse =
        validateRoleBody(body);

      if (validationResponse) {
        return validationResponse;
      }

      if (
        !body?.name ||
        !body.permissionCodes
          ?.length
      ) {
        return problemResponse(
          400,
          {
            ...validationProblem,
            detail:
              "El cuerpo de la solicitud es obligatorio.",
            instance:
              `/api/v1/roles/${roleId}`,
          },
        );
      }

      const current =
        roles[summaryIndex];

      if (
        body.version !==
        current.version
      ) {
        return problemResponse(
          409,
          {
            ...versionConflictProblem,
            instance:
              `/api/v1/roles/${roleId}`,
            detail:
              "El rol fue modificado por otro usuario. Recarga la información antes de continuar.",
          },
        );
      }

      const name =
        body.name.trim();

      if (
        hasDuplicateRoleName(
          name,
          roleId,
        )
      ) {
        return problemResponse(
          409,
          {
            title:
              "El rol ya existe",
            code:
              "ROLE_NAME_ALREADY_EXISTS",
            detail:
              "Ya existe otro rol activo con el nombre especificado.",
            instance:
              `/api/v1/roles/${roleId}`,
          },
        );
      }

      const selectedPermissions =
        findSelectedPermissions(
          body.permissionCodes,
        );

      if (
        selectedPermissions.length !==
        body.permissionCodes.length
      ) {
        return problemResponse(
          400,
          {
            ...validationProblem,
            instance:
              `/api/v1/roles/${roleId}`,
            detail:
              "Uno o más códigos de permiso no existen en el catálogo.",
            errors: [
              {
                field:
                  "permissionCodes",
                message:
                  "Uno o más códigos de permiso no existen en el catálogo.",
                rejectedValue:
                  body.permissionCodes,
              },
            ],
          },
        );
      }

      const updated = {
        ...current,
        name,
        description:
          body.description
            ?.trim() ?? "",
        permissionCount:
          selectedPermissions.length,
        version:
          current.version + 1,
        updatedAt:
          new Date().toISOString(),
        permissions:
          selectedPermissions,
      } as RoleDetail;

      roles[summaryIndex] =
        toRoleSummary(updated);

      details.set(
        roleId,
        updated,
      );

      return HttpResponse.json(
        updated,
      );
    },
  );

const deleteRoleHandler =
  http.delete(
    `${ROLES_URL}/:roleId`,
    async ({
      params,
      request,
    }) => {
      await delay(250);

      const roleId = String(
        params.roleId,
      );

      const roleIndex =
        roles.findIndex(
          (role) =>
            role.id === roleId,
        );

      if (roleIndex < 0) {
        return problemResponse(
          404,
          {
            ...notFoundProblem,
            instance:
              `/api/v1/roles/${roleId}`,
          },
        );
      }

      const current =
        roles[roleIndex];

      const body =
        await readOptionalJson<DeleteRoleRequest>(
          request,
        );

      if (current.protected) {
        return problemResponse(
          409,
          {
            ...protectedRoleProblem,
            instance:
              `/api/v1/roles/${roleId}`,
          },
        );
      }

      if (
        body?.version !==
        current.version
      ) {
        return problemResponse(
          409,
          {
            ...versionConflictProblem,
            instance:
              `/api/v1/roles/${roleId}`,
            detail:
              "El rol fue modificado por otro usuario. Recarga la información antes de continuar.",
          },
        );
      }

      /*
       * SUPUESTO TÉCNICO PENDIENTE DE VALIDACIÓN:
       * La baja requiere una justificación de al menos 5 caracteres.
       * Eliminar esta validación si el OpenAPI no la exige.
       */
      if (
        !body?.reason ||
        body.reason
          .trim()
          .length < 5
      ) {
        return problemResponse(
          400,
          {
            ...validationProblem,
            instance:
              `/api/v1/roles/${roleId}`,
            detail:
              "Captura una justificación de al menos 5 caracteres.",
            errors: [
              {
                field: "reason",
                message:
                  "Captura una justificación de al menos 5 caracteres.",
                rejectedValue:
                  body?.reason,
              },
            ],
          },
        );
      }

      const now =
        new Date().toISOString();

      const nextVersion =
        current.version + 1;

      roles[roleIndex] = {
        ...current,
        status: "DELETED",
        version: nextVersion,
        updatedAt: now,
      };

      const currentDetail =
        details.get(roleId);

      if (currentDetail) {
        details.set(roleId, {
          ...currentDetail,
          status: "DELETED",
          version: nextVersion,
          updatedAt: now,
        });
      }

      return new HttpResponse(
        null,
        {
          status: 204,
        },
      );
    },
  );

const getRoleImpactHandler =
  http.get(
    `${ROLES_URL}/:roleId/impact`,
    async ({ params }) => {
      await delay(180);

      const roleId = String(
        params.roleId,
      );

      const roleExists =
        roles.some(
          (role) =>
            role.id === roleId,
        );

      if (!roleExists) {
        return problemResponse(
          404,
          {
            ...notFoundProblem,
            instance:
              `/api/v1/roles/${roleId}/impact`,
          },
        );
      }

      if (
        roleId ===
        PROTECTED_ROLE_ID
      ) {
        return HttpResponse.json({
          ...protectedRoleImpact,
          roleId,
        });
      }

      return HttpResponse.json({
        ...roleImpact,
        roleId,
      });
    },
  );

const listPermissionsHandler =
  http.get(
    PERMISSIONS_URL,
    async ({ request }) => {
      await delay(150);

      const url =
        new URL(request.url);

      const moduleCode =
        url.searchParams.get(
          "module",
        );

      const assignable =
        url.searchParams.get(
          "assignable",
        );

      const status =
        url.searchParams.get(
          "status",
        );

      if (
        assignable !== null &&
        assignable !== "true" &&
        assignable !== "false"
      ) {
        return invalidQueryResponse(
          "El parámetro assignable debe ser true o false.",
          "assignable",
        );
      }

      return HttpResponse.json(
        permissions
          .filter(
            (permission) =>
              moduleCode === null ||
              permission.module ===
                moduleCode,
          )
          .filter(
            (permission) =>
              assignable === null ||
              permission.assignable ===
                (
                  assignable ===
                  "true"
                ),
          )
          .filter(
            (permission) =>
              status === null ||
              permission.status ===
                status,
          ),
      );
    },
  );

const permissionCatalogHandler =
  http.get(
    GROUPED_PERMISSIONS_URL,
    async ({ request }) => {
      console.info(
        '[MSW] GET catálogo de permisos',
        request.url,
      );

      await delay(150);

      return HttpResponse.json(
        groupedPermissions,
      );
    },
  );

export const rolesPermissionsHandlers = [
  listRolesHandler,
  getRoleDetailHandler,
  createRoleHandler,
  updateRoleHandler,
  deleteRoleHandler,
  getRoleImpactHandler,
  listPermissionsHandler,
  permissionCatalogHandler,
];

export const rolesScenarios = {
  empty: http.get(
    ROLES_URL,
    () =>
      HttpResponse.json({
        items: [],
        page: DEFAULT_PAGE,
        pageSize:
          DEFAULT_PAGE_SIZE,
        totalItems: 0,
        totalPages: 0,
      }),
  ),

  badRequest: http.get(
    ROLES_URL,
    () =>
      problemResponse(400, {
        title:
          "Solicitud inválida",
        code: "INVALID_QUERY",
      }),
  ),

  unauthorized: http.get(
    ROLES_URL,
    () =>
      problemResponse(401, {
        title:
          "Autenticación requerida",
        code: "UNAUTHORIZED",
      }),
  ),

  forbidden: http.get(
    ROLES_URL,
    () =>
      problemResponse(403, {
        title:
          "Permiso insuficiente",
        code:
          "ROLE_VIEW_REQUIRED",
      }),
  ),

  serverError: http.get(
    ROLES_URL,
    () =>
      problemResponse(500, {
        title:
          "Error inesperado",
        code:
          "UNEXPECTED_ERROR",
      }),
  ),

  networkError: http.get(
    ROLES_URL,
    () => HttpResponse.error(),
  ),

  slow: http.get(
    ROLES_URL,
    async () => {
      await delay("infinite");

      return HttpResponse.json({
        items: [],
        page: DEFAULT_PAGE,
        pageSize:
          DEFAULT_PAGE_SIZE,
        totalItems: 0,
        totalPages: 0,
      });
    },
  ),
};

export const permissionsScenarios = {
  empty: http.get(
    GROUPED_PERMISSIONS_URL,
    () =>
      HttpResponse.json({
        modules: [],
      }),
  ),

  badRequest: http.get(
    GROUPED_PERMISSIONS_URL,
    () =>
      problemResponse(400, {
        title:
          "Solicitud inválida",
        code: "INVALID_QUERY",
      }),
  ),

  unauthorized: http.get(
    GROUPED_PERMISSIONS_URL,
    () =>
      problemResponse(401, {
        title:
          "Autenticación requerida",
        code: "UNAUTHORIZED",
      }),
  ),

  forbidden: http.get(
    GROUPED_PERMISSIONS_URL,
    () =>
      problemResponse(403, {
        title:
          "Permiso insuficiente",
        code:
          "PERMISSION_VIEW_REQUIRED",
      }),
  ),

  serverError: http.get(
    GROUPED_PERMISSIONS_URL,
    () =>
      problemResponse(500, {
        title:
          "Error inesperado",
        code:
          "UNEXPECTED_ERROR",
      }),
  ),

  networkError: http.get(
    GROUPED_PERMISSIONS_URL,
    () => HttpResponse.error(),
  ),

  slow: http.get(
    GROUPED_PERMISSIONS_URL,
    async () => {
      await delay("infinite");

      return HttpResponse.json({
        modules: [],
      });
    },
  ),
};

export const roleDetailScenarios = {
  notFound:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(404, {
            ...notFoundProblem,
            instance:
              `/api/v1/roles/${roleId}`,
          }),
      ),

  forbidden:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(403, {
            title:
              "Permiso insuficiente",
            code:
              "ROLE_VIEW_REQUIRED",
          }),
      ),

  slow:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}`,
        async () => {
          await delay("infinite");

          return HttpResponse.json(
            roleDetail,
          );
        },
      ),
};

export const roleUpdateScenarios = {
  versionConflict:
    (roleId: string) =>
      http.put(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(
            409,
            versionConflictProblem,
          ),
      ),

  validationError:
    (roleId: string) =>
      http.put(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(
            400,
            validationProblem,
          ),
      ),

  forbidden:
    (roleId: string) =>
      http.put(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(403, {
            title:
              "Permiso insuficiente",
            code:
              "ROLE_UPDATE_REQUIRED",
          }),
      ),

  serverError:
    (roleId: string) =>
      http.put(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(500, {
            title:
              "Error inesperado",
            code:
              "UNEXPECTED_ERROR",
          }),
      ),
};

export const roleImpactScenarios = {
  protected:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}/impact`,
        () =>
          HttpResponse.json({
            ...protectedRoleImpact,
            roleId,
          }),
      ),

  notFound:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}/impact`,
        () =>
          problemResponse(404, {
            ...notFoundProblem,
            instance:
              `/api/v1/roles/${roleId}/impact`,
          }),
      ),

  serverError:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}/impact`,
        () =>
          problemResponse(500, {
            title:
              "Error inesperado",
            code:
              "UNEXPECTED_ERROR",
          }),
      ),

  slow:
    (roleId: string) =>
      http.get(
        `${ROLES_URL}/${roleId}/impact`,
        async () => {
          await delay("infinite");

          return HttpResponse.json({
            ...roleImpact,
            roleId,
          });
        },
      ),
};

export const roleDeleteScenarios = {
  protected:
    (roleId: string) =>
      http.delete(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(
            409,
            protectedRoleProblem,
          ),
      ),

  versionConflict:
    (roleId: string) =>
      http.delete(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(
            409,
            versionConflictProblem,
          ),
      ),

  notFound:
    (roleId: string) =>
      http.delete(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(404, {
            ...notFoundProblem,
            instance:
              `/api/v1/roles/${roleId}`,
          }),
      ),

  forbidden:
    (roleId: string) =>
      http.delete(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(403, {
            title:
              "Permiso insuficiente",
            code:
              "ROLE_DELETE_REQUIRED",
          }),
      ),

  serverError:
    (roleId: string) =>
      http.delete(
        `${ROLES_URL}/${roleId}`,
        () =>
          problemResponse(500, {
            title:
              "Error inesperado",
            code:
              "UNEXPECTED_ERROR",
          }),
      ),
};
