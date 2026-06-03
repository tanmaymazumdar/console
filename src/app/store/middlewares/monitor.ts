import type { StoreEnhancer } from 'redux'

const round = (number: number): number => Math.round(number * 100) / 100

const monitorReducerEnhancer: StoreEnhancer = createStore => (reducer, preloadedState) => {
  const monitoredReducer: typeof reducer = (state, action) => {
    const start = performance.now()
    const newState = reducer(state, action)
    const end = performance.now()
    const diff = round(end - start)

    console.log('reducer process time:', diff)

    return newState
  }

  return createStore(monitoredReducer, preloadedState)
}

export default monitorReducerEnhancer
