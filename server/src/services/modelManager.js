/**
 * Model Manager Service
 * Provides a unified interface for multiple LLM, RAG, and Embedding models.
 * Falls back gracefully to mock responses when API keys are not configured.
 */

// ─── Client Initialisation ────────────────────────────────────────────────────

let openaiClient = null;
let anthropicClient = null;

if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log('✅ OpenAI client initialised (GPT-4, GPT-3.5-Turbo)');
  } catch (e) {
    console.log('⚡ OpenAI init failed:', e.message);
  }
}

if (process.env.ANTHROPIC_API_KEY) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('✅ Anthropic client initialised (Claude 3)');
  } catch (e) {
    console.log('⚡ Anthropic init failed:', e.message);
  }
}

// ─── Model Registry ───────────────────────────────────────────────────────────

const MODEL_REGISTRY = {
  llm: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      description: 'State-of-the-art reasoning with 128K context window.',
      contextWindow: '128K tokens',
      pricing: 'Paid – ~$0.03 / 1K input tokens',
      capabilities: ['Advanced reasoning', 'Code generation', 'Long context'],
      requiresKey: 'OPENAI_API_KEY',
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Fast, cost-effective model. Great default choice.',
      contextWindow: '16K tokens',
      pricing: 'Paid – ~$0.001 / 1K input tokens',
      capabilities: ['Fast responses', 'Cost-effective', 'Reliable'],
      requiresKey: 'OPENAI_API_KEY',
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'anthropic',
      description: 'Anthropic\'s most powerful model for complex tasks.',
      contextWindow: '200K tokens',
      pricing: 'Paid – ~$0.015 / 1K input tokens',
      capabilities: ['Advanced reasoning', 'Nuanced writing', 'Long documents'],
      requiresKey: 'ANTHROPIC_API_KEY',
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      description: 'Balanced performance and cost from Anthropic.',
      contextWindow: '200K tokens',
      pricing: 'Paid – ~$0.003 / 1K input tokens',
      capabilities: ['Balanced performance', 'Good reasoning', 'Efficient'],
      requiresKey: 'ANTHROPIC_API_KEY',
    },
    {
      id: 'llama-2',
      name: 'Llama 2 (70B)',
      provider: 'huggingface',
      description: 'Meta\'s open-source model — privacy-focused, runs locally.',
      contextWindow: '4K tokens',
      pricing: 'Free (open-source)',
      capabilities: ['Open-source', 'Privacy-focused', 'Self-hostable'],
      requiresKey: 'HUGGINGFACE_API_KEY',
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'huggingface',
      description: 'Fast and efficient open-source model from Mistral AI.',
      contextWindow: '8K tokens',
      pricing: 'Free (open-source)',
      capabilities: ['Fast inference', 'Efficient', 'Open-source'],
      requiresKey: 'HUGGINGFACE_API_KEY',
    },
    {
      id: 'gemini-pro',
      name: 'Google Gemini Pro',
      provider: 'google',
      description: 'Google\'s multimodal AI model with strong reasoning.',
      contextWindow: '32K tokens',
      pricing: 'Paid – Google AI pricing',
      capabilities: ['Multimodal', 'Strong reasoning', 'Google ecosystem'],
      requiresKey: 'GOOGLE_GENAI_API_KEY',
    },
  ],
  rag: [
    {
      id: 'langchain',
      name: 'LangChain',
      description: 'Flexible, production-ready RAG framework with extensive integrations.',
      features: ['Flexible pipelines', 'Rich ecosystem', 'Production-ready'],
    },
    {
      id: 'llamaindex',
      name: 'LlamaIndex',
      description: 'Purpose-built data framework for LLM applications and RAG.',
      features: ['Purpose-built for RAG', 'Smart indexing', 'Easy data ingestion'],
    },
  ],
  embedding: [
    {
      id: 'openai-embeddings',
      name: 'OpenAI Embeddings',
      provider: 'openai',
      description: 'High-quality embeddings (text-embedding-3-small/large).',
      dimensions: 1536,
      pricing: 'Paid',
      requiresKey: 'OPENAI_API_KEY',
    },
    {
      id: 'huggingface-embeddings',
      name: 'Hugging Face Embeddings',
      provider: 'huggingface',
      description: 'Open-source sentence transformers — free and self-hostable.',
      dimensions: 768,
      pricing: 'Free',
      requiresKey: 'HUGGINGFACE_API_KEY',
    },
    {
      id: 'cohere-embeddings',
      name: 'Cohere Embeddings',
      provider: 'cohere',
      description: 'Production-ready commercial embeddings from Cohere.',
      dimensions: 1024,
      pricing: 'Paid',
      requiresKey: 'COHERE_API_KEY',
    },
  ],
};

