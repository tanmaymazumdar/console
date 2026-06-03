import { createSelector } from 'reselect'

import type { AuthState } from '../reducers/auth'

export const authSelector = createSelector(
  (state: { auth: AuthState }) => state.auth,
  (auth: AuthState): AuthState => auth
)
