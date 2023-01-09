import React, { Component } from 'react'
import { getCookie } from '@/util/session'
import redirect from '@/util/redirect'
// import { getControlPanel } from '@/redux/setting/action'

export default (ComposedComponent) =>
  class WithData extends Component {
    static async getInitialProps(ctx) {
      // await ctx.store.dispatch(getControlPanel())
      // const controlPanelData = await ctx.store.getState().setting
      //   .controlPanelData
      if (
        ctx.pathname === '/queue/registration' ||
        ctx.pathname === '/queue/apm'
      ) {
        const isLoggedIn = getCookie('queue_logged_in', ctx.req) ? true : false
        if (isLoggedIn) {
          return { isLoggedIn }
        } else {
          redirect(ctx, '/')
        }
      }
    }

    render() {
      return <ComposedComponent {...this.props} />
    }
  }
