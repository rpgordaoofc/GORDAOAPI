// Sistema de permissões por role do dashboard RP GORDAO

export type Role = "OWNER" | "SUPER_ADMIN" | "ADMIN" | "SUPPORT" | "VIEWER";

export interface Permission {
  // Navegação — quais páginas pode acessar
  pages: {
    overview: boolean;
    keys: boolean;
    users: boolean;
    products: boolean;
    bulkActions: boolean;
    logs: boolean;
    blacklist: boolean;
    coupons: boolean;
    settings: boolean;
    adminUsers: boolean;
  };
  // Ações — o que pode fazer
  actions: {
    // Keys
    createKey: boolean;
    editKey: boolean;
    deleteKey: boolean;
    banKey: boolean;
    pauseKey: boolean;
    resetHwid: boolean;
    unlinkKey: boolean;
    addKeyDays: boolean;
    transferKey: boolean;
    exportKeys: boolean;
    // Users
    viewUsers: boolean;
    syncUser: boolean;
    // Products
    createProduct: boolean;
    editProduct: boolean;
    deleteProduct: boolean;
    // Bulk
    bulkPause: boolean;
    bulkReset: boolean;
    bulkDelete: boolean;
    // Settings
    toggleMaintenance: boolean;
    editWebhook: boolean;
    editSecurity: boolean;
    editPrivacy: boolean;
    // Admin users
    createAdmin: boolean;
    editAdmin: boolean;
    deleteAdmin: boolean;
    // Blacklist & Coupons
    manageBlacklist: boolean;
    manageCoupons: boolean;
    // Logs
    viewLogs: boolean;
    exportLogs: boolean;
  };
}

const PERMISSIONS: Record<Role, Permission> = {
  OWNER: {
    pages: {
      overview: true, keys: true, users: true, products: true,
      bulkActions: true, logs: true, blacklist: true, coupons: true,
      settings: true, adminUsers: true,
    },
    actions: {
      createKey: true, editKey: true, deleteKey: true, banKey: true,
      pauseKey: true, resetHwid: true, unlinkKey: true, addKeyDays: true,
      transferKey: true, exportKeys: true, viewUsers: true, syncUser: true,
      createProduct: true, editProduct: true, deleteProduct: true,
      bulkPause: true, bulkReset: true, bulkDelete: true,
      toggleMaintenance: true, editWebhook: true, editSecurity: true, editPrivacy: true,
      createAdmin: true, editAdmin: true, deleteAdmin: true,
      manageBlacklist: true, manageCoupons: true, viewLogs: true, exportLogs: true,
    },
  },

  SUPER_ADMIN: {
    pages: {
      overview: true, keys: true, users: true, products: true,
      bulkActions: true, logs: true, blacklist: true, coupons: true,
      settings: true, adminUsers: true,
    },
    actions: {
      createKey: true, editKey: true, deleteKey: true, banKey: true,
      pauseKey: true, resetHwid: true, unlinkKey: true, addKeyDays: true,
      transferKey: true, exportKeys: true, viewUsers: true, syncUser: true,
      createProduct: true, editProduct: true, deleteProduct: true,
      bulkPause: true, bulkReset: true, bulkDelete: true,
      toggleMaintenance: true, editWebhook: true, editSecurity: true, editPrivacy: true,
      createAdmin: true, editAdmin: true, deleteAdmin: false, // não pode deletar
      manageBlacklist: true, manageCoupons: true, viewLogs: true, exportLogs: true,
    },
  },

  ADMIN: {
    pages: {
      overview: true, keys: true, users: true, products: true,
      bulkActions: true, logs: true, blacklist: true, coupons: true,
      settings: false, adminUsers: false,
    },
    actions: {
      createKey: true, editKey: true, deleteKey: false, banKey: true,
      pauseKey: true, resetHwid: true, unlinkKey: true, addKeyDays: true,
      transferKey: true, exportKeys: true, viewUsers: true, syncUser: true,
      createProduct: true, editProduct: true, deleteProduct: false,
      bulkPause: true, bulkReset: true, bulkDelete: false,
      toggleMaintenance: false, editWebhook: false, editSecurity: false, editPrivacy: false,
      createAdmin: false, editAdmin: false, deleteAdmin: false,
      manageBlacklist: true, manageCoupons: true, viewLogs: true, exportLogs: true,
    },
  },

  SUPPORT: {
    pages: {
      overview: true, keys: true, users: true, products: true,
      bulkActions: false, logs: true, blacklist: false, coupons: false,
      settings: false, adminUsers: false,
    },
    actions: {
      createKey: false, editKey: false, deleteKey: false, banKey: false,
      pauseKey: false, resetHwid: true, unlinkKey: false, addKeyDays: false,
      transferKey: false, exportKeys: false, viewUsers: true, syncUser: true,
      createProduct: false, editProduct: false, deleteProduct: false,
      bulkPause: false, bulkReset: false, bulkDelete: false,
      toggleMaintenance: false, editWebhook: false, editSecurity: false, editPrivacy: false,
      createAdmin: false, editAdmin: false, deleteAdmin: false,
      manageBlacklist: false, manageCoupons: false, viewLogs: true, exportLogs: false,
    },
  },

  VIEWER: {
    pages: {
      overview: true, keys: true, users: true, products: true,
      bulkActions: false, logs: false, blacklist: false, coupons: false,
      settings: false, adminUsers: false,
    },
    actions: {
      createKey: false, editKey: false, deleteKey: false, banKey: false,
      pauseKey: false, resetHwid: false, unlinkKey: false, addKeyDays: false,
      transferKey: false, exportKeys: false, viewUsers: true, syncUser: false,
      createProduct: false, editProduct: false, deleteProduct: false,
      bulkPause: false, bulkReset: false, bulkDelete: false,
      toggleMaintenance: false, editWebhook: false, editSecurity: false, editPrivacy: false,
      createAdmin: false, editAdmin: false, deleteAdmin: false,
      manageBlacklist: false, manageCoupons: false, viewLogs: false, exportLogs: false,
    },
  },
};

export function getPermissions(role: Role | string | undefined): Permission {
  return PERMISSIONS[(role as Role) ?? "VIEWER"] ?? PERMISSIONS.VIEWER;
}

export function can(role: Role | string | undefined, action: keyof Permission["actions"]): boolean {
  return getPermissions(role).actions[action] ?? false;
}

export function canPage(role: Role | string | undefined, page: keyof Permission["pages"]): boolean {
  return getPermissions(role).pages[page] ?? false;
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Proprietário",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  SUPPORT: "Suporte",
  VIEWER: "Visualizador",
};

export const ROLE_COLORS: Record<Role, string> = {
  OWNER: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  SUPER_ADMIN: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  ADMIN: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  SUPPORT: "text-green-400 bg-green-400/10 border-green-400/20",
  VIEWER: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};
