import { combineReducers } from 'redux'
import common from './common/reducer'

const appReducers = combineReducers({
  common,
})

const rootReducers = (state, action) => {
  if (action.type == commonActionTypes.RESET_STATE) {
    state = undefined
  }
  return appReducers(state, action)
}

export default rootReducers
