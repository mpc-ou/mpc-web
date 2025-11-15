-- =========================================================
-- 🔧 RESET DATABASE
-- =========================================================
DROP TABLE IF EXISTS 
  member_in_department,
  department,
  project_members,
  project,
  project_category,
  post_authors,
  post,
  category,
  achievements,
  achievement_members,
  events,
  event_introduction,
  attachment,
  alert_bar,
  faq,
  page_config,
  page_outstanding_images,
  roles
CASCADE;

DROP TABLE IF EXISTS member CASCADE;

-- =========================================================
-- ⚙️ EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 🧍 MEMBER (liên kết Supabase Auth)
-- =========================================================
CREATE TABLE member (
    member_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    avatar TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    github TEXT,
    facebook TEXT,
    join_at TIMESTAMP DEFAULT now(),
    birthday DATE,
    fact TEXT,
    address TEXT,
    profiles JSONB,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_use_custom_page BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_member_auth_id ON member(auth_id);
CREATE INDEX idx_member_email ON member(email);

-- =========================================================
-- 🧭 DEPARTMENT
-- =========================================================
CREATE TABLE department (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT
);

-- =========================================================
-- 🧩 ROLE
-- =========================================================
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- Thêm sẵn vài role mặc định
INSERT INTO roles (name, description) VALUES
('President', 'Chủ nhiệm CLB'),
('MediaLeader', 'Trưởng ban Truyền thông'),
('DevLeader', 'Trưởng ban Kỹ thuật'),
('LeaderLogistic', 'Trưởng ban Hậu cần'),
('Adviser', 'Cố vấn CLB'),
('Member', 'Thành viên chính thức');

-- =========================================================
-- 👥 MEMBER - DEPARTMENT
-- =========================================================
CREATE TABLE member_in_department (
    member_id UUID REFERENCES member(member_id) ON DELETE CASCADE,
    department_id UUID REFERENCES department(department_id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(role_id),
    apply_at TIMESTAMP DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (member_id, department_id)
);

-- =========================================================
-- 📂 ATTACHMENT
-- =========================================================
CREATE TABLE attachment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT,
    url TEXT,
    type TEXT,
    upload_at TIMESTAMP DEFAULT now(),
    upload_by UUID REFERENCES member(member_id)
);

-- =========================================================
-- 🏷️ CATEGORY
-- =========================================================
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT
);

-- =========================================================
-- 📰 POST
-- =========================================================
CREATE TABLE post (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    tags TEXT[],
    summary TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE post_authors (
    post_id UUID REFERENCES post(id) ON DELETE CASCADE,
    member_id UUID REFERENCES member(member_id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, member_id)
);

CREATE INDEX idx_post_title ON post(title);

-- =========================================================
-- 💼 PROJECT
-- =========================================================
CREATE TABLE project_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT
);

CREATE TABLE project (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    description TEXT,
    category_id UUID REFERENCES project_category(id),
    github_url TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE project_members (
    project_id UUID REFERENCES project(id) ON DELETE CASCADE,
    member_id UUID REFERENCES member(member_id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, member_id)
);

CREATE INDEX idx_project_name ON project(name);

-- =========================================================
-- 🏆 ACHIEVEMENTS
-- =========================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT,
    label TEXT,
    tags TEXT[],
    time TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE achievement_members (
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    member_id UUID REFERENCES member(member_id),
    PRIMARY KEY (achievement_id, member_id)
);

-- =========================================================
-- 🎉 EVENTS
-- =========================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    time_start TIMESTAMP,
    time_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE event_introduction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    promotions JSONB,
    content TEXT,
    awards TEXT[],
    tags TEXT[]
);

-- =========================================================
-- ⚡ ALERT BAR / FAQ / PAGE CONFIG
-- =========================================================
CREATE TABLE alert_bar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    icon_type TEXT,
    url TEXT,
    created_by UUID REFERENCES member(member_id)
);

CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    q TEXT,
    a TEXT,
    created_by UUID REFERENCES member(member_id)
);

CREATE TABLE page_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_name TEXT,
    page_description TEXT
);

CREATE TABLE page_outstanding_images (
    page_id UUID REFERENCES page_config(id),
    attachment_id UUID REFERENCES attachment(id),
    PRIMARY KEY (page_id, attachment_id)
);

-- =========================================================
-- 🔒 ENABLE RLS + POLICY
-- =========================================================
ALTER TABLE member ENABLE ROW LEVEL SECURITY;
ALTER TABLE department ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_in_department ENABLE ROW LEVEL SECURITY;
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE post ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_introduction ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachment ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_bar ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_outstanding_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

-- MEMBER POLICIES
CREATE POLICY "Allow logged-in read members"
ON member
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow user insert own record"
ON member
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Allow user update own record"
ON member
FOR UPDATE
TO authenticated
USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- PUBLIC READ ACCESS
CREATE POLICY "Public read project"
ON project
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read post"
ON post
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read achievements"
ON achievements
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read events"
ON events
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read faq"
ON faq
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read page config"
ON page_config
FOR SELECT
TO public
USING (true);

CREATE POLICY "Public read attachments"
ON attachment
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated can upload attachments"
ON attachment
FOR INSERT
TO authenticated
WITH CHECK (true);
