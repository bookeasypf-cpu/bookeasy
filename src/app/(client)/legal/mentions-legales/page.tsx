import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales - BookEasy",
};

export default function MentionsLegales() {
  return (
    <>
      <h1>Mentions légales</h1>
      <p className="text-sm text-gray-400 mb-8">
        Dernière mise à jour : 22 mars 2026
      </p>

      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>BookEasy</strong> (ci-après « le Site ») est édité par :
      </p>
      <ul>
        <li><strong>Responsable légal :</strong> Maravai PARAU</li>
        <li><strong>Forme juridique :</strong> Entreprise individuelle (EI) — Exploitation directe</li>
        <li><strong>N° TAHITI :</strong> D11783</li>
        <li><strong>RCS :</strong> 26 270 A R.C.S. Papeete</li>
        <li><strong>Date d&apos;immatriculation :</strong> 03/02/2026</li>
        <li><strong>Activité :</strong> Apporteur d&apos;affaires dans les services digitaux et d&apos;automatisation</li>
        <li><strong>Siège social :</strong> Quartier Teissier Emile, PK 12.600, Côté Montagne 98717 PUNAAUIA, Polynésie française</li>
        <li><strong>Téléphone :</strong> +689 89 70 01 05</li>
        <li><strong>Email :</strong> <a href="mailto:contact@bookeasy.me">contact@bookeasy.me</a></li>
        <li><strong>Site web :</strong> <a href="https://bookeasy.me" target="_blank" rel="noopener noreferrer">https://bookeasy.me</a></li>
        <li><strong>Directeur de la publication :</strong> Maravai PARAU</li>
      </ul>

      <h2>2. Hébergeur</h2>
      <ul>
        <li><strong>Raison sociale :</strong> Vercel Inc.</li>
        <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
        <li><strong>Site web :</strong> https://vercel.com</li>
      </ul>

      <h2>3. Activité</h2>
      <p>
        BookEasy est une plateforme de mise en relation entre des particuliers et des professionnels
        de services en Polynésie française. BookEasy permet la recherche de professionnels,
        la prise de rendez-vous en ligne, l&apos;achat de cartes cadeaux et la consultation d&apos;avis clients.
      </p>
      <p>
        BookEasy agit en qualité d&apos;intermédiaire technique et n&apos;est pas partie prenante
        aux contrats de prestation conclus entre les professionnels et leurs clients.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus présents sur le Site (textes, images, logos, icônes,
        graphismes, logiciels, bases de données, code source) est protégé par les lois
        relatives à la propriété intellectuelle et au droit d&apos;auteur.
      </p>
      <p>
        La dénomination « BookEasy », le logo et les marques associées sont la propriété
        exclusive de l&apos;éditeur. Toute reproduction, représentation, modification ou
        adaptation de tout ou partie des éléments du Site est interdite sans autorisation
        écrite préalable.
      </p>

      <h2>5. Responsabilité</h2>
      <p>
        L&apos;éditeur s&apos;efforce de fournir des informations aussi précises que possible.
        Toutefois, il ne pourra être tenu responsable des omissions, inexactitudes
        ou carences dans la mise à jour des informations.
      </p>
      <p>
        BookEasy n&apos;est pas responsable de la qualité des prestations réalisées par les
        professionnels référencés, ni des litiges pouvant survenir entre un professionnel
        et un client.
      </p>

      <h2>6. Données personnelles</h2>
      <p>
        Conformément à la loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique,
        aux fichiers et aux libertés, et au Règlement Général sur la Protection des
        Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression
        et d&apos;opposition aux données vous concernant.
      </p>
      <p>
        Pour exercer ces droits :{" "}
        <a href="mailto:contact@bookeasy.me">contact@bookeasy.me</a>.
      </p>
      <p>
        Pour plus de détails, consultez notre{" "}
        <a href="/legal/confidentialite">Politique de confidentialité</a>.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Le Site utilise des cookies nécessaires à son bon fonctionnement (cookies de session,
        d&apos;authentification). Aucun cookie publicitaire ou de tracking n&apos;est utilisé
        sans votre consentement préalable.
      </p>

      <h2>8. Médiation</h2>
      <p>
        Conformément aux articles L. 152-1 et suivants du Code de la consommation,
        en cas de litige non résolu, le consommateur peut recourir gratuitement au médiateur
        désigné par BookEasy :
      </p>
      <p>
        <strong>AMDPF TAHITI</strong> (Association des Médiateurs Diplômés de Polynésie Française)<br />
        Email : <a href="mailto:contact.amdpf@gmail.com">contact.amdpf@gmail.com</a>
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont régies par le droit français applicable
        en Polynésie française. Tout litige sera soumis aux tribunaux compétents de Papeete.
      </p>
    </>
  );
}
