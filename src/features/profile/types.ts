export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  biography: string | null;
  skills: string | null;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  photo_url: string | null;
  email_verified: boolean;
  created_at: string | null;
}

export interface ProfileFaculty {
  id: number;
  name: string;
  email: string;
}

export interface ProfileResponse {
  user: ProfileUser;
  faculty: ProfileFaculty | null;
}

export interface UpdateProfileBody {
  name: string;
  phone?: string;
  biography?: string;
  skills?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface UpdatePasswordBody {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface LogoutOthersBody {
  password: string;
}
