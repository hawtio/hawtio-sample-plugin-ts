import { hawtio, Hawtio, registerPlugins } from '@hawtio/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { plugin } from './sample-plugin'

// Register builtin plugins
registerPlugins()

// Register the plugin under development
plugin()

// Bootstrap Hawtio
hawtio.bootstrap()

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Hawtio />
  </React.StrictMode>,
)
