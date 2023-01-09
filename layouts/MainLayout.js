import React, { Component } from 'react'
import { Layout, Row, Col, Typography, Avatar } from 'antd'
import Clock from 'react-live-clock'
import '@/assets/styles/style.min.css'
import { connect } from 'react-redux'
import Head from 'next/head'
import { getControlPanel } from '@/redux/setting/action'

const { Title } = Typography

class QueueLayout extends Component {
  componentDidMount() {
    this.props.getControlPanel()
  }
  render() {
    return (
      <>
        <Head>
          <link
            rel="shortcut icon"
            href={this.props.controlPanelData.FAVICON_WEB}
          />
        </Head>

        <Layout className="queue-container">
          <Row className="queue-header gx-m-0" align="middle">
            <Col span={6} md={2} className="gx-text-center">
              <Avatar
                size={50}
                className="queue-logo"
                src={this.props.controlPanelData.COMPANY_LOGO_SQUARE}
              />
            </Col>
            <Col span={18} md={16}>
              <Title
                className="queue-company-name gx-mb-0 gx-mt-0 gx-text-white"
                level={4}
              >
                {this.props.controlPanelData.COMPANY_NAME}
              </Title>
              <Title
                className="gx-text-white gx-mb-0 gx-mt-0 queue-company-address"
                level={4}
              >
                {this.props.controlPanelData.COMPANY_ADDRESS}
              </Title>
            </Col>
            <Col span={24} md={5} className="gx-text-center hide-in-mobile">
              <Title level={4} className="queue-date gx-text-white gx-mb-0">
                <Clock format={'dddd, DD MMMM YYYY'} />
              </Title>
              <Title level={3} className="gx-text-white gx-mt-0">
                <Clock format={'HH:mm:ss'} ticking={true} />
              </Title>
            </Col>
          </Row>
          {this.props.children}
        </Layout>
      </>
    )
  }
}

const mapStateToProps = ({ setting }) => {
  const { controlPanelData } = setting
  return { controlPanelData }
}

export default connect(mapStateToProps, { getControlPanel })(QueueLayout)
// export default QueueLayout
