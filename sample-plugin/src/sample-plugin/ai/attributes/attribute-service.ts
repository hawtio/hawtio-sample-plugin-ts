import { AttributeValues, eventService, jolokiaService } from '@hawtio/react'
import { JolokiaErrorResponse, JolokiaRequest, JolokiaSuccessResponse, RequestOptions } from 'jolokia.js'
import { log } from '../globals'
import { escapeMBean } from '../util'

class AttributeService {
  private handles: number[] = []

  private requestOptions(): RequestOptions {
    // serializeLong = false
    return {}
  }

  private setupConfig(request: JolokiaRequest): JolokiaRequest {
    // serializeLong = false
    return request
  }

  async read(mbean: string): Promise<AttributeValues> {
    return await jolokiaService.readAttributes(mbean, this.requestOptions())
  }

  async readWithCallback(mbean: string, callback: (attrs: AttributeValues) => void): Promise<void> {
    const attrs = await jolokiaService.readAttributes(mbean, this.requestOptions())
    callback(attrs)
  }

  async register(request: JolokiaRequest, callback: (response: JolokiaSuccessResponse | JolokiaErrorResponse) => void) {
    const handle = await jolokiaService.register(this.setupConfig(request), callback)
    log.debug('Register handle:', handle)
    this.handles.push(handle)
  }

  unregisterAll() {
    log.debug('Unregister all handles:', this.handles)
    this.handles.forEach(handle => jolokiaService.unregister(handle))
    this.handles = []
  }

  async buildUrl(mbean: string, attribute: string): Promise<string> {
    const jolokiaUrl = await jolokiaService.getFullJolokiaUrl()
    return `${jolokiaUrl}/read/${escapeMBean(mbean)}/${attribute}`
  }

  async canInvoke(mbean: string, attribute: string, type: string): Promise<boolean> {
    return true
    /*
    const aclMBean = await rbacService.getACLMBean()
    if (!aclMBean) {
      // Always allow invocation when client-side RBAC is not available
      return true
    }

    const operation = 'canInvoke(java.lang.String,java.lang.String,[Ljava.lang.String;)'
    const args = [mbean, `set${attribute}`, [type]]
    return jolokiaService.execute(aclMBean, operation, args) as Promise<boolean>
    */
  }

  async update(mbeanName: string, attribute: string, value: unknown) {
    await jolokiaService.writeAttribute(mbeanName, attribute, value, this.requestOptions())
    eventService.notify({ type: 'success', message: `Updated attribute: ${attribute}` })
  }

  async bulkRequest(requests: JolokiaRequest[]) {
    return jolokiaService.bulkRequest(requests.map(this.setupConfig))
  }
}

export const attributeService = new AttributeService()