// ─── Availability Helpers ─────────────────────────────────────────────────────

const KEY_MAP = {
  OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
  HUGGINGFACE_API_KEY: !!process.env.HUGGINGFACE_API_KEY,
  GOOGLE_GENAI_API_KEY: !!process.env.GOOGLE_GENAI_API_KEY,
  COHERE_API_KEY: !!process.env.COHERE_API_KEY,
};

const isModelAvailable = (model) => {
  if (!model.requiresKey) return true;
  return !!KEY_MAP[model.requiresKey];
};

const getAvailableModels = () => ({
  llm: MODEL_REGISTRY.llm.map((m) => ({ ...m, available: isModelAvailable(m) })),
  rag: MODEL_REGISTRY.rag.map((m) => ({ ...m, available: true })),
  embedding: MODEL_REGISTRY.embedding.map((m) => ({ ...m, available: isModelAvailable(m) })),
});

// ─── Default / Fallback Resolution ───────────────────────────────────────────

const DEFAULT_LLM = process.env.DEFAULT_LLM_MODEL || 'gpt-3.5-turbo';
const DEFAULT_RAG = process.env.DEFAULT_RAG_FRAMEWORK || 'langchain';
const DEFAULT_EMBEDDING = process.env.DEFAULT_EMBEDDING_MODEL || 'openai-embeddings';

/**
 * Pick the best available LLM model, respecting user preference and falling
 * back gracefully when the preferred model is unavailable.
 */
const resolveModel = (preferredModelId) => {
  const modelId = preferredModelId || DEFAULT_LLM;
  const model = MODEL_REGISTRY.llm.find((m) => m.id === modelId);

  // Model is available – use it
  if (model && isModelAvailable(model)) return model;

  // Preferred model unavailable – try the environment default
  const defaultModel = MODEL_REGISTRY.llm.find((m) => m.id === DEFAULT_LLM);
  if (defaultModel && isModelAvailable(defaultModel)) return defaultModel;

  // Last resort – pick the first available model
  const fallback = MODEL_REGISTRY.llm.find(isModelAvailable);
  return fallback || null; // null → mock responses
};

// ─── OpenAI Calls ─────────────────────────────────────────────────────────────

const callOpenAI = async (modelId, messages, options = {}) => {
  if (!openaiClient) throw new Error('OpenAI client not initialised');
  const response = await openaiClient.chat.completions.create({
    model: modelId,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 800,
  });
  return response.choices[0].message.content;
};

// ─── Anthropic Calls ──────────────────────────────────────────────────────────

