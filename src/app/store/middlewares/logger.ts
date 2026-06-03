import type { Middleware } from 'redux'

export const logger: Middleware = store => next => action => {
  const actionObj = action as { type: string }
  console.group(actionObj.type)
  console.info('dispatching', action)

  const result = next(action)

  console.log('next state', store.getState())
  console.groupEnd()

  return result
}
