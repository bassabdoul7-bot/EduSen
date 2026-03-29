-- ============================================
-- STUDY GROUPS - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Study Groups table
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT DEFAULT '',
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 50,
  is_private BOOLEAN DEFAULT false,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Study Group Members
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 3. Study Group Messages
CREATE TABLE IF NOT EXISTS study_group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'file', 'announcement')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Study Group Resources
CREATE TABLE IF NOT EXISTS study_group_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT DEFAULT 'link',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Study Group Sessions
CREATE TABLE IF NOT EXISTS study_group_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_study_groups_subject ON study_groups(subject);
CREATE INDEX IF NOT EXISTS idx_study_groups_invite_code ON study_groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user ON study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_messages_group ON study_group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_resources_group ON study_group_resources(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_sessions_group ON study_group_sessions(group_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_sessions ENABLE ROW LEVEL SECURITY;

-- study_groups: anyone can read public groups, only creator can update/delete
CREATE POLICY "Public groups are viewable by everyone" ON study_groups
  FOR SELECT USING (is_private = false OR creator_id = auth.uid() OR id IN (
    SELECT group_id FROM study_group_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can create groups" ON study_groups
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their groups" ON study_groups
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their groups" ON study_groups
  FOR DELETE USING (auth.uid() = creator_id);

-- study_group_members: members can view, users can join/leave
CREATE POLICY "Members are viewable by group members" ON study_group_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join groups" ON study_group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave or admins can remove" ON study_group_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_group_members.group_id AND user_id = auth.uid() AND role = 'admin')
  );

-- study_group_messages: members can read/write
CREATE POLICY "Group members can read messages" ON study_group_messages
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Group members can send messages" ON study_group_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own messages" ON study_group_messages
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update messages (pin)" ON study_group_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_group_messages.group_id AND user_id = auth.uid() AND role = 'admin')
  );

-- study_group_resources: members can read/write
CREATE POLICY "Group members can read resources" ON study_group_resources
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Group members can add resources" ON study_group_resources
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own resources" ON study_group_resources
  FOR DELETE USING (auth.uid() = user_id);

-- study_group_sessions: members can read, members can create
CREATE POLICY "Group members can read sessions" ON study_group_sessions
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Group members can create sessions" ON study_group_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id AND
    group_id IN (SELECT group_id FROM study_group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Creators can update sessions" ON study_group_sessions
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete sessions" ON study_group_sessions
  FOR DELETE USING (auth.uid() = creator_id);

-- ============================================
-- ENABLE REALTIME for messages
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE study_group_messages;
