import { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import { AIMessage, AIMessageChunk, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ToolCall } from '@langchain/core/messages/tool'
import { Runnable } from '@langchain/core/runnables'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOllama, ChatOllamaCallOptions } from "@langchain/ollama"
import { AiModel, MODELS } from './ai-model'
import { aiPreferencesService } from './ai-preferences-service'
import { log } from './globals'


const TOOLS: DynamicStructuredTool[] = [] as const
const TOOLS_BY_NAME: Record<string, DynamicStructuredTool> = TOOLS.reduce((acc, tool) => {
  acc[tool.name] = tool
  return acc
}, {} as Record<string, DynamicStructuredTool>)

export type MessageWithThink = {
  content: string
  think?: string
}

export interface IAiService {
  reset(model: AiModel): void
  chat(message: string): Promise<AIMessage | string>
  invokeTools(toolCalls: ToolCall[]): Promise<AIMessage | string>
  toBotMessage(message: string): MessageWithThink
}

class AiService implements IAiService {
  private model?: AiModel
  private llm?: ChatGoogleGenerativeAI | ChatOllama
  private llmWithTools?: Runnable<BaseLanguageModelInput, AIMessageChunk, ChatOllamaCallOptions>
  private messages: BaseMessage[] = []

  reset(model: AiModel): void {
    if (this.model && this.model.id === model.id && this.llm && (!model.tool || this.llmWithTools)) {
      return
    }
    log.info('AI model to use:', model.id)
    // Should we keep the message history when changing model?
    //this.messages = []
    const { token } = aiPreferencesService.loadOptions()
    this.model = model
    try {
      switch (this.model.type) {
        case 'google-genai':
          this.llm = new ChatGoogleGenerativeAI({
            model: this.model.id,
            apiKey: token,
            temperature: 0,
            disableStreaming: true,
          })
          break
        case 'ollama':
        default:
          this.llm = new ChatOllama({
            model: this.model.id,
            streaming: false,
          })
      }
    } catch (error) {
      // Mostly token is missing/invalid
      log.warn('Error initialising AI model:', error)
    }
    if (TOOLS.length !== 0 && this.model.tool) {
      this.llmWithTools = this.llm?.bindTools(TOOLS)
    }
  }

  private getLlm(): ChatGoogleGenerativeAI | ChatOllama | Runnable<BaseLanguageModelInput, AIMessageChunk, ChatOllamaCallOptions> | undefined {
    if (!this.model || !this.llm) {
      const { model } = aiPreferencesService.loadOptions()
      const modelObj = MODELS.find(m => m.id === model) ?? MODELS[0]!
      this.reset(modelObj)
    }
    if (this.llmWithTools) {
      return this.llmWithTools
    }
    return this.llm
  }

  async invoke(messages: BaseMessage[]): Promise<AIMessage | string> {
    // Lazy init model and llm
    const llm = this.getLlm()
    log.debug('Chatting with', this.model?.id, ':', messages)
    try {
      let answer: AIMessageChunk
      if (!llm) {
        throw new Error('AI model not configured')
      }
      answer = await llm.invoke(messages)

      if (answer.tool_calls && answer.tool_calls.length > 0) {
        log.debug('🛠️  calls:', answer.tool_calls)
      }
      log.debug('Answer:', answer)
      return answer
    } catch (error) {
      log.error('Error while chatting:', error)
      return String(error)
    }
  }

  async chat(message: string): Promise<AIMessage | string> {
    return this.invoke([new HumanMessage(message)])
  }

  toBotMessage(message: string): MessageWithThink {
    // extract inside <think>...</think> from message
    const think = message.match(/<think>(.*?)<\/think>/s)?.[1]?.trim()
    // remove <think>...</think> from message
    const content = message.replace(/<think>.*?<\/think>/s, '')
    log.debug('Response - content:', content, 'think:', think)
    return { content, think }
  }

  async invokeTools(toolCalls: ToolCall[]): Promise<AIMessage | string> {
    if (!this.llmWithTools) {
      return 'Tool invocation not supported'
    }

    for (const call of toolCalls) {
      log.debug('🛠️  Call:', call.name, JSON.stringify(call.args))
      const selectedTool = TOOLS_BY_NAME[call.name]
      const toolAnswer = await selectedTool?.invoke(call)
      if (toolAnswer) {
        log.debug('🛠️  ' + call.name + ':', toolAnswer)
        this.messages.push(toolAnswer)
      }
    }
    const finalAnswer = await this.llmWithTools.invoke(this.messages)
    if (finalAnswer) {
      this.messages.push(finalAnswer)
    }
    console.debug('Messages>>', this.messages)
    return finalAnswer
  }

  async diagnose(objectName: string, attributes: string): Promise<AIMessage | string> {
    const system = `You are a helpful assistant diagnosing a JMX MBean based on its attribute values.
Given the following ObjectName and attribute values, identify any potential issues or anomalies.
Provide suggestions for further investigation or resolution if applicable.
Respond in a concise manner.`

    const prompt = `ObjectName: ${objectName}
Attribute values: ${attributes}
What potential issues or anomalies do you see?`

    return this.invoke([new SystemMessage(system), new HumanMessage(prompt)])
  }
}

export const aiService = new AiService()
