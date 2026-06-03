import type { Action } from 'redux'

import { TYPES } from '../types'

export interface User {
  id: string | null
  name: string | null
  token: string | null
}

export interface LoginAction extends Action {
  type: string
  payload: User
}

export interface LogoutAction extends Action {
  type: string
}

export const actions = {
  login: (user: User): LoginAction => ({ type: TYPES.LOGIN, payload: user }),
  logout: (): LogoutAction => ({ type: TYPES.LOGOUT })
}
