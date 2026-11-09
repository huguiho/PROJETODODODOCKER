
-- Fix: allow new users to insert their own role on signup
DROP POLICY IF EXISTS "Admins inserem papéis" ON public.papeis_usuarios;
CREATE POLICY "Usuários inserem próprio papel" ON public.papeis_usuarios
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix missing role for taynaraakemi2018@gmail.com
INSERT INTO public.papeis_usuarios (user_id, papel)
VALUES ('559519cd-6497-4e8a-90ea-9e7b4f200c4e', 'operador')
ON CONFLICT (user_id, papel) DO NOTHING;

-- Fix admin@adega.com to be admin
UPDATE public.papeis_usuarios
SET papel = 'admin'
WHERE user_id = '6eb32108-3a47-48d8-9f12-297f412ac981';
