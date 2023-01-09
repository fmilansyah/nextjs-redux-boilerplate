import { createStore } from 'redux'
import { createWrapper } from 'next-redux-wrapper'

import { persistStore } from 'redux-persist'
import reducers from './reducers'
import middleware from './middleware'

const initStore = (initialState) => {
  let store
  const isClient = typeof window !== 'undefined'
  if (isClient) {
    const { persistReducer } = require('redux-persist')
    const storage = require('redux-persist/lib/storage').default
    const persistConfig = {
      key: 'root',
      storage,
    }
    store = createStore(
      persistReducer(persistConfig, reducers),
      initialState,
      middleware
    )
    store.__PERSISTOR = persistStore(store)
  } else {
    store = createStore(reducers, middleware)
  }

  return store
}

export const wrapper = createWrapper(initStore)
