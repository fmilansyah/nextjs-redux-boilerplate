import Router from 'next/router'
import App from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { ReactReduxContext } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import NProgress from 'nprogress'
import '../assets/nprogress.less'
import moment from 'moment'
import { wrapper } from '../redux/store'
import { getControlPanelSSR } from '@/redux/setting/action'

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => {
  NProgress.done()
  if (process.env.NODE_ENV !== 'production') {
    const els = document.querySelectorAll(
      'link[href*="/_next/static/css/styles.chunk.css"]'
    )
    const timestamp = new Date().valueOf()
    els[0].href = '/_next/static/css/styles.chunk.css?v=' + timestamp
  }
})
Router.events.on('routeChangeError', () => NProgress.done())

const Noop = ({ children }) => children

moment.locale('id')

class NextApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    const controlPanel = await getControlPanelSSR()
    return {
      pageProps,
      controlPanel: controlPanel?.data?.data,
    }
  }

  render() {
    const { Component, pageProps, controlPanel } = this.props
    const Layout = Component.Layout || Noop

    return (
      <Layout>
        <Head>
          <title>APM - {controlPanel?.COMPANY_NAME}</title>
          <link rel="shortcut icon" href={controlPanel?.FAVICON_WEB} />
          <script
            type="text/javascript"
            src={
              controlPanel?.MIDTRANS_IS_PRODUCTION === '1'
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js'
            }
            data-client-key={
              controlPanel?.MIDTRANS_IS_PRODUCTION === '1'
                ? controlPanel?.MIDTRANS_CLIENT_KEY_PRODUCTION
                : controlPanel?.MIDTRANS_CLIENT_KEY_SANDBOX
            }
          ></script>
        </Head>
        <Layout>
          <ReactReduxContext.Consumer>
            {({ store }) => {
              return (
                <Provider store={store}>
                  <PersistGate persistor={store.__PERSISTOR} loading={null}>
                    <Component {...pageProps} controlPanel={controlPanel} />
                  </PersistGate>
                </Provider>
              )
            }}
          </ReactReduxContext.Consumer>
        </Layout>
      </Layout>
    )
  }
}

export default wrapper.withRedux(NextApp)
