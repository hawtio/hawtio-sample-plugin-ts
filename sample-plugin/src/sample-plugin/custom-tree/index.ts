import { HawtioPlugin, hawtio, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { CustomTree } from './CustomTree'
import { CustomTreePreferences } from './CustomTreePreferences'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'

export const customTree: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: CustomTree,
    isActive: async () => true,
  })

  helpRegistry.add(pluginName, pluginTitle, help, 102)
  preferencesRegistry.add(pluginName, pluginTitle, CustomTreePreferences, 102)
}
