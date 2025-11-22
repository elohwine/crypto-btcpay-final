export class SignupDto {
  email: string;
  password: string;
  name?: string;
  dateOfBirth?: string;
  phone?: string;
  referralCode?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class RefreshDto {
  refreshToken: string;
}
