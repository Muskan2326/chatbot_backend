/*
  # Mental Health Chatbot Database Schema

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key) - unique session identifier
      - `session_id` (text, unique) - client-facing session ID
      - `created_at` (timestamptz) - session creation timestamp
      - `updated_at` (timestamptz) - last activity timestamp
    
    - `chat_messages`
      - `id` (uuid, primary key) - unique message identifier
      - `session_id` (uuid, foreign key) - references chat_sessions
      - `role` (text) - message role: 'user' or 'assistant'
      - `content` (text) - message content
      - `emotion` (text) - detected emotion classification (nullable)
      - `flagged` (boolean) - moderation flag status
      - `created_at` (timestamptz) - message creation timestamp

  2. Security
    - Enable RLS on both tables
    - Public read/write access for the chatbot API (anonymous users)
    - Note: This is a mental health chatbot accessible to anyone seeking support
  
  3. Indexes
    - Index on chat_sessions.session_id for fast lookups
    - Index on chat_messages.session_id for efficient message retrieval
    - Index on chat_messages.created_at for chronological ordering
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  emotion text CHECK (emotion IN ('Calm', 'Mild Stress', 'High Stress', 'Crisis')),
  flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (mental health support chatbot)
-- Sessions policies
CREATE POLICY "Allow public read access to sessions"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to sessions"
  ON chat_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to sessions"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Allow public read access to messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);