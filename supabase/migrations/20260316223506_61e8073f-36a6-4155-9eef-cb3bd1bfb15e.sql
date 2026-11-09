
-- Allow admins to also insert roles for other users
CREATE POLICY "Admins inserem papéis para outros" ON public.papeis_usuarios
FOR INSERT TO authenticated
WITH CHECK (tem_papel(auth.uid(), 'admin'::papel_usuario));
