import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider } from '../types'

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async generateSummary(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text()
  }
}
