# Templates marketing santé — ARCHIVÉS

**Date d'archivage** : 2026-06-05
**Raison** : Conformité Art. L.1111-8 CSP (hébergement données de santé sans certification HDS).

## Contexte

BookEasy n'est pas certifié HDS (Hébergeur de Données de Santé). La feature Notes
patient chiffrée AES-256-GCM offre une protection technique solide mais ne remplace
pas la certification HDS exigée par la loi pour démarcher activement des professionnels
de santé qui hébergeront des données sensibles (art. 9 RGPD).

Démarcher activement médecins, dentistes, infirmiers libéraux = exposition pénale
(1 an prison + 15 000 € amende) en cas de plainte ou contrôle CNIL/ANS.

## Protections en place (pour les médicaux qui s'inscrivent organiquement)

1. CGU art. 5.4 : interdit la saisie de données de santé dans les Notes
2. Politique de confidentialité : disclaimer HDS explicite
3. Disclaimer UI sur la page Notes patient

## Réactivation possible

Ces templates peuvent être réactivés si l'une des conditions est remplie :
- BookEasy obtient la certification HDS (process 6-12 mois, ANS)
- La feature Notes est désactivée pour les sectors médicaux (Option A du deep audit 2026-06-05)
- Pivot stratégique sur un service distinct sans hébergement de données patient

Pour réactiver : `mv _archive-medical/*.md ../` depuis ce dossier.
