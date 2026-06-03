import { composeWithDevTools } from '@redux-devtools/extension'
import { applyMiddleware, legacy_createStore, type Middleware, type Store } from 'redux'
import { withExtraArgument } from 'redux-thunk'

import type { AuthAction } from './reducers/auth'

import { logger } from './middlewares/logger'
import monitorReducerEnhancer from './middlewares/monitor'
import { rootReducer } from './reducers'

export type RootState = ReturnType<typeof rootReducer>

export const createStore = (preloadedState?: Partial<RootState>): Store<RootState, AuthAction> => {
  const middlewares = [logger, withExtraArgument] as unknown as Middleware[]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducerEnhancer]
  const composedEnhancers = composeWithDevTools(...enhancers)

  return legacy_createStore(rootReducer, preloadedState, composedEnhancers)
}

export const store = createStore()
