import { BaseLanguageModelInput } from '@langchain/core/language_models/base'
import { AIMessage, AIMessageChunk, BaseMessage, HumanMessage, MessageContent } from '@langchain/core/messages'
import { ToolCall } from '@langchain/core/messages/tool'
import { Runnable } from '@langchain/core/runnables'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOllama, ChatOllamaCallOptions } from "@langchain/ollama"
import { aiPreferencesService } from './ai-preferences-service'
import { AiModel, MODELS } from './model'


const TOOLS: DynamicStructuredTool[] = [] as const
const TOOLS_BY_NAME: Record<string, DynamicStructuredTool> = TOOLS.reduce((acc, tool) => {
  acc[tool.name] = tool
  return acc
}, {} as Record<string, DynamicStructuredTool>)

export type BotMessage = {
  content: string | AIMessage
  think?: string | undefined
}

export interface IAiService {
  reset(model: AiModel): void
  chat(message: string): Promise<AIMessage | string>
  invokeTools(toolCalls: ToolCall[]): Promise<AIMessage | string>
  toBotMessage(message: MessageContent): BotMessage
}

class AiService implements IAiService {
  private model: AiModel = MODELS[0]!
  private llm?: ChatGoogleGenerativeAI | ChatOllama = undefined
  private llmWithTools?: Runnable<BaseLanguageModelInput, AIMessageChunk, ChatOllamaCallOptions> = undefined
  private messages: BaseMessage[] = []

  reset(model: AiModel) {
    const { token } = aiPreferencesService.loadOptions()
    this.model = model
    switch (model.type) {
      case 'google-genai':
        this.llm = new ChatGoogleGenerativeAI({ model: this.model.id, apiKey: token, temperature: 0 })
        break
      case 'ollama':
      default:
        this.llm = new ChatOllama({ model: this.model.id })
    }
    if (model.tool) {
      this.llmWithTools = this.llm.bindTools(TOOLS)
    }
  }

  async chat(message: string): Promise<AIMessage | string> {
    console.log('Chatting with', this.model.id, ':', message)
    this.messages.push(new HumanMessage(message))
    try {
      let answer: AIMessageChunk
      if (this.llmWithTools) {
        answer = await this.llmWithTools.invoke(this.messages)
      } else {
        answer = await this.llm!.invoke(this.messages)
      }

      if (answer.tool_calls && answer.tool_calls.length > 0) {
        console.log('🛠️  calls:', answer.tool_calls)
      }
      console.log('Answer:', answer)
      this.messages.push(answer)
      return answer
    } catch (error) {
      console.error('Error while chatting:', error)
      return String(error)
    }
  }

  toBotMessage(message: MessageContent): BotMessage {
    let str = ''
    if (Array.isArray(message)) {
      const complex = message[0]
      console.log('Complex message:', complex)
      complex?.type === 'text' && (str = complex.text)
    } else {
      str = message as string
    }
    // extract inside <think>...</think> from message
    const think = str.match(/<think>(.*?)<\/think>/s)?.[1]?.trim()
    // remove <think>...</think> from message
    const content = str.replace(/<think>.*?<\/think>/s, '')
    console.log('Response - content:', content, 'think:', think)
    return { content, think }
  }

  async invokeTools(toolCalls: ToolCall[]): Promise<AIMessage | string> {
    if (!this.llmWithTools) {
      return 'Tool invocation not supported'
    }

    for (const call of toolCalls) {
      console.log('🛠️  Call:', call.name, JSON.stringify(call.args))
      const selectedTool = TOOLS_BY_NAME[call.name]
      const toolAnswer = await selectedTool?.invoke(call)
      if (toolAnswer) {
        console.log('🛠️  ' + call.name + ':', toolAnswer)
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
}

export const aiService = new AiService()
