import * as jwt from 'jsonwebtoken'

import { QueryLoginByRefreshToken } from '../graphql/auth'

import { IRefreshToken, IToken } from '../types/auth'
import { StorageTokenKey } from '../types/enum/auth'
import { ApiType } from '../types/enum/common'
import { ILoginByRefreshTokenOutput } from '../types/login'
import { client } from './graphqlClient'

export const isAdmin = () => {
  const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN)

  if (!token) {
    return false
  }

  try {
    const { _role } = jwt.decode(token) as IToken
    return _role === 'admin' ? true : false
  } catch (e) {
    return false
  }
}

export const isAccessTokenExpired = () => {
  const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN)

  if (!token) {
    return false
  }

  try {
    const { _role: role, exp } = jwt.decode(token) as IToken
    return role === 'admin' && exp < Date.now() / 1000
  } catch (e) {
    return true
  }
}

export const isRefreshTokenExpired = () => {
  const refreshToken = localStorage.getItem(StorageTokenKey.REFRESH_TOKEN)

  if (!refreshToken) {
    return false
  }

  try {
    const { _role: role, _refresh: isRefresh, exp } = jwt.decode(refreshToken) as IRefreshToken
    return role === 'admin' && isRefresh && exp < Date.now() / 1000
  } catch (e) {
    return true
  }
}

export const getAccessToken = async () => {
  const refreshToken = localStorage.getItem(StorageTokenKey.REFRESH_TOKEN)
  if (!refreshToken) {
    throw new Error('no refresh token')
  }
  return client
    .query<ILoginByRefreshTokenOutput>({
      query: QueryLoginByRefreshToken,
      context: { clientName: ApiType.API, headers: { authorization: `Bearer ${refreshToken}` } },
      fetchPolicy: 'no-cache',
    })
    .then((res) => {
      const { accessToken, refreshToken } = res.data.loginByRefreshToken
      localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, accessToken)
      if (refreshToken) {
        localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, refreshToken)
      }
      return accessToken
    })
}
