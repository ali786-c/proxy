export type Locale = "en" | "es" | "fr";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

type TranslationKeys = {
  // Nav
  "nav.overview": string;
  "nav.products": string;
  "nav.settings": string;
  "nav.billing": string;
  "nav.invoices": string;
  "nav.support": string;
  "nav.usage": string;
  "nav.referral": string;
  "nav.faq": string;
  "nav.security": string;
  "nav.organization": string;
  "nav.auditLog": string;
  "nav.users": string;
  "nav.permissions": string;
  "nav.alerts": string;
  // Common
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.edit": string;
  "common.create": string;
  "common.search": string;
  "common.loading": string;
  "common.noData": string;
  "common.actions": string;
  "common.status": string;
  "common.back": string;
  "common.confirm": string;
  "common.copy": string;
  "common.enable": string;
  "common.disable": string;
  // Auth
  "auth.login": string;
  "auth.signup": string;
  "auth.logout": string;
  "auth.email": string;
  "auth.password": string;
  "auth.forgotPassword": string;
  "auth.signInWith": string;
  // 2FA
  "2fa.title": string;
  "2fa.description": string;
  "2fa.enable": string;
  "2fa.disable": string;
  "2fa.scanQR": string;
  "2fa.enterCode": string;
  "2fa.backupCodes": string;
  "2fa.verified": string;
  // Dashboard
  "dashboard.title": string;
  "dashboard.totalBandwidth": string;
  "dashboard.totalRequests": string;
  "dashboard.successRate": string;
  "dashboard.activeProxies": string;
  // Billing
  "billing.title": string;
  "billing.balance": string;
  "billing.topUp": string;
  "billing.history": string;
  // Org
  "org.title": string;
  "org.createOrg": string;
  "org.members": string;
  "org.inviteMember": string;
  "org.departments": string;
  "org.role": string;
  // RBAC
  "rbac.title": string;
  "rbac.permissions": string;
  "rbac.assignRole": string;
};

const en: TranslationKeys = {
  "nav.overview": "Overview",
  "nav.products": "Products",
  "nav.settings": "Settings",
  "nav.billing": "Account & Billing",
  "nav.invoices": "Invoices",
  "nav.support": "Support Tickets",
  "nav.usage": "Usage Analytics",
  "nav.referral": "Referral Program",
  "nav.faq": "FAQ",
  "nav.security": "Security & 2FA",
  "nav.organization": "Organization",
  "nav.auditLog": "Audit Log",
  "nav.users": "Users",
  "nav.permissions": "Permissions",
  "nav.alerts": "Alerts",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.create": "Create",
  "common.search": "Search",
  "common.loading": "Loading…",
  "common.noData": "No data found",
  "common.actions": "Actions",
  "common.status": "Status",
  "common.back": "Back",
  "common.confirm": "Confirm",
  "common.copy": "Copy",
  "common.enable": "Enable",
  "common.disable": "Disable",
  "auth.login": "Login",
  "auth.signup": "Sign Up",
  "auth.logout": "Log Out",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.forgotPassword": "Forgot password?",
  "auth.signInWith": "Or continue with",
  "2fa.title": "Two-Factor Authentication",
  "2fa.description": "Add an extra layer of security to your account using a TOTP authenticator app.",
  "2fa.enable": "Enable 2FA",
  "2fa.disable": "Disable 2FA",
  "2fa.scanQR": "Scan this QR code with your authenticator app",
  "2fa.enterCode": "Enter the 6-digit code from your app",
  "2fa.backupCodes": "Backup Codes",
  "2fa.verified": "2FA is enabled and verified",
  "dashboard.title": "Dashboard",
  "dashboard.totalBandwidth": "Total Bandwidth",
  "dashboard.totalRequests": "Total Requests",
  "dashboard.successRate": "Success Rate",
  "dashboard.activeProxies": "Active Proxies",
  "billing.title": "Billing",
  "billing.balance": "Balance",
  "billing.topUp": "Top Up",
  "billing.history": "Transaction History",
  "org.title": "Organization",
  "org.createOrg": "Create Organization",
  "org.members": "Members",
  "org.inviteMember": "Invite Member",
  "org.departments": "Departments",
  "org.role": "Role",
  "rbac.title": "Role Permissions",
  "rbac.permissions": "Permissions",
  "rbac.assignRole": "Assign Role",
};

