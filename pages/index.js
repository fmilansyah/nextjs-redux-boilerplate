import React from 'react'
import { Form, Input, Button } from 'antd'
import { connect } from 'react-redux'
import authLayout from '@/layouts/auth'
import InfoView from '@/components/InfoView'
import { getCookie, setCookie } from '@/util/session'
import redirect from '@/util/redirect'
import absoluteUrl from 'next-absolute-url'
import { setHostname } from '@/redux/setting/action'
import { LoginOutlined } from '@ant-design/icons'
import { QUEUE_PASSWORD, QUEUE_USERNAME } from '@/constants/Settings'
import Router from 'next/router'
import OpenNotification from '@/components/Notification'

class Login extends React.Component {
  static async getInitialProps(context) {
    const { host } = absoluteUrl(context.req)
    const isLoggedIn = getCookie('queue_logged_in', context.req) ? true : false
    if (isLoggedIn) {
      redirect(context, '/queue/apm')
    }
    return { host }
  }

  state = {
    loading: false,
  }

  componentDidMount() {
    this.props.setHostname(this.props.host)
  }

  handleFinish = (values) => {
    if (
      values.username === QUEUE_USERNAME &&
      values.password === QUEUE_PASSWORD
    ) {
      this.setState({ loading: true })
      setCookie('queue_logged_in', true)
      Router.replace('/queue/apm')
    } else {
      OpenNotification('error', 'Kata pengguna atau kata sandi salah')
    }
  }

  handleFinishFailed = (values) => {
    console.error(values)
  }

  render() {
    return (
      <div className="gx-app-login-wrap">
        <div className="gx-app-login-container">
          <div className="gx-app-login-main-content">
            <div className="gx-app-logo-content">
              <div className="gx-app-logo-content-bg">
                <img src={this.props.controlPanel.COVER_BACKGROUND} />
              </div>
              <div className="gx-app-logo-wid">
                <h1>{this.props.controlPanel.COMPANY_NAME}</h1>
                <p>Masuk ke antrian</p>
              </div>
            </div>
            <div className="gx-app-login-content gx-loader-pos-rel">
              <Form
                onFinish={this.handleFinish}
                onFinishFailed={this.handleFinishFailed}
                className="gx-signin-form gx-form-row0"
              >
                <Form.Item
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Kata penggunan wajib diisi',
                    },
                  ]}
                >
                  <Input placeholder="Kata Pengguna" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Kata sandi wajib diisi',
                    },
                  ]}
                >
                  <Input.Password placeholder="Kata Sandi" />
                </Form.Item>
                <Form.Item>
                  <Button
                    loading={this.state.loading}
                    type="primary"
                    className="gx-mb-0"
                    htmlType="submit"
                    icon={<LoginOutlined />}
                  >
                    Masuk
                  </Button>
                </Form.Item>
              </Form>
              <InfoView />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Login.Layout = authLayout

const mapStateToProps = null

export default connect(mapStateToProps, {
  setHostname,
})(Login)
