import { AIProvider, SummaryInput } from './types'
import { GeminiProvider } from './providers/gemini'

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'

let provider: AIProvider | null = null

function getProvider(): AIProvider {
  if (provider) return provider

  if (AI_PROVIDER === 'gemini') {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) throw new Error('GOOGLE_API_KEY not set')
    provider = new GeminiProvider(apiKey)
  } else {
    throw new Error(`Unknown AI provider: ${AI_PROVIDER}`)
  }

  return provider
}

export async function generateSummary(input: SummaryInput): Promise<string> {
  const aiProvider = getProvider()

  const prompt = `Tu es un écrivain de carnet de voyage pour un club moto.
Génère un résumé chaleureux et narratif d'une journée de roadtrip basé sur ces informations:

Notes du jour:
${input.notes || '(aucune note)'}

Anecdotes:
${input.anecdotes.join('\n') || '(aucune anecdote)'}

Lieux visités:
${input.places.map((p) => `- ${p.nom}${p.description ? ': ' + p.description : ''}`).join('\n')}

Crée un résumé court (150-250 mots), en français, qui capture l'esprit de la journée et les souvenirs mémorables.`

  return await aiProvider.generateSummary(prompt)
}
