import { applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension')
    return composeWithDevTools(applyMiddleware(...middleware))
  }
  return applyMiddleware(...middleware)
}

export default bindMiddleware([
  thunkMiddleware,
])
