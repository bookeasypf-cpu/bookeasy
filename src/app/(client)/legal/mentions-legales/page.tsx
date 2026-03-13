import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales - BookEasy",
};

export default function MentionsLegales() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="text-sm text-gray-400 mb-8">
        Dernière mise à jour : 11 mars 2026
      </p>

      <h2>1. &Eacute;diteur du site</h2>
      <p>
        Le site <strong>BookEasy</strong> (ci-après &laquo; le Site &raquo;) est
        édité par :
      </p>
      <ul>
        <li><strong>Raison sociale :</strong> [Votre entreprise]</li>
        <li><strong>Forme juridique :</strong> [SARL / SAS / Auto-entrepreneur]</li>
        <li><strong>Numéro TAHITI :</strong> [Votre numéro d'immatriculation]</li>
        <li><strong>Siège social :</strong> [Adresse complète], Papeete, Polynésie française</li>
        <li><strong>Téléphone :</strong> +689 40 00 00 00</li>
        <li><strong>Email :</strong> contact@bookeasy.pf</li>
        <li><strong>Directeur de la publication :</strong> [Nom du responsable]</li>
      </ul>

      <h2>2. Hébergeur</h2>
      <ul>
        <li><strong>Raison sociale :</strong> Vercel Inc.</li>
        <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, &Eacute;tats-Unis</li>
        <li><strong>Site web :</strong> https://vercel.com</li>
      </ul>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L'ensemble des contenus présents sur le Site (textes, images, logos, icônes,
        graphismes, logiciels, base de données) est protégé par les lois
        relatives à la propriété intellectuelle et au droit d'auteur.
      </p>
      <p>
        Toute reproduction, représentation, modification, publication ou adaptation de tout ou
        partie des éléments du Site, quel que soit le moyen ou le procédé
        utilisé, est interdite sans autorisation écrite préalable de l'éditeur.
      </p>

      <h2>4. Responsabilité</h2>
      <p>
        L'éditeur s'efforce de fournir des informations aussi précises que
        possible. Toutefois, il ne pourra être tenu responsable des omissions, inexactitudes
        ou carences dans la mise à jour des informations.
      </p>
      <p>
        BookEasy agit en tant que plateforme de mise en relation entre les professionnels et les
        clients. BookEasy n'est pas partie prenante aux contrats de prestation conclus entre
        les professionnels et leurs clients.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Conformément à la loi n° 78-17 du 6 janvier 1978 relative à
        l'informatique, aux fichiers et aux libertés, et au Règlement
        Général sur la Protection des Données (RGPD), vous disposez d'un
        droit d'accès, de rectification, de suppression et d'opposition aux
        données vous concernant.
      </p>
      <p>
        Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante :{" "}
        <a href="mailto:contact@bookeasy.pf">contact@bookeasy.pf</a>.
      </p>
      <p>
        Pour plus de détails, consultez notre{" "}
        <a href="/legal/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Le Site utilise des cookies nécessaires à son bon fonctionnement (cookies de
        session, d'authentification). Aucun cookie publicitaire ou de tracking n'est
        utilisé sans votre consentement préalable.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit
        français applicable en Polynésie française. Tout litige sera soumis
        aux tribunaux compétents de Papeete.
      </p>
    </>
  );
}
