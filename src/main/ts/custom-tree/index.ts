import { hawtio } from '@hawtio/react'
import { CustomTree } from './CustomTree'
import { log, pluginName, pluginPath, pluginTitle } from './globals'

export const registerCustomTreePlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: CustomTree,
    isActive: () => Promise.resolve(true),
  })
}
