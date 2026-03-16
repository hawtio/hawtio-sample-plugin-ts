import { configManager, HawtioInitialization, TaskState } from '@hawtio/react/init'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { plugin } from './sample-plugin'

// Hawtio itself creates and tracks initialization tasks, but we can add our own.
configManager.initItem('Loading UI', TaskState.started, 'config')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(<HawtioInitialization verbose={true} />)

import('@hawtio/react').then(async ({ hawtio, registerPlugins }) => {
  // Register builtin plugins 
  registerPlugins()

  // Register the plugin under development
  plugin()

  // hawtio.bootstrap() will wait for all init items to be ready, so we have to finish 'loading'
  // stage of UI. UI will be rendered after bootstrap() returned promise is resolved
  configManager.initItem('Loading UI', TaskState.finished, 'config')

  // Bootstrap Hawtio
  hawtio.bootstrap().then(() => {
    import('@hawtio/react/ui').then(({ Hawtio }) => {
      root.render(
        <React.StrictMode>
          <Hawtio />
        </React.StrictMode>,
      )
    })
  })
})
