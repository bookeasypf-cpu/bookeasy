import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales - BookEasy",
};

export default function MentionsLegales() {
  return (
    <>
      <h1>Mentions l&eacute;gales</h1>
      <p className="text-sm text-gray-400 mb-8">
        Derni&egrave;re mise &agrave; jour : 11 mars 2026
      </p>

      <h2>1. &Eacute;diteur du site</h2>
      <p>
        Le site <strong>BookEasy</strong> (ci-apr&egrave;s &laquo; le Site &raquo;) est
        &eacute;dit&eacute; par :
      </p>
      <ul>
        <li><strong>Raison sociale :</strong> [Votre entreprise]</li>
        <li><strong>Forme juridique :</strong> [SARL / SAS / Auto-entrepreneur]</li>
        <li><strong>Num&eacute;ro TAHITI :</strong> [Votre num&eacute;ro d&apos;immatriculation]</li>
        <li><strong>Si&egrave;ge social :</strong> [Adresse compl&egrave;te], Papeete, Polyn&eacute;sie fran&ccedil;aise</li>
        <li><strong>T&eacute;l&eacute;phone :</strong> +689 40 00 00 00</li>
        <li><strong>Email :</strong> contact@bookeasy.pf</li>
        <li><strong>Directeur de la publication :</strong> [Nom du responsable]</li>
      </ul>

      <h2>2. H&eacute;bergeur</h2>
      <ul>
        <li><strong>Raison sociale :</strong> Vercel Inc.</li>
        <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, &Eacute;tats-Unis</li>
        <li><strong>Site web :</strong> https://vercel.com</li>
      </ul>

      <h2>3. Propri&eacute;t&eacute; intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus pr&eacute;sents sur le Site (textes, images, logos, ic&ocirc;nes,
        graphismes, logiciels, base de donn&eacute;es) est prot&eacute;g&eacute; par les lois
        relatives &agrave; la propri&eacute;t&eacute; intellectuelle et au droit d&apos;auteur.
      </p>
      <p>
        Toute reproduction, repr&eacute;sentation, modification, publication ou adaptation de tout ou
        partie des &eacute;l&eacute;ments du Site, quel que soit le moyen ou le proc&eacute;d&eacute;
        utilis&eacute;, est interdite sans autorisation &eacute;crite pr&eacute;alable de l&apos;&eacute;diteur.
      </p>

      <h2>4. Responsabilit&eacute;</h2>
      <p>
        L&apos;&eacute;diteur s&apos;efforce de fournir des informations aussi pr&eacute;cises que
        possible. Toutefois, il ne pourra &ecirc;tre tenu responsable des omissions, inexactitudes
        ou carences dans la mise &agrave; jour des informations.
      </p>
      <p>
        BookEasy agit en tant que plateforme de mise en relation entre les professionnels et les
        clients. BookEasy n&apos;est pas partie prenante aux contrats de prestation conclus entre
        les professionnels et leurs clients.
      </p>

      <h2>5. Donn&eacute;es personnelles</h2>
      <p>
        Conform&eacute;ment &agrave; la loi n&deg; 78-17 du 6 janvier 1978 relative &agrave;
        l&apos;informatique, aux fichiers et aux libert&eacute;s, et au R&egrave;glement
        G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD), vous disposez d&apos;un
        droit d&apos;acc&egrave;s, de rectification, de suppression et d&apos;opposition aux
        donn&eacute;es vous concernant.
      </p>
      <p>
        Pour exercer ces droits, vous pouvez nous contacter &agrave; l&apos;adresse suivante :{" "}
        <a href="mailto:contact@bookeasy.pf">contact@bookeasy.pf</a>.
      </p>
      <p>
        Pour plus de d&eacute;tails, consultez notre{" "}
        <a href="/legal/confidentialite">Politique de confidentialit&eacute;</a>.
      </p>

      <h2>6. Cookies</h2>
      <p>
        Le Site utilise des cookies n&eacute;cessaires &agrave; son bon fonctionnement (cookies de
        session, d&apos;authentification). Aucun cookie publicitaire ou de tracking n&apos;est
        utilis&eacute; sans votre consentement pr&eacute;alable.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les pr&eacute;sentes mentions l&eacute;gales sont r&eacute;gies par le droit
        fran&ccedil;ais applicable en Polyn&eacute;sie fran&ccedil;aise. Tout litige sera soumis
        aux tribunaux comp&eacute;tents de Papeete.
      </p>
    </>
  );
}
