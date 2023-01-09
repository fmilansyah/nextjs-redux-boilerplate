export const commonActionTypes = {
  LOADING: 'LOADING',
  RESET_STATE: 'RESET_STATE',
}

export const resetState = () => {
  return (dispatch) => {
    dispatch({ type: commonActionTypes.RESET_STATE })
  }
}

export const setLoading = (status = false) => {
  return (dispatch) => {
    dispatch({ type: commonActionTypes.LOADING, payload: status })
  }
}
