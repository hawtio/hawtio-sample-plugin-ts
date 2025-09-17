import { Button, CardBody, Form, FormGroup, FormSection, FormSelect, FormSelectOption, InputGroup, InputGroupItem, TextInput } from '@patternfly/react-core'
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon'
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon'
import React, { useState } from 'react'
import { AiOptions, aiPreferencesService, } from './ai-preferences-service'
import { MODELS } from './model'

export const AiPreferences: React.FunctionComponent = () => {
  const [options, setOptions] = useState(aiPreferencesService.loadOptions())
  const [passwordHidden, setPasswordHidden] = useState(true)

  const updateOptions = (updated: Partial<AiOptions>) => {
    aiPreferencesService.saveOptions(updated)
    setOptions({ ...options, ...updated })
  }

  return (
    <CardBody>
      <Form isHorizontal>
        <FormSection title='AI' titleElement='h2'>
          <FormGroup
            fieldId='ai-prefs-form-model'
            label='Model to use'
          >
            <FormSelect
              id='ai-prefs-form-model-input'
              aria-label='Form Select Model'
              value={options.model}
              onChange={(_, model) => updateOptions({ model })}>
              {MODELS.map(m => <FormSelectOption key={m.id} value={m.id} label={`${m.name} (${m.type})`} />)}
            </FormSelect>
          </FormGroup>
          <FormGroup
            fieldId='ai-prefs-form-token'
            label='(optional) Token for the model'
          >
            <InputGroup>
              <InputGroupItem isFill>
                <TextInput
                  id='ai-prefs-form-token-input'
                  aria-label='Form Select Token'
                  type={passwordHidden ? 'password' : 'text'}
                  value={options.token}
                  onChange={(_, token) => updateOptions({ token })}
                />
              </InputGroupItem>
              <InputGroupItem>
                <Button
                  variant='control'
                  onClick={() => setPasswordHidden(!passwordHidden)}
                  aria-label={passwordHidden ? 'Show password' : 'Hide password'}
                >
                  {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
                </Button>
              </InputGroupItem>
            </InputGroup>
          </FormGroup>
        </FormSection>
      </Form>
    </CardBody>
  )
}
