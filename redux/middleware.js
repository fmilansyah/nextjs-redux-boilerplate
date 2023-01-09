import { applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import api from '../api'
import upload from '../api/upload'
import { commonActionTypes } from '@/redux/common/action'
import { logoutProcess } from '@/redux/auth/action'
import { slackWebHookPost } from '../api/slack-webhook'
import { isKeyAvailable, isKeyNotAvailable } from '@/helpers/formatter'
import { queueActionTypes } from './registration/queue/action'

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension')
    return composeWithDevTools(applyMiddleware(...middleware))
  }
  return applyMiddleware(...middleware)
}

// manage api auth headers Authorization
const apiSecuredMiddleware = (store) => (next) => (action) => {
  const { auth, setting } = store.getState()
  if (setting.hostname === process.env.HOSTNAME) {
    api.defaults.baseURL = process.env.API_LOCAL_URL
    upload.defaults.baseURL = process.env.API_LOCAL_URL
  }
  const { token } = auth
  if (isKeyNotAvailable(token)) return next(action)
  api.defaults.headers.common = {
    Authorization: `Bearer ${token}`,
  }
  upload.defaults.headers.common = {
    Authorization: `Bearer ${token}`,
  }

  return next(action)
}

// manage api interceptors
const apiInterceptorsMiddleware = (store) => (next) => (action) => {
  const { dispatch } = store
  // console.log(action.type)
  api.interceptors.response.use(null, function (error) {
    if (isKeyAvailable(error) && error.message === 'Network Error') {
      dispatch({
        type: commonActionTypes.FETCH_FAILURE_NETWORK_ERROR,
        payload: error.message,
      })
      dispatch({
        type: commonActionTypes.ERROR_RESPONSE,
        payload: {
          status,
          message: error.message,
        },
      })
      dispatch({ type: commonActionTypes.HIDE_LOADING })
      dispatch({ type: queueActionTypes.BTN_NEXT_DISABLED_FALSE })
      dispatch({ type: queueActionTypes.BTN_REPEAT_DISABLED_FALSE })
      return Promise.reject(error)
    }
    if (action.type !== 'persist/PERSIST') return Promise.reject(error)
    // console.log(`onRejected: ${error.toJSON()}`)
    // console.log(error.toJSON())
    // console.log(`onRejected: ${error.code}`)
    // console.log(`onRejected: ${error.message}`)
    console.log(
      `status: ${error && error.response ? error.response.status : ''}`
    )
    if (error.response === undefined) {
      dispatch({
        type: commonActionTypes.FETCH_FAILURE_NETWORK_ERROR,
        payload: error.message,
      })
      dispatch({
        type: commonActionTypes.ERROR_RESPONSE,
        payload: {
          status,
          message: error.message,
        },
      })
      dispatch({ type: commonActionTypes.HIDE_LOADING })
      dispatch({ type: queueActionTypes.BTN_NEXT_DISABLED_FALSE })
      dispatch({ type: queueActionTypes.BTN_REPEAT_DISABLED_FALSE })
      return Promise.reject(error.response)
    }

    const { status, data } = error.response
    /** Push to Slack */
    const { auth } = store.getState()
    // const { token } = auth
    const req = isKeyAvailable(error.config.data) ? error.config.data : {}
    const urlApi = isKeyAvailable(error.config.url) ? error.config.url : ''
    const res = isKeyAvailable(error.response.data) ? error.response.data : {}
    if (urlApi !== 'auth/login') {
      slackWebHookPost(
        `Status ${res.status}: ${res.message}`,
        auth.user.user_id,
        auth.user.user_name,
        window.location.href,
        urlApi,
        JSON.stringify(res),
        JSON.stringify(req)
      )
    }
    /** End Push to Slack */
    if (status >= 500) {
      dispatch({
        type: commonActionTypes.ERROR_RESPONSE,
        payload: {
          status,
          message: `Gateway Timeout: ${error.message}`,
        },
      })
      dispatch({ type: commonActionTypes.HIDE_LOADING })
      dispatch({ type: queueActionTypes.BTN_NEXT_DISABLED_FALSE })
      dispatch({ type: queueActionTypes.BTN_REPEAT_DISABLED_FALSE })
      return Promise.reject(error.response)
    }

    if (status === 401) {
      dispatch(logoutProcess())
      return Promise.reject(error)
    }
    // special case, for validate post/patch/put api
    if (status === 400) {
      dispatch({
        type: commonActionTypes.FETCH_FAILURE,
        payload: data.message,
      })
      if (data.validators !== undefined) {
        dispatch({
          type: commonActionTypes.ERROR_RESPONSE,
          payload: {
            status,
            message: data.message,
            validators: data.validators,
          },
        })
        dispatch({ type: commonActionTypes.HIDE_LOADING })
      }
      return Promise.reject(error.response)
    }
    let message = data.message
    if (data.message === undefined) message = error.message

    dispatch({
      type: commonActionTypes.FETCH_FAILURE,
      payload: message,
    })
    dispatch({
      type: commonActionTypes.ERROR_RESPONSE,
      payload: {
        status,
        message: message,
      },
    })
    return Promise.reject(error.response)
  })
  return next(action)
}

export default bindMiddleware([
  apiSecuredMiddleware,
  apiInterceptorsMiddleware,
  thunkMiddleware,
])
