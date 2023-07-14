export interface ILoginVariable {
  email: string;
  password: string;
}

export interface ITokenOutput {
  accessToken: string;
  refreshToken?: string;
}

export interface ILoginOutput {
  adminLogin: ITokenOutput;
}

export interface ILoginByRefreshTokenOutput {
  loginByRefreshToken: ITokenOutput;
}
