CREATE TABLE IF NOT EXISTS study_group_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  upvotes INTEGER DEFAULT 0,
  is_solved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_group_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES study_group_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_best BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_group_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sg_questions_group ON study_group_questions(group_id);
CREATE INDEX IF NOT EXISTS idx_sg_answers_question ON study_group_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_sg_activity_group ON study_group_activity(group_id);

ALTER TABLE study_group_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read questions" ON study_group_questions
  FOR SELECT USING (group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can create questions" ON study_group_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id AND group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can update questions" ON study_group_questions
  FOR UPDATE USING (group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can read answers" ON study_group_answers
  FOR SELECT USING (question_id IN (SELECT id FROM study_group_questions WHERE group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())));

CREATE POLICY "Members can create answers" ON study_group_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update answers" ON study_group_answers
  FOR UPDATE USING (question_id IN (SELECT id FROM study_group_questions WHERE group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())));

CREATE POLICY "Members can read activity" ON study_group_activity
  FOR SELECT USING (group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()));

CREATE POLICY "Members can log activity" ON study_group_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id AND group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid()));
