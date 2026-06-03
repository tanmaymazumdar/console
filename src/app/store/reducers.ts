import { combineReducers } from 'redux'

import { reducer as authReducer } from './reducers/auth'

export const rootReducer = combineReducers({
  auth: authReducer
})
