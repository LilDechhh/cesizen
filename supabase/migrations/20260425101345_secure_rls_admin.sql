-- 1. Fonction de vérification (Admin = role_id 2)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role INT;
BEGIN
  SELECT role_id INTO user_role
  FROM public.utilisateur
  WHERE email = (auth.jwt() ->> 'email');
  
  RETURN COALESCE(user_role, 1) = 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Nettoyage des anciennes politiques permissives
DROP POLICY IF EXISTS "Modifier par les admins" ON "public"."info_articles";
DROP POLICY IF EXISTS "Modifier ressources" ON "public"."info_articles";
DROP POLICY IF EXISTS "Suppression pour les admins" ON "public"."info_articles";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."info_articles";

-- 3. Nouvelles politiques restrictives (CRUD)
CREATE POLICY "Admins peuvent créer des articles"
ON "public"."info_articles"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent modifier des articles"
ON "public"."info_articles"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins peuvent supprimer des articles"
ON "public"."info_articles"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (public.is_admin());