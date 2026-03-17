import { CardBody, Content, Form, FormGroup, FormSection, TextInput } from '@patternfly/react-core'
import React, { useState } from 'react'
import { preferencesService } from './preferences-service'

export const CustomTreePreferences: React.FunctionComponent = () => {
  const [domain, setDomain] = useState(preferencesService.loadDomain())

  const onDomainChanged = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setDomain(value)
    preferencesService.saveDomain(value)
  }

  return (
    <CardBody>
      <Form isHorizontal>
        <FormSection title='Custom Tree Plugin' titleElement='h2'>
          <Content component='p'>Preferences view for Custom Tree plugin.</Content>
          <FormGroup
            label='Domain'
            fieldId='custom-tree-prefs-form-domain'
            labelInfo='The target domain to activate the plugin. This is just for demonstration purposes, as the plugin may not work with other domains than `java.lang`.'
          >
            <TextInput id='custom-tree-prefs-form-domain-input' type='text' value={domain} onChange={onDomainChanged} />
          </FormGroup>
        </FormSection>
      </Form>
    </CardBody>
  )
}
