-- =====================================================
-- TABELA: admins (Administradores)
-- Execute este SQL no Railway para criar a tabela de admins
-- =====================================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,              -- Hash bcrypt
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para admins
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Admin padrão (senha: admin123 - TROCAR EM PRODUÇÃO!)
-- Hash bcrypt de 'admin123'
INSERT INTO admins (email, password, name, active) VALUES 
('admin@titanium.com', '$2a$10$rQnM1lJGxJ8Jv1lK5kqzYuYK9VxhLzHcMvvMqJlF5bCwZvQ8jKxGe', 'Administrador', true)
ON CONFLICT (email) DO NOTHING;
