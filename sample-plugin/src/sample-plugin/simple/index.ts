import { HawtioPlugin, hawtio, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { SimplePlugin } from './SimplePlugin'
import { SimplePreferences } from './SimplePreferences'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'

export const simple: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: SimplePlugin,
    isActive: async () => true,
  })

  helpRegistry.add(pluginName, pluginTitle, help, 101)
  preferencesRegistry.add(pluginName, pluginTitle, SimplePreferences, 101)
}