const es: TranslationKeys = {
  "nav.overview": "Resumen",
  "nav.products": "Productos",
  "nav.settings": "Configuración",
  "nav.billing": "Cuenta y Facturación",
  "nav.invoices": "Facturas",
  "nav.support": "Tickets de Soporte",
  "nav.usage": "Análisis de Uso",
  "nav.referral": "Programa de Referidos",
  "nav.faq": "FAQ",
  "nav.security": "Seguridad y 2FA",
  "nav.organization": "Organización",
  "nav.auditLog": "Registro de Auditoría",
  "nav.users": "Usuarios",
  "nav.permissions": "Permisos",
  "nav.alerts": "Alertas",
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.delete": "Eliminar",
  "common.edit": "Editar",
  "common.create": "Crear",
  "common.search": "Buscar",
  "common.loading": "Cargando…",
  "common.noData": "No se encontraron datos",
  "common.actions": "Acciones",
  "common.status": "Estado",
  "common.back": "Volver",
  "common.confirm": "Confirmar",
  "common.copy": "Copiar",
  "common.enable": "Activar",
  "common.disable": "Desactivar",
  "auth.login": "Iniciar Sesión",
  "auth.signup": "Registrarse",
  "auth.logout": "Cerrar Sesión",
  "auth.email": "Correo Electrónico",
  "auth.password": "Contraseña",
  "auth.forgotPassword": "¿Olvidaste tu contraseña?",
  "auth.signInWith": "O continuar con",
  "2fa.title": "Autenticación de Dos Factores",
  "2fa.description": "Agrega una capa extra de seguridad a tu cuenta usando una app de autenticación TOTP.",
  "2fa.enable": "Activar 2FA",
  "2fa.disable": "Desactivar 2FA",
  "2fa.scanQR": "Escanea este código QR con tu app de autenticación",
  "2fa.enterCode": "Ingresa el código de 6 dígitos de tu app",
  "2fa.backupCodes": "Códigos de Respaldo",
  "2fa.verified": "2FA está activado y verificado",
  "dashboard.title": "Panel",
  "dashboard.totalBandwidth": "Ancho de Banda Total",
  "dashboard.totalRequests": "Total de Solicitudes",
  "dashboard.successRate": "Tasa de Éxito",
  "dashboard.activeProxies": "Proxies Activos",
  "billing.title": "Facturación",
  "billing.balance": "Saldo",
  "billing.topUp": "Recargar",
  "billing.history": "Historial de Transacciones",
  "org.title": "Organización",
  "org.createOrg": "Crear Organización",
  "org.members": "Miembros",
  "org.inviteMember": "Invitar Miembro",
  "org.departments": "Departamentos",
  "org.role": "Rol",
  "rbac.title": "Permisos de Rol",
  "rbac.permissions": "Permisos",
  "rbac.assignRole": "Asignar Rol",
};

const fr: TranslationKeys = {
  "nav.overview": "Aperçu",
  "nav.products": "Produits",
  "nav.settings": "Paramètres",
  "nav.billing": "Compte et Facturation",
  "nav.invoices": "Factures",
  "nav.support": "Tickets de Support",
  "nav.usage": "Analyse d'Utilisation",
  "nav.referral": "Programme de Parrainage",
  "nav.faq": "FAQ",
  "nav.security": "Sécurité et 2FA",
  "nav.organization": "Organisation",
  "nav.auditLog": "Journal d'Audit",
  "nav.users": "Utilisateurs",
  "nav.permissions": "Permissions",
  "nav.alerts": "Alertes",
  "common.save": "Sauvegarder",
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.edit": "Modifier",
  "common.create": "Créer",
  "common.search": "Rechercher",
  "common.loading": "Chargement…",
  "common.noData": "Aucune donnée trouvée",
  "common.actions": "Actions",
  "common.status": "Statut",
  "common.back": "Retour",
  "common.confirm": "Confirmer",
  "common.copy": "Copier",
  "common.enable": "Activer",
  "common.disable": "Désactiver",
  "auth.login": "Connexion",
  "auth.signup": "S'inscrire",
  "auth.logout": "Déconnexion",
  "auth.email": "E-mail",
  "auth.password": "Mot de passe",
  "auth.forgotPassword": "Mot de passe oublié ?",
  "auth.signInWith": "Ou continuer avec",
  "2fa.title": "Authentification à Deux Facteurs",
  "2fa.description": "Ajoutez une couche de sécurité supplémentaire à votre compte avec une app TOTP.",
  "2fa.enable": "Activer 2FA",
  "2fa.disable": "Désactiver 2FA",
  "2fa.scanQR": "Scannez ce QR code avec votre app d'authentification",
  "2fa.enterCode": "Entrez le code à 6 chiffres de votre app",
  "2fa.backupCodes": "Codes de Secours",
  "2fa.verified": "2FA est activé et vérifié",
  "dashboard.title": "Tableau de Bord",
  "dashboard.totalBandwidth": "Bande Passante Totale",
  "dashboard.totalRequests": "Total des Requêtes",
  "dashboard.successRate": "Taux de Succès",
  "dashboard.activeProxies": "Proxies Actifs",
  "billing.title": "Facturation",
  "billing.balance": "Solde",
  "billing.topUp": "Recharger",
  "billing.history": "Historique des Transactions",
  "org.title": "Organisation",
  "org.createOrg": "Créer une Organisation",
  "org.members": "Membres",
  "org.inviteMember": "Inviter un Membre",
  "org.departments": "Départements",
  "org.role": "Rôle",
  "rbac.title": "Permissions des Rôles",
  "rbac.permissions": "Permissions",
  "rbac.assignRole": "Attribuer un Rôle",
};

export const translations: Record<Locale, TranslationKeys> = { en, es, fr };
