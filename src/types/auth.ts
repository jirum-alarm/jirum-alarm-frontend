export interface IToken {
  id: string
  _role: string
  exp: number
}

export interface IRefreshToken extends IToken {
  _refresh: boolean
}
