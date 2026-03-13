import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation - BookEasy",
};

export default function CGU() {
  return (
    <>
      <h1>Conditions Générales d'Utilisation</h1>
      <p className="text-sm text-gray-400 mb-8">
        Dernière mise à jour : 11 mars 2026
      </p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d'Utilisation (CGU)
        définissent les modalités d'accès et d'utilisation de la
        plateforme <strong>BookEasy</strong>, accessible à l'adresse [votre-domaine.pf].
      </p>
      <p>
        BookEasy est une plateforme de mise en relation permettant aux particuliers de
        réserver des rendez-vous auprès de professionnels de services
        (coiffeurs, barbers, esthéticiennes, médecins, coachs sportifs, etc.)
        en Polynésie française.
      </p>

      <h2>2. Acceptation des conditions</h2>
      <p>
        L'utilisation du Site implique l'acceptation pleine et entière des
        présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas
        utiliser le Site.
      </p>

      <h2>3. Inscription</h2>
      <h3>3.1 Comptes clients</h3>
      <p>
        L'inscription est gratuite et ouverte à toute personne physique majeure.
        L'utilisateur s'engage à fournir des informations exactes et à
        les maintenir à jour.
      </p>
      <h3>3.2 Comptes professionnels</h3>
      <p>
        Les professionnels peuvent créer un compte pour gérer leurs disponibilités,
        services et réservations. Ils s'engagent à fournir des informations
        exactes sur leur activité et à détenir les autorisations
        nécessaires à l'exercice de leur profession.
      </p>

      <h2>4. Services proposés</h2>
      <p>BookEasy propose les services suivants :</p>
      <ul>
        <li>Recherche de professionnels par secteur, localisation ou nom</li>
        <li>Consultation des fiches professionnelles (services, tarifs, avis)</li>
        <li>Réservation en ligne de créneaux horaires</li>
        <li>Carte interactive des professionnels</li>
        <li>Gestion des rendez-vous (pour les clients et les professionnels)</li>
      </ul>

      <h2>5. Réservations</h2>
      <h3>5.1 Processus de réservation</h3>
      <p>
        Le client sélectionne un professionnel, un service et un créneau
        disponible. La réservation est confirmée une fois validée par
        le système.
      </p>
      <h3>5.2 Annulation</h3>
      <p>
        Les conditions d'annulation sont définies par chaque professionnel.
        En l'absence de conditions spécifiques, toute annulation doit être
        effectuée au moins 24 heures avant le rendez-vous.
      </p>

      <h2>6. Rôle de BookEasy</h2>
      <p>
        BookEasy agit uniquement en qualité d'intermédiaire technique.
        La plateforme n'est pas partie prenante aux contrats de prestation de service
        conclus entre les professionnels et les clients.
      </p>
      <p>
        BookEasy ne garantit pas la qualité des prestations réalisées
        par les professionnels référencés sur la plateforme.
      </p>

      <h2>7. Obligations des utilisateurs</h2>
      <p>Les utilisateurs s'engagent à :</p>
      <ul>
        <li>Utiliser le Site conformément à sa destination</li>
        <li>Ne pas créer de faux comptes ou usurper une identité</li>
        <li>Ne pas nuire au fonctionnement du Site</li>
        <li>Respecter les rendez-vous réservés ou les annuler dans les délais prévus</li>
        <li>Laisser des avis honnêtes et respectueux</li>
      </ul>

      <h2>8. Propriété intellectuelle</h2>
      <p>
        Tous les éléments du Site (design, textes, logos, code source) sont
        la propriété exclusive de BookEasy et sont protégés par
        les lois sur la propriété intellectuelle.
      </p>

      <h2>9. Responsabilité</h2>
      <p>
        BookEasy ne saurait être tenu responsable des dommages directs ou indirects
        résultant de l'utilisation du Site, notamment en cas d'indisponibilité
        du service, de perte de données ou de litige entre un client et un professionnel.
      </p>

      <h2>10. Modification des CGU</h2>
      <p>
        BookEasy se réserve le droit de modifier les présentes CGU à tout
        moment. Les utilisateurs seront informés de toute modification substantielle.
        La poursuite de l'utilisation du Site vaut acceptation des nouvelles conditions.
      </p>

      <h2>11. Droit applicable et litiges</h2>
      <p>
        Les présentes CGU sont soumises au droit français applicable en
        Polynésie française. En cas de litige, les parties s'efforceront
        de trouver une solution amiable. À défaut, les tribunaux de Papeete
        seront seuls compétents.
      </p>

      <h2>12. Contact</h2>
      <p>
        Pour toute question relative aux présentes CGU, vous pouvez nous contacter
        à l'adresse :{" "}
        <a href="mailto:contact@bookeasy.pf">contact@bookeasy.pf</a>.
      </p>
    </>
  );
}
