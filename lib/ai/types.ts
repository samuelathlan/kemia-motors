export interface AIProvider {
  generateSummary(prompt: string): Promise<string>
}

export interface SummaryInput {
  notes: string
  anecdotes: string[]
  places: Array<{ nom: string; description?: string }>
}
