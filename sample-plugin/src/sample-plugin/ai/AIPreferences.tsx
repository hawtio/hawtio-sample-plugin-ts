import { CardBody, Form, FormGroup, FormHelperText, FormSection, HelperText, HelperTextItem, Text, TextInput } from '@patternfly/react-core'
import React, { useState } from 'react'
import { preferencesService } from './preferences-service'

export const AIPreferences: React.FunctionComponent = () => {
  const [domain, setDomain] = useState(preferencesService.loadDomain())

  const onDomainChanged = (value: string) => {
    setDomain(value)
    preferencesService.saveDomain(value)
  }

  return (
    <CardBody>
      <Form isHorizontal>
        <FormSection title='AI Plugin' titleElement='h2'>
          <FormGroup
            fieldId='ai-prefs-form-domain'
            label='Domain'
          >
            <TextInput
              id='ai-prefs-form-domain-input'
              type='text'
              value={domain}
              onChange={(_, value) => onDomainChanged(value)}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  The target domain to activate the plugin. This is just for demonstration purposes, as the plugin may not work with other domains than <code>java.lang</code>.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </FormSection>
      </Form>
    </CardBody>
  )
}
