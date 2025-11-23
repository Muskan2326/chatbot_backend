import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MENTAL_HEALTH_SYSTEM_PROMPT = `You are a compassionate mental health support chatbot. Your role is to:
- Listen empathetically and validate feelings
- Provide emotional support and coping strategies
- Encourage professional help when needed
- Never diagnose or prescribe treatment
- Maintain a warm, supportive, and non-judgmental tone
- Keep responses concise and helpful

If someone is in crisis, acknowledge their pain and strongly encourage them to contact emergency services or a crisis hotline.`;

export async function moderateContent(message) {
  try {
    const moderation = await openai.moderations.create({
      input: message,
      model: 'text-moderation-latest',
    });

    const result = moderation.results[0];
    return {
      flagged: result.flagged,
      categories: result.categories,
    };
  } catch (error) {
    console.error('Moderation error:', error);
    throw new Error('Failed to moderate content');
  }
}

export async function classifyEmotion(message) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an emotion classification system. Analyze the user's message and classify their emotional state into exactly ONE of these categories:
- "Calm" - relaxed, peaceful, positive emotions
- "Mild Stress" - some worry, minor concerns, manageable anxiety
- "High Stress" - significant distress, strong negative emotions, acute anxiety
- "Crisis" - urgent situation, self-harm mentions, severe distress, suicidal ideation

Respond with ONLY the emotion category name, nothing else.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const emotion = response.choices[0].message.content.trim();
    const validEmotions = ['Calm', 'Mild Stress', 'High Stress', 'Crisis'];

    return validEmotions.includes(emotion) ? emotion : 'Mild Stress';
  } catch (error) {
    console.error('Emotion classification error:', error);
    return 'Mild Stress';
  }
}

export async function generateChatResponse(conversationHistory) {
  try {
    const messages = [
      { role: 'system', content: MENTAL_HEALTH_SYSTEM_PROMPT },
      ...conversationHistory,
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Chat response error:', error);
    throw new Error('Failed to generate chat response');
  }
}

export function getCrisisMessage() {
  return `I understand you're going through a very difficult time. Your safety is the top priority right now.

Please reach out to a crisis support service immediately:

• National Suicide Prevention Lifeline: 988 (US)
• Crisis Text Line: Text HOME to 741741
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

These services are available 24/7 with trained professionals who can provide immediate support. You don't have to face this alone.`;
}
