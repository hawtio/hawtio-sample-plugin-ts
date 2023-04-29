import { CardBody, Form, FormGroup, FormSection, Text, TextInput } from '@patternfly/react-core'
import React, { useState } from 'react'
import { preferencesService } from './preferences-service'

export const CustomTreePreferences: React.FunctionComponent = () => {
  const [domain, setDomain] = useState(preferencesService.loadDomain())

  const onDomainChanged = (value: string) => {
    setDomain(value)
    preferencesService.saveDomain(value)
  }

  return (
    <CardBody>
      <Form isHorizontal>
        <FormSection title='Custom Tree Plugin' titleElement='h2'>
          <Text component='p'>Preferences view for Custom Tree plugin.</Text>
          <FormGroup
            label='Domain'
            fieldId='custom-tree-prefs-form-domain'
            helperText='The target domain to activate the plugin. This is just for demonstration purposes, as the plugin may not work with other domains than `java.lang`.'
          >
            <TextInput id='custom-tree-prefs-form-domain-input' type='text' value={domain} onChange={onDomainChanged} />
          </FormGroup>
        </FormSection>
      </Form>
    </CardBody>
  )
}
