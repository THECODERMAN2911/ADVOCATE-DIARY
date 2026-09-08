export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  password: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface FirmDto {
  id: number;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logoPath?: string;
}

export const ROLES = ['FirmAdmin', 'Lawyer', 'Staff'] as const;
