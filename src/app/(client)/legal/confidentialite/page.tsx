import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité - BookEasy",
};

export default function Confidentialite() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p className="text-sm text-gray-400 mb-8">
        Dernière mise à jour : 11 mars 2026
      </p>

      <h2>1. Introduction</h2>
      <p>
        La présente politique de confidentialité décrit comment
        <strong> BookEasy</strong> collecte, utilise et protège vos données
        personnelles conformément à la loi n° 78-17 du 6 janvier 1978
        (Loi Informatique et Libertés) et au Règlement Général
        sur la Protection des Données (RGPD).
      </p>

      <h2>2. Données collectées</h2>
      <h3>2.1 Données fournies directement</h3>
      <ul>
        <li><strong>Inscription :</strong> nom, prénom, adresse email, mot de passe (chiffré), numéro de téléphone (optionnel)</li>
        <li><strong>Profil professionnel :</strong> nom commercial, adresse, description, secteur d'activité, horaires, services et tarifs</li>
        <li><strong>Réservations :</strong> date, heure, service choisi, notes éventuelles</li>
        <li><strong>Avis :</strong> texte de l'avis, note attribuée</li>
      </ul>
      <h3>2.2 Données collectées automatiquement</h3>
      <ul>
        <li>Données de navigation (pages visitées, durée)</li>
        <li>Adresse IP</li>
        <li>Type de navigateur et système d'exploitation</li>
        <li>Données de géolocalisation (uniquement avec votre consentement pour la carte interactive)</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>Gérer votre compte et votre authentification</li>
        <li>Permettre la réservation de rendez-vous</li>
        <li>Mettre en relation clients et professionnels</li>
        <li>Envoyer des confirmations et rappels de rendez-vous</li>
        <li>Améliorer nos services et l'expérience utilisateur</li>
        <li>Assurer la sécurité de la plateforme</li>
      </ul>

      <h2>4. Base légale</h2>
      <ul>
        <li><strong>Exécution du contrat :</strong> gestion des comptes et des réservations</li>
        <li><strong>Consentement :</strong> géolocalisation, cookies non essentiels</li>
        <li><strong>Intérêt légitime :</strong> amélioration du service, sécurité</li>
      </ul>

      <h2>5. Partage des données</h2>
      <p>Vos données ne sont <strong>jamais vendues</strong>. Elles peuvent être partagées avec :</p>
      <ul>
        <li><strong>Les professionnels :</strong> nom et coordonnées du client pour les rendez-vous confirmés</li>
        <li><strong>Hébergeur :</strong> Vercel Inc. (données techniques de serveur)</li>
        <li><strong>Autorités :</strong> sur demande judiciaire légitime</li>
      </ul>

      <h2>6. Durée de conservation</h2>
      <ul>
        <li><strong>Comptes actifs :</strong> durée de vie du compte + 3 ans après dernière activité</li>
        <li><strong>Réservations :</strong> 3 ans après la date du rendez-vous</li>
        <li><strong>Données de navigation :</strong> 13 mois maximum</li>
        <li><strong>Comptes supprimés :</strong> effacement sous 30 jours (sauf obligations légales)</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Accès :</strong> obtenir une copie de vos données personnelles</li>
        <li><strong>Rectification :</strong> corriger des données inexactes</li>
        <li><strong>Suppression :</strong> demander l'effacement de vos données</li>
        <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
        <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
        <li><strong>Limitation :</strong> limiter le traitement dans certains cas</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à :{" "}
        <a href="mailto:contact@bookeasy.pf">contact@bookeasy.pf</a>.
        Nous répondrons dans un délai de 30 jours.
      </p>

      <h2>8. Cookies</h2>
      <h3>8.1 Cookies essentiels</h3>
      <p>
        Nécessaires au fonctionnement du Site (session, authentification).
        Ils ne nécessitent pas votre consentement.
      </p>
      <h3>8.2 Cookies analytiques</h3>
      <p>
        Utilisés pour comprendre comment les visiteurs interagissent avec le Site.
        Déposés uniquement avec votre consentement.
      </p>

      <h2>9. Sécurité</h2>
      <p>
        Nous mettons en &oelig;uvre des mesures techniques et organisationnelles
        appropriées pour protéger vos données : chiffrement des mots
        de passe (bcrypt), connexion HTTPS, accès restreint aux données.
      </p>

      <h2>10. Transfert de données</h2>
      <p>
        Vos données peuvent être hébergées sur des serveurs
        situés en dehors de la Polynésie française (serveurs Vercel).
        Ces transferts sont encadrés par des garanties adéquates (clauses
        contractuelles types de la Commission européenne).
      </p>

      <h2>11. Contact</h2>
      <p>
        Pour toute question relative à la présente politique, contactez notre
        délégué à la protection des données :{" "}
        <a href="mailto:contact@bookeasy.pf">contact@bookeasy.pf</a>.
      </p>
      <p>
        Vous pouvez également adresser une réclamation à la CNIL
        (Commission Nationale de l'Informatique et des Libertés) sur{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
      </p>
    </>
  );
}
