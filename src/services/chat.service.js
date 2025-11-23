import { supabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export async function getOrCreateSession(sessionId) {
  if (!sessionId) {
    sessionId = uuidv4();
  }

  const { data: existingSession } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (existingSession) {
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existingSession.id);

    return { session: existingSession, isNew: false };
  }

  const { data: newSession, error } = await supabase
    .from('chat_sessions')
    .insert({ session_id: sessionId })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create session');
  }

  return { session: newSession, isNew: true };
}

export async function saveMessage(sessionDbId, role, content, emotion = null, flagged = false) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionDbId,
      role,
      content,
      emotion,
      flagged,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to save message');
  }

  return data;
}

export async function getConversationHistory(sessionDbId, limit = 10) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionDbId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error('Failed to retrieve conversation history');
  }

  return data || [];
}
