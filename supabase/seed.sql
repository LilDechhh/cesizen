-- Données locales uniquement
-- Ne jamais utiliser de vraies données personnelles ici

insert into public.role (id, nom)
values
  (1, 'Utilisateur'),
  (2, 'Administrateur')
on conflict (id) do nothing;

insert into public.mode_respiratoire (
  id,
  libelle,
  description,
  temps_inspiration,
  temps_apnee,
  temps_expiration
)
values
  (
    1,
    '[DEV] Cohérence cardiaque 5-5',
    'Mode fictif utilisé uniquement dans la base locale',
    5,
    0,
    5
  ),
  (
    2,
    '[DEV] Respiration 4-6',
    'Deuxième mode de démonstration local',
    4,
    0,
    6
  )
on conflict (id) do nothing;

insert into public.info_articles (
  title,
  content,
  tag,
  categories
)
values
  (
    '[DEV] Bienvenue sur CESIZen local',
    'Cet article existe uniquement dans la base de développement.',
    'developpement',
    array['DEV', 'Démonstration']
  ),
  (
    '[DEV] Article de test',
    'Cette donnée permet de montrer que la production et le développement sont séparés.',
    'test',
    array['DEV', 'Test']
  );