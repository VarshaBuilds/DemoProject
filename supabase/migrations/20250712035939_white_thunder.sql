/*
  # StackIt Q&A Platform Database Schema

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `role` (text, default 'user')
      - `avatar_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `questions` - Questions posted by users
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `tags` (text array)
      - `author_id` (uuid, references profiles)
      - `accepted_answer_id` (uuid, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `answers` - Answers to questions
      - `id` (uuid, primary key)
      - `question_id` (uuid, references questions)
      - `content` (text)
      - `author_id` (uuid, references profiles)
      - `is_accepted` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `votes` - Voting system for answers
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `answer_id` (uuid, references answers)
      - `vote_type` (text, 'up' or 'down')
      - `created_at` (timestamp)
    
    - `notifications` - User notifications
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `message` (text)
      - `question_id` (uuid, optional)
      - `answer_id` (uuid, optional)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  accepted_answer_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE NOT NULL,
  vote_type text CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, answer_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES answers(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for accepted_answer_id
ALTER TABLE questions 
ADD CONSTRAINT fk_accepted_answer 
FOREIGN KEY (accepted_answer_id) REFERENCES answers(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Questions policies
CREATE POLICY "Questions are viewable by everyone"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

-- Answers policies
CREATE POLICY "Answers are viewable by everyone"
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert answers"
  ON answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own answers"
  ON answers FOR UPDATE
  USING (auth.uid() = author_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage their own votes"
  ON votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer_id ON votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();