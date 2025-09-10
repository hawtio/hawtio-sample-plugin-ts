import { HawtioPlugin, hawtio, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { AiPreferences } from './AiPreferences'
import { AiView } from './AiView'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'

export const ai: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: AiView,
    isActive: async () => true
  })

  helpRegistry.add(pluginName, pluginTitle, help, 103)
  preferencesRegistry.add(pluginName, pluginTitle, AiPreferences, 103)
}
