import { hawtio, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'
import { SimplePlugin } from './SimplePlugin'
import { SimplePreferences } from './SimplePreferences'

export const registerSimplePlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: SimplePlugin,
    isActive: () => Promise.resolve(true),
  })

  helpRegistry.add(pluginName, pluginTitle, help, 100)
  preferencesRegistry.add(pluginName, pluginTitle, SimplePreferences, 100)
}