const callAnthropic = async (modelId, systemPrompt, userMessage, options = {}) => {
  if (!anthropicClient) throw new Error('Anthropic client not initialised');

  // Map our IDs to real Anthropic model strings
  const anthropicModelMap = {
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
  };

  const response = await anthropicClient.messages.create({
    model: anthropicModelMap[modelId] || 'claude-3-sonnet-20240229',
    max_tokens: options.maxTokens ?? 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content[0].text;
};

// ─── Hugging Face Calls ───────────────────────────────────────────────────────

const callHuggingFace = async (modelId, prompt, options = {}) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error('Hugging Face API key not configured');

  const hfModelMap = {
    'llama-2': 'meta-llama/Llama-2-70b-chat-hf',
    'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.2',
  };

  const hfModel = hfModelMap[modelId] || 'mistralai/Mistral-7B-Instruct-v0.2';

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${hfModel}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: options.maxTokens ?? 500,
          temperature: options.temperature ?? 0.7,
          return_full_text: false,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Hugging Face API error: ${err}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data[0]?.generated_text : data?.generated_text || '';
};

// ─── Google Gemini Calls ──────────────────────────────────────────────────────

const callGemini = async (prompt, options = {}) => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error('Google GenAI API key not configured');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 800,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

// ─── Unified Dispatch ─────────────────────────────────────────────────────────

/**
 * Dispatch a prompt to the appropriate provider based on the resolved model.
 * @param {object} model        - Model descriptor from MODEL_REGISTRY.llm
 * @param {string} systemPrompt - System / instruction prompt
 * @param {string} userPrompt   - User message
 * @param {object} options      - Extra options (temperature, maxTokens, …)
 * @returns {Promise<string>}   - The model's text response
 */
const dispatchToModel = async (model, systemPrompt, userPrompt, options = {}) => {
  switch (model.provider) {
    case 'openai':
      return callOpenAI(
        model.id,
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        options
      );

    case 'anthropic':
      return callAnthropic(model.id, systemPrompt, userPrompt, options);

    case 'huggingface': {
      // HF models are instruction-tuned – combine prompts into a single string
      const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`;
      return callHuggingFace(model.id, fullPrompt, options);
    }

    case 'google': {
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      return callGemini(fullPrompt, options);
    }

    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
};

// ─── Mock Responses (no API keys configured) ─────────────────────────────────
// Re-use the rich mock data from the original openai.js service as fallback
// responses when no real API key is available for any provider.
const {
  simulateDecision: mockSimulateDecision,
  generateTwinResponse: mockTwinResponse,
  generateTwinProfile: mockGenerateProfile,
} = require('./openai');

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Simulate a life decision and return scenario objects.
 * Supports any configured LLM; falls back to rich mock data.
 */
const simulateDecision = async (decision, userProfile, preferredModelId) => {
  const model = resolveModel(preferredModelId);

  if (!model) {
    return mockSimulateDecision(decision, userProfile);
  }

  const profileContext = userProfile
    ? `User personality: communicationStyle="${userProfile.communicationStyle}", tone="${userProfile.tone}", preferences=[${userProfile.preferences?.join(', ')}]`
    : '';

  const systemPrompt = `You are a life simulation AI. ${profileContext}. Generate personalised decision scenarios as a valid JSON array only — no other text, no markdown.`;
  const userPrompt = `Decision to simulate: "${decision}"\n\nGenerate 3-5 scenarios as a JSON array. Each scenario must have:\n- title (string)\n- shortTerm (string, 1-2 sentences)\n- longTerm (string, 1-2 sentences)\n- risks (array of 2-3 strings)\n- opportunities (array of 2-3 strings)\n- score (integer 0-100)\n\nReturn ONLY the JSON array, starting with [.`;

  try {
    const raw = await dispatchToModel(model, systemPrompt, userPrompt, { maxTokens: 1800 });
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch (err) {
    console.error(`[modelManager] simulateDecision error (${model.id}):`, err.message);
  }

  return mockSimulateDecision(decision, userProfile);
};

/**
 * Generate a twin/advisor chat response.
 */
const generateTwinResponse = async (message, mode, userProfile, preferredModelId) => {
  const model = resolveModel(preferredModelId);

  if (!model) {
    return mockTwinResponse(message, mode, userProfile);
  }

  const profileContext = userProfile
    ? `User personality: communicationStyle=${userProfile.communicationStyle}, tone=${userProfile.tone}, preferences=${userProfile.preferences?.join(', ')}, habits=${userProfile.habits?.join(', ')}`
    : '';

  const systemPrompt =
    mode === 'twin'
      ? `You are the AI digital twin of the user. You think and communicate exactly like them. Mirror their personality precisely. ${profileContext}. Respond authentically in first person as if you ARE them.`
      : `You are an AI life advisor — the user's wise, data-driven future self. ${profileContext}. Give strategic, actionable life guidance. Be direct, insightful, and specific.`;

  try {
    return await dispatchToModel(model, systemPrompt, message, { maxTokens: 500, temperature: 0.8 });
  } catch (err) {
    console.error(`[modelManager] generateTwinResponse error (${model.id}):`, err.message);
    return mockTwinResponse(message, mode, userProfile);
  }
};

/**
 * Analyse training data and return a personality profile object.
 */
const generateTwinProfile = async (trainingData, preferredModelId) => {
  const model = resolveModel(preferredModelId);

  if (!model) {
    return mockGenerateProfile(trainingData);
  }

  const systemPrompt =
    'Analyse the user communication data and extract their personality profile. Return only valid JSON.';
  const userPrompt = `Based on these user messages: ${JSON.stringify(trainingData)}\n\nReturn a JSON object with:\n- communicationStyle (string: analytical/creative/empathetic/direct/strategic)\n- tone (string: professional/casual/formal/warm/energetic)\n- preferences (array of 3-4 strings describing what they value)\n- habits (array of 3-4 strings describing their behavioural patterns)\n\nReturn ONLY the JSON object.`;

  try {
    const raw = await dispatchToModel(model, systemPrompt, userPrompt, { maxTokens: 300, temperature: 0.5 });
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (err) {
    console.error(`[modelManager] generateTwinProfile error (${model.id}):`, err.message);
  }

  return mockGenerateProfile(trainingData);
};

module.exports = {
  MODEL_REGISTRY,
  getAvailableModels,
  resolveModel,
  simulateDecision,
  generateTwinResponse,
  generateTwinProfile,
};
