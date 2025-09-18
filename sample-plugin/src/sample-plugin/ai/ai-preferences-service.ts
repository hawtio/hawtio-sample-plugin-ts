import { aiService } from './ai-service'
import { MODELS } from './ai-model'

export const STORAGE_KEY_PREFERENCES = 'ai.preferences'

export type AiOptions = {
  model: string
  token?: string
}

export const DEFAULT_OPTIONS: AiOptions = {
  model: MODELS[0]!.id,
} as const

export interface IAiPreferencesService {
  loadOptions(): AiOptions
  saveOptions(options: Partial<AiOptions>): void
}

class AiPreferencesService implements IAiPreferencesService {
  loadOptions(): AiOptions {
    const item = localStorage.getItem(STORAGE_KEY_PREFERENCES)
    const savedOptions = item ? JSON.parse(item) : {}
    return { ...DEFAULT_OPTIONS, ...savedOptions }
  }

  saveOptions(options: Partial<AiOptions>) {
    const updated = { ...this.loadOptions(), ...options }
    localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(updated))
    if (options.model) {
      const modelObj = MODELS.find(m => m.id === options.model)
      if (modelObj) {
        aiService.reset(modelObj)
      }
    }
  }
}

export const aiPreferencesService = new AiPreferencesService()
