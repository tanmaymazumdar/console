import type { User } from '../actions/auth'
import type { Action } from 'redux'

import { TYPES } from '../types'

export interface AuthState {
  user: {
    id: string | null
    name: string | null
    token: string | null
  } | null
}

const initialState: AuthState = {
  user: {
    id: null,
    name: null,
    token: null
  }
}

interface LoginAction extends Action {
  type: string
  payload: User
}

interface LogoutAction extends Action {
  type: string
}

export type AuthAction = LoginAction | LogoutAction | { type: string; payload?: unknown }

export const reducer = (state: AuthState = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case TYPES.LOGIN:
      return { ...state, user: (action as LoginAction).payload }
    case TYPES.LOGOUT:
      return { ...state, user: null }
    default:
      return state
  }
}
