-- 1. On active le RLS sur la table
ALTER TABLE "public"."utilisateur" ENABLE ROW LEVEL SECURITY;

-- 2. Politique de LECTURE (SELECT) : 
-- L'utilisateur voit son propre profil (via son email), les admins voient tout le monde.
CREATE POLICY "Lecture profil" 
ON "public"."utilisateur" 
FOR SELECT 
TO authenticated 
USING (
  email = (auth.jwt() ->> 'email') OR public.is_admin()
);

-- 3. Politique de MISE A JOUR (UPDATE) :
-- Un utilisateur peut modifier sa propre ligne, et l'admin peut modifier n'importe quelle ligne.
CREATE POLICY "Modification profil" 
ON "public"."utilisateur" 
FOR UPDATE 
TO authenticated 
USING (
  email = (auth.jwt() ->> 'email') OR public.is_admin()
)
WITH CHECK (
  email = (auth.jwt() ->> 'email') OR public.is_admin()
);

-- 4. LE BONUS POUR LE JURY : Le Trigger de protection des colonnes sensibles
-- Empêche un utilisateur classique de modifier son propre 'role_id' ou 'est_actif'
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la personne qui fait l'Update n'est PAS un admin
  IF NOT public.is_admin() THEN
    -- On écrase toute tentative de modification de ces champs sensibles par l'ancienne valeur
    NEW.role_id = OLD.role_id;
    NEW.est_actif = OLD.est_actif;
    NEW.email = OLD.email; -- On protège l'email pour ne pas casser la liaison avec Supabase Auth
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_utilisateur_sensitive_fields
BEFORE UPDATE ON public.utilisateur
FOR EACH ROW
EXECUTE FUNCTION public.prevent_privilege_escalation();

-- 1. On active le RLS sur la table
ALTER TABLE "public"."seance" ENABLE ROW LEVEL SECURITY;

-- 2. Politique de LECTURE (SELECT) :
-- On autorise si l'ID correspond à l'ID de l'utilisateur connecté, ou si on est admin.
CREATE POLICY "Lecture de ses propres seances"
ON "public"."seance"
FOR SELECT
TO authenticated
USING (
  utilisateur_id = (
    SELECT id FROM public.utilisateur WHERE email = (auth.jwt() ->> 'email')
  )
  OR public.is_admin()
);

-- 3. Politique de CRÉATION (INSERT) :
-- Un utilisateur ne peut insérer une séance que pour son propre ID.
CREATE POLICY "Insertion de ses propres seances"
ON "public"."seance"
FOR INSERT
TO authenticated
WITH CHECK (
  utilisateur_id = (
    SELECT id FROM public.utilisateur WHERE email = (auth.jwt() ->> 'email')
  )
);

-- 4. Politique de SUPPRESSION (DELETE) : (Optionnel, au cas où tu ajoutes cette feature plus tard)
CREATE POLICY "Suppression de ses propres seances"
ON "public"."seance"
FOR DELETE
TO authenticated
USING (
  utilisateur_id = (
    SELECT id FROM public.utilisateur WHERE email = (auth.jwt() ->> 'email')
  )
  OR public.is_admin()
);