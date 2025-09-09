import { HawtioPlugin, hawtio, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { AIPreferences } from './AIPreferences'
import { AIView } from './AIView'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'

export const ai: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: AIView,
    isActive: async () => true
  })

  helpRegistry.add(pluginName, pluginTitle, help, 103)
  preferencesRegistry.add(pluginName, pluginTitle, AIPreferences, 103)
}
