import React from 'react'
import QueueLayout from './MainLayout'

// eslint-disable-next-line react/display-name
export default (ComposedComponent) => (props) => (
  <QueueLayout>
    <ComposedComponent {...props} />
  </QueueLayout>
)
