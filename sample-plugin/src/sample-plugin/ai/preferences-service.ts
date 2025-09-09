const STORAGE_KEY_DOMAIN = 'sample-plugin.custom-tree.domain'

class PreferencesService {
  saveDomain(domain: string) {
    localStorage.setItem(STORAGE_KEY_DOMAIN, domain)
  }

  loadDomain(): string {
    return localStorage.getItem(STORAGE_KEY_DOMAIN) || 'java.lang'
  }
}

export const preferencesService = new PreferencesService()
