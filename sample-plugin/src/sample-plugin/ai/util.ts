
export function isObject(value: unknown): value is object {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

export function stringSorter(a: string, b: string, sortDesc?: boolean): number {
  let res = a.localeCompare(b)
  if (sortDesc) {
    res *= -1
  }
  return res
}

export function objectSorter(aValue: unknown, bValue: unknown, sortDesc?: boolean) {
  if (isNumber(aValue)) {
    // Numeric sort
    if (!sortDesc) {
      return (aValue as number) - (bValue as number)
    }
    return (bValue as number) - (aValue as number)
  } else {
    // String sort
    return stringSorter(aValue as string, bValue as string, sortDesc)
  }
}

/**
 * Return true if the string is either null or empty.
 */
export function isBlank(str?: string): boolean {
  if (str === undefined || str === null) {
    return true
  }
  if (typeof str !== 'string') {
    // not null but also not a string...
    return false
  }

  return str.trim().length === 0
}

/**
 * Will format a property to a standard human readable string with its spaces.
 * It will respect MBean and leave it together
 * @param str The property to transform
 * @returns The property with its proper spaces
 */
export function humanizeLabels(str: string): string {
  return str
    .split('-')
    .filter(str => !isBlank(str))
    .map(str => str.replace(/^./, str => str.toUpperCase()))
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
    .replace('M Bean', 'MBean')
    .replace('Mbean', 'MBean')
    .replace(/^./, str => str.toUpperCase())
    .replace(/ +/, ' ')
    .trim()
}

/**
 * Escapes the mbean for Jolokia GET requests.
 *
 * @param mbean the MBean
 */
export function escapeMBean(mbean: string): string {
  return encodeURI(applyJolokiaEscapeRules(mbean))
}

/**
 * Applies the Jolokia escaping rules to the MBean name.
 * See: https://jolokia.org/reference/html/manual/jolokia_protocol.html#_escaping_rules_in_get_requests
 *
 * @param mbean the MBean
 */
function applyJolokiaEscapeRules(mbean: string): string {
  return mbean.replace(/!/g, '!!').replace(/\//g, '!/').replace(/"/g, '!"')
}
