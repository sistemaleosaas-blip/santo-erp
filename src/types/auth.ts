export type AppRole = "master" | "administrador" | "rh" | "supervisor" | "cliente" | "funcionario";

export const STAFF_ROLES: AppRole[] = ["master", "administrador", "rh", "supervisor"];

export interface SessionProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roles: AppRole[];
}

export function isStaff(roles: AppRole[]): boolean {
  return roles.some((r) => STAFF_ROLES.includes(r));
}

export const ROLE_LABELS: Record<AppRole, string> = {
  master: "Master",
  administrador: "Administrador",
  rh: "RH",
  supervisor: "Supervisor",
  cliente: "Cliente",
  funcionario: "Funcionário",
};
