import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - BookEasy",
  description: "Politique de confidentialité et protection des données personnelles de BookEasy. Découvrez comment nous protégeons vos informations en Polynésie française.",
};

export default function Confidentialite() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-gray-400 mb-8">
        Dernière mise à jour : 22 mars 2026
      </p>

      <h2>1. Introduction</h2>
      <p>
        La présente politique de confidentialité décrit comment
        <strong> BookEasy</strong> (ci-après « nous ») collecte, utilise, stocke et protège
        vos données personnelles conformément à la loi n° 78-17 du 6 janvier 1978
        (Loi Informatique et Libertés) et au Règlement Général sur la Protection des
        Données (RGPD).
      </p>
      <p>
        En utilisant notre plateforme, vous acceptez les pratiques décrites ci-dessous.
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est :<br />
        <strong>Maravai PARAU — Entreprise individuelle (EI)</strong><br />
        N° TAHITI : D11783 — RCS : 26 270 A R.C.S. Papeete<br />
        Quartier Teissier Emile, PK 12.600, Côté Montagne 98717 PUNAAUIA, Polynésie française<br />
        Email : <a href="mailto:bookeasy.pf@gmail.com">bookeasy.pf@gmail.com</a><br />
        Téléphone : +689 89 70 03 05
      </p>

      <h2>3. Données collectées</h2>
      <h3>3.1 Données fournies directement</h3>
      <ul>
        <li><strong>Inscription Client :</strong> nom, prénom, adresse email, mot de passe (chiffré via bcrypt)</li>
        <li><strong>Inscription via OAuth :</strong> nom, prénom, adresse email, photo de profil (via Google)</li>
        <li><strong>Profil professionnel :</strong> nom commercial, adresse, description, secteur d&apos;activité, coordonnées GPS, numéro de téléphone, horaires, services et tarifs, photos</li>
        <li><strong>Réservations :</strong> date, heure, service choisi, notes éventuelles</li>
        <li><strong>Avis :</strong> texte de l&apos;avis, note attribuée (1 à 5 étoiles)</li>
        <li><strong>Cartes Cadeaux :</strong> nom et email de l&apos;expéditeur et du destinataire, message personnalisé</li>
        <li><strong>Programme XP :</strong> historique des points gagnés et dépensés</li>
      </ul>
      <h3>3.2 Données collectées automatiquement</h3>
      <ul>
        <li>Données de navigation (pages visitées, durée des sessions)</li>
        <li>Adresse IP</li>
        <li>Type de navigateur et système d&apos;exploitation</li>
        <li>Données de géolocalisation (uniquement avec votre consentement, pour la carte interactive)</li>
      </ul>

      <h2>4. Finalités du traitement</h2>
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>Gérer votre compte et votre authentification</li>
        <li>Permettre la réservation de rendez-vous et leur gestion</li>
        <li>Mettre en relation clients et professionnels</li>
        <li>Envoyer des confirmations, rappels et notifications de rendez-vous</li>
        <li>Permettre l&apos;achat et l&apos;utilisation de Cartes Cadeaux</li>
        <li>Gérer le programme de fidélité (XP)</li>
        <li>Permettre le dépôt et l&apos;affichage d&apos;avis clients</li>
        <li>Améliorer nos services et l&apos;expérience utilisateur</li>
        <li>Assurer la sécurité et le bon fonctionnement de la plateforme</li>
        <li>Respecter nos obligations légales</li>
      </ul>

      <h2>5. Base légale</h2>
      <ul>
        <li><strong>Exécution du contrat :</strong> gestion des comptes, réservations, cartes cadeaux, programme XP</li>
        <li><strong>Consentement :</strong> géolocalisation, cookies non essentiels, newsletter</li>
        <li><strong>Intérêt légitime :</strong> amélioration du service, sécurité, prévention de la fraude</li>
        <li><strong>Obligation légale :</strong> conservation des données de facturation, réponse aux demandes judiciaires</li>
      </ul>

      <h2>6. Partage des données — Sous-traitants</h2>
      <p>Vos données ne sont <strong>jamais vendues</strong>. Elles sont traitées par les sous-traitants suivants, agissant sous notre responsabilité (art. 28 RGPD) :</p>
      <ul>
        <li><strong>Les Prestataires (commerçants partenaires) :</strong> nom et coordonnées du client pour les rendez-vous confirmés uniquement (Polynésie française)</li>
        <li><strong>PayZen by OSB :</strong> traitement des paiements clients et abonnements Pro en XPF (Polynésie française)</li>
        <li><strong>Vercel Inc. :</strong> hébergement de l&apos;application et stockage des images (États-Unis — clauses contractuelles types décision UE 2021/914)</li>
        <li><strong>Neon Inc. :</strong> base de données PostgreSQL (États-Unis / UE — CCT)</li>
        <li><strong>Resend Inc. :</strong> envoi des emails transactionnels (États-Unis — CCT)</li>
        <li><strong>Upstash Inc. :</strong> cache Redis et limitation de débit (États-Unis — CCT)</li>
        <li><strong>Google LLC :</strong> authentification OAuth si connexion via Google (États-Unis — CCT)</li>
        <li><strong>Notes médicales (PatientNote) :</strong> hébergées sur BookEasy, accessibles uniquement au professionnel de santé qui les a saisies. Vous pouvez en demander une copie ou la suppression (voir section 8). Base légale : intérêt légitime du professionnel de santé pour assurer la continuité des soins (art. 6.1.f) combiné à l&apos;art. 9.2.h RGPD pour les données de santé.</li>
        <li><strong>Autorités compétentes :</strong> sur demande judiciaire légitime</li>
      </ul>

      <h2>7. Durée de conservation</h2>
      <ul>
        <li><strong>Comptes actifs :</strong> durée de vie du compte + 3 ans après la dernière activité</li>
        <li><strong>Réservations :</strong> 3 ans après la date du rendez-vous</li>
        <li><strong>Avis clients :</strong> durée de publication sur la Plateforme</li>
        <li><strong>Cartes Cadeaux :</strong> 1 an après expiration (obligations comptables)</li>
        <li><strong>Données de navigation :</strong> 13 mois maximum</li>
        <li><strong>Comptes supprimés :</strong> effacement sous 30 jours (sauf obligations légales de conservation)</li>
        <li><strong>Données de facturation :</strong> 10 ans (obligations fiscales)</li>
      </ul>

      <h2>8. Vos droits</h2>
      <p>Conformément au RGPD et à la Loi Informatique et Libertés, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Accès :</strong> obtenir une copie de vos données personnelles</li>
        <li><strong>Rectification :</strong> corriger des données inexactes ou incomplètes</li>
        <li><strong>Suppression :</strong> demander l&apos;effacement de vos données</li>
        <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
        <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré et lisible</li>
        <li><strong>Limitation :</strong> limiter le traitement dans certains cas</li>
        <li><strong>Retrait du consentement :</strong> retirer votre consentement à tout moment (sans affecter la licéité du traitement antérieur)</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à :{" "}
        <a href="mailto:bookeasy.pf@gmail.com">bookeasy.pf@gmail.com</a>.
        Nous répondrons dans un délai de 30 jours. En cas de demande complexe, ce délai
        peut être prolongé de 60 jours, avec notification préalable.
      </p>

      <h2>9. Cookies</h2>
      <p>
        BookEasy n&apos;utilise <strong>que des cookies strictement nécessaires</strong> au
        fonctionnement du service. Aucun cookie publicitaire ni de mesure d&apos;audience
        tiers n&apos;est déposé. Le consentement préalable n&apos;est donc pas requis (art. 82 LIL).
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1em", fontSize: "0.9em" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ccc" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Nom</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Émetteur</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Finalité</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}>next-auth.session-token</td>
            <td style={{ padding: "8px" }}>BookEasy</td>
            <td style={{ padding: "8px" }}>Authentification</td>
            <td style={{ padding: "8px" }}>30 jours</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}>next-auth.csrf-token</td>
            <td style={{ padding: "8px" }}>BookEasy</td>
            <td style={{ padding: "8px" }}>Protection CSRF</td>
            <td style={{ padding: "8px" }}>Session</td>
          </tr>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <td style={{ padding: "8px" }}>cookie-consent (localStorage)</td>
            <td style={{ padding: "8px" }}>BookEasy</td>
            <td style={{ padding: "8px" }}>Mémoriser le choix sur le bandeau cookies</td>
            <td style={{ padding: "8px" }}>1 an</td>
          </tr>
          <tr>
            <td style={{ padding: "8px" }}>theme (localStorage)</td>
            <td style={{ padding: "8px" }}>BookEasy</td>
            <td style={{ padding: "8px" }}>Préférence dark/light mode</td>
            <td style={{ padding: "8px" }}>Permanent</td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: "1em" }}>
        Vous pouvez à tout moment supprimer ces cookies via les paramètres de votre
        navigateur. La désactivation de certains cookies peut limiter votre expérience
        sur la Plateforme (notamment l&apos;authentification).
      </p>

      <h2>10. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
        pour protéger vos données :
      </p>
      <ul>
        <li>Chiffrement des mots de passe (bcrypt)</li>
        <li>Connexion HTTPS (chiffrement TLS)</li>
        <li>Accès restreint aux données (principe du moindre privilège)</li>
        <li>Sauvegardes régulières</li>
        <li>Surveillance des accès non autorisés</li>
      </ul>

      <h2>11. Transfert de données hors UE</h2>
      <p>
        Vos données peuvent être hébergées sur des serveurs situés en dehors de la
        Polynésie française et de l&apos;Union européenne (Vercel, Neon, Resend, Upstash —
        principalement aux États-Unis). Ces transferts sont encadrés par les
        <strong> clauses contractuelles types (CCT)</strong> adoptées par la Commission
        européenne (décision UE 2021/914 du 4 juin 2021), conformément aux exigences
        post-arrêt Schrems II (CJUE, juillet 2020).
      </p>

      <h2>12. Protection des mineurs</h2>
      <p>
        La Plateforme est destinée aux personnes majeures. Nous ne collectons pas
        sciemment de données personnelles de mineurs. Si nous découvrons que des données
        de mineurs ont été collectées, nous les supprimerons dans les meilleurs délais.
      </p>

      <h2>13. Modification de la politique</h2>
      <p>
        Nous nous réservons le droit de modifier la présente politique à tout moment.
        En cas de modification substantielle, vous serez informé par email ou par une
        notification sur la Plateforme au moins 30 jours avant l&apos;entrée en vigueur
        des nouvelles dispositions.
      </p>

      <h2>14. Contact et réclamation</h2>
      <p>
        Pour toute question relative à la présente politique ou pour exercer vos droits :<br />
        Email : <a href="mailto:bookeasy.pf@gmail.com">bookeasy.pf@gmail.com</a><br />
        Téléphone : +689 89 70 03 05<br />
        Adresse : Quartier Teissier Emile, PK 12.600, Côté Montagne 98717 PUNAAUIA, Polynésie française
      </p>
      <p>
        Vous pouvez également adresser une réclamation à la CNIL
        (Commission Nationale de l&apos;Informatique et des Libertés) sur{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
      </p>
    </>
  );
}
