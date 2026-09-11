// Landing page publique (v2).
// Le CSS vit dans gate-v2.css, entièrement isolé sous .apezeo-landing-v2
// pour ne jamais déborder sur le reste de l'app.
//
// Le hero (choix Pro/Aidant) ne change jamais de place. Chaque bouton du
// menu ouvre une vraie sous-page dédiée (pas un simple ancrage qui fait
// défiler la page) : Pourquoi Apézeo, Fonctionnalités, Installer
// l'application, Accès & tarifs. Le menu reste fixe en haut de l'écran.
import { useState } from "react";
import "../gate-v2.css";

function PageShell({ kicker, title, intro, onBack, children }) {
  return (
    <section className="subpage">
      <button className="back-btn" onClick={onBack}>← Retour</button>
      {kicker && <div className="section-kicker">{kicker}</div>}
      <h3>{title}</h3>
      {intro && <p className="section-intro">{intro}</p>}
      {children}
    </section>
  );
}

export function GateV2({ onChoose }) {
  const [page, setPage] = useState("hero");
  const goHero = () => setPage("hero");

  return (
    <div className="apezeo-landing-v2">
      <div className="page">

        <nav className="nav-fixed" aria-label="Navigation principale">
          <div className="container nav-inner">
            <button className="nav-brand-btn" onClick={goHero} aria-label="Retour à l'accueil">
              <img className="nav-logo-mark" src="/logo-phoenix.png" alt="Apézeo" />
            </button>
            <div className="nav-links">
              <button className={page === "pourquoi" ? "active" : ""} onClick={() => setPage("pourquoi")}>Pourquoi Apézeo</button>
              <button className={page === "fonctionnalites" ? "active" : ""} onClick={() => setPage("fonctionnalites")}>Fonctionnalités</button>
              <button className={page === "installation" ? "active" : ""} onClick={() => setPage("installation")}>Installer l'application</button>
              <button className={page === "tarifs" ? "active" : ""} onClick={() => setPage("tarifs")}>Accès &amp; tarifs</button>
              <button className="nav-login" onClick={() => onChoose("pro")}>Connexion</button>
            </div>
          </div>
        </nav>

        <div className="container nav-spacer" />

        <div className="container">

          {page === "hero" && (
            <header className="hero">
              <div className="brand-word">Ap<span className="e">é</span>zeo</div>

              <h1 className="headline">Une ressource pensée pour<br /><span>ceux qui accompagnent.</span></h1>

              <section className="choices" aria-label="Choisir son espace">
                <article className="card prof">
                  <div className="card-inner">
                    <div className="card-icon" aria-hidden="true"><svg className="ic" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                    <h2>Professionnels</h2>
                    <p>Une bibliothèque de référence pour harmoniser les pratiques de votre équipe au quotidien.</p>
                    <div className="highlight"><b>2 bibliothèques, 1 même équipe</b>Standard pour aller à l'essentiel, Expert pour approfondir — de quoi ajuster ensemble la réflexion et l'action, selon le rôle et l'expérience de chacun.</div>
                    <ul>
                      <li><svg className="ic" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Fiches pratiques structurées et sourcées</li>
                      <li><svg className="ic" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Favoris, outils et ressources partagés en équipe</li>
                    </ul>
                    <div className="spacer" />
                    <button className="cta" onClick={() => onChoose("pro")}>Découvrir l'espace professionnel <span className="arrow">→</span></button>
                  </div>
                </article>

                <article className="card aid">
                  <div className="card-inner">
                    <div className="card-icon" aria-hidden="true"><svg className="ic" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div>
                    <h2>Aidants</h2>
                    <p>Des repères simples et bienveillants pour accompagner votre proche, où que vous soyez.</p>
                    <ul>
                      <li><svg className="ic" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Conseils accessibles et concrets</li>
                      <li><svg className="ic" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Techniques adaptées au quotidien</li>
                      <li><svg className="ic" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>Un accompagnement pensé pour vous</li>
                    </ul>
                    <div className="spacer" />
                    <button className="cta" onClick={() => onChoose("aidant")}>Accéder à l'espace aidant <span className="arrow">→</span></button>
                  </div>
                </article>
              </section>

              <section className="trust" aria-label="Engagements">
                <div className="trust-item"><span className="trust-icon"><svg className="ic" viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5.2 3.4 9.4 8 11 4.6-1.6 8-5.8 8-11V5z" /><polyline points="9 12 11 14 15 10" /></svg></span><span><strong>Sources reconnues</strong><br />HAS, NICE et autres références</span></div>
                <div className="trust-item"><span className="trust-icon"><svg className="ic" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></span><span><strong>Confidentialité</strong><br />Données sécurisées</span></div>
                <div className="trust-item"><span className="trust-icon"><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" /></svg></span><span><strong>Pour tous</strong><br />Professionnels et aidants</span></div>
              </section>
            </header>
          )}

          {page === "pourquoi" && (
            <PageShell kicker="Pourquoi Apézeo ?" title="Une réponse de terrain, documentée et pensée pour le quotidien." onBack={goHero}
              intro="Les bonnes pratiques ne devraient pas rester dans les classeurs.">

              <p className="lead-text">Dans les établissements et à domicile, les professionnels sont confrontés chaque jour à des situations complexes : agitation, anxiété, refus de soins, troubles du sommeil, désorientation, opposition… Les réponses ne peuvent pas être standardisées. Une même manifestation peut avoir des significations et des déclencheurs différents selon la personne, son histoire, ses habitudes et son environnement.</p>
              <p className="lead-text">Apézeo apporte un accès rapide à différentes approches non médicamenteuses afin d'aider les professionnels à comprendre la situation, disposer de repères et adapter leur accompagnement — un même objectif : faire passer les bonnes pratiques de la formation au quotidien.</p>

              <div className="stats">
                <div className="stat"><strong>1,2 à 1,4 M<sup><a href="#src-1">1</a><a href="#src-2">2</a></sup></strong><span>personnes vivent avec la maladie d'Alzheimer ou une maladie apparentée en France</span></div>
                <div className="stat"><strong>×2<sup><a href="#src-1">1</a></sup></strong><span>progression attendue du nombre de personnes touchées d'ici 2050</span></div>
                <div className="stat"><strong>~225 000<sup><a href="#src-4">4</a></sup></strong><span>nouveaux cas diagnostiqués chaque année en France</span></div>
                <div className="stat"><strong>~1 sur 2<sup><a href="#src-5">5</a></sup></strong><span>résidents d'EHPAD présente des troubles cognitifs</span></div>
              </div>

              <div className="callout">La Haute Autorité de Santé recommande les approches non médicamenteuses en première intention face aux troubles du comportement liés aux maladies neurocognitives<sup><a href="#src-6">6</a></sup> — mais elle constate elle-même qu'une grande partie des professionnels de terrain manque de formation spécifique sur ce sujet<sup><a href="#src-7">7</a></sup>.</div>

              <div className="values">
                <article className="value"><div className="number">01</div><h4>Un socle commun</h4><p>Les mêmes repères pour les équipes, du nouvel arrivant à l'encadrement.</p></article>
                <article className="value"><div className="number">02</div><h4>La formation se prolonge</h4><p>Une ressource disponible au moment où le professionnel en a besoin.</p></article>
                <article className="value"><div className="number">03</div><h4>Une bibliothèque, pas un diagnostic</h4><p>Des pratiques et ressources d'accompagnement, sans se substituer au jugement clinique.</p></article>
              </div>

              <h4 className="block-title">Un même socle pour toute l'équipe</h4>
              <div className="team-grid">
                <div className="team-item"><b>Direction</b><span>Une vision commune des pratiques et des ressources disponibles.</span></div>
                <div className="team-item"><b>Professionnels</b><span>Des repères accessibles rapidement, directement sur le terrain.</span></div>
                <div className="team-item"><b>Nouveaux arrivants</b><span>Une ressource pour retrouver facilement les pratiques et les principes essentiels.</span></div>
                <div className="team-item"><b>Équipes mobiles, intérimaires, stagiaires</b><span>Un accès simple à une base commune, sans dépendre de la disponibilité d'un collègue.</span></div>
              </div>

              <div className="not-box">
                <h4 className="block-title">Ce qu'Apézeo n'est pas</h4>
                <p>Apézeo accompagne la pratique. Il ne la remplace pas. Apézeo n'est :</p>
                <ul className="not-list">
                  <li>ni un outil de diagnostic ;</li>
                  <li>ni un outil d'aide à la décision clinique ;</li>
                  <li>ni un remplacement de la formation professionnelle ;</li>
                  <li>ni un substitut à l'évaluation individualisée d'une situation.</li>
                </ul>
                <p>C'est une bibliothèque de ressources et de bonnes pratiques reconnues, conçue pour faciliter l'accès aux connaissances et leur partage au quotidien.</p>
              </div>

              <details className="sources-block">
                <summary className="sources-title">Sources et références</summary>
                <ol className="sources-list">
                  <li id="src-1"><b>1.</b><a href="https://www.francealzheimer.org/prevalence-de-la-maladie-dalzheimer-et-des-maladies-apparentees-14-m-de-personnes-malades-en-2025/" target="_blank" rel="noopener noreferrer">France Alzheimer — « Prévalence de la maladie d'Alzheimer et des maladies apparentées : 1,4 M de personnes malades en 2025 », 13 mars 2025</a></li>
                  <li id="src-2"><b>2.</b><a href="https://www.santepubliquefrance.fr/maladie-dalzheimer-et-autres-demences/donnees" target="_blank" rel="noopener noreferrer">Santé publique France — Surveillance épidémiologique de la maladie d'Alzheimer et autres démences</a></li>
                  <li id="src-3"><b>3.</b><a href="https://www.fondation-mederic-alzheimer.org/alzheimer-en-chiffres/" target="_blank" rel="noopener noreferrer">Fondation Médéric Alzheimer — « Alzheimer en chiffres », d'après Alzheimer Europe, Dementia Prevalence Report 2025</a></li>
                  <li id="src-4"><b>4.</b><a href="https://www.vaincrealzheimer.org/la-maladie/quelques-chiffres/" target="_blank" rel="noopener noreferrer">Fondation Vaincre Alzheimer — « Alzheimer en quelques chiffres » (nouveaux cas diagnostiqués chaque année)</a></li>
                  <li id="src-5"><b>5.</b><a href="https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/des-residents-de-plus-en-plus-ages-et" target="_blank" rel="noopener noreferrer">DREES — « Des résidents de plus en plus âgés et dépendants dans les Ehpad » (part des résidents atteints d'une maladie neurodégénérative)</a></li>
                  <li id="src-6"><b>6.</b><a href="https://www.has-sante.fr" target="_blank" rel="noopener noreferrer">Haute Autorité de Santé — Recommandations sur les interventions non médicamenteuses dans les troubles du comportement liés aux maladies neurocognitives</a></li>
                  <li id="src-7"><b>7.</b><a href="https://www.igas.gouv.fr/sites/igas/files/2024-04/Evaluation%20des%20dispositifs%20sp%C3%A9cialis%C3%A9s%20de%20prise%20en%20charge%20des%20personnes%20atteintes%20de%20maladies%20neurod%C3%A9g%C3%A9n%C3%A9ratives.pdf" target="_blank" rel="noopener noreferrer">IGAS — Évaluation des dispositifs spécialisés de prise en charge des personnes atteintes de maladies neurodégénératives, 2024</a></li>
                </ol>
              </details>
            </PageShell>
          )}

          {page === "fonctionnalites" && (
            <PageShell kicker="Fonctionnalités" title="Une bibliothèque. Deux niveaux de lecture." onBack={goHero}
              intro="Tout ce qu'il faut pour trouver la bonne pratique, la garder à portée de main, et la faire vivre en équipe.">

              <div className="levels-grid">
                <div className="level-card standard">
                  <b>Standard</b>
                  <p>L'essentiel, immédiatement. Des fiches synthétiques pour retrouver rapidement une pratique, comprendre son principe et disposer de repères opérationnels — pensées pour être consultées en quelques instants, directement sur le terrain.</p>
                </div>
                <div className="level-arrow">→</div>
                <div className="level-card expert">
                  <b>Expert</b>
                  <p>Pour aller plus loin. Des fiches approfondies pour les professionnels qui souhaitent mieux comprendre les mécanismes, les conditions d'utilisation, les points de vigilance et les adaptations possibles.</p>
                </div>
              </div>

              <div className="feat-grid">
                <div className="feat"><div className="feat-icon"><svg className="ic" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg></div><div><h4>Plus de 1500 fiches</h4><p>Une bibliothèque riche et évolutive, consultable à tout moment.</p></div></div>
                <div className="feat"><div className="feat-icon"><svg className="ic" viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" /></svg></div><div><h4>Standard et Expert</h4><p>Deux niveaux de lecture pour ajuster la réflexion à chaque profil de l'équipe.</p></div></div>
                <div className="feat"><div className="feat-icon"><svg className="ic" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg></div><div><h4>Fiches créées pour le terrain</h4><p>Chaque professionnel peut créer ses propres fiches selon ses besoins.</p></div></div>
                <div className="feat"><div className="feat-icon"><svg className="ic" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div><div><h4>Favoris individuels et d'équipe</h4><p>Retrouver et partager rapidement les ressources utiles.</p></div></div>
              </div>

              <h4 className="block-title">Plus de 1500 ressources, organisées par thématique</h4>
              <div className="topics-grid">
                <div className="topic-item"><b>Communication</b><span>Des repères pour faciliter les interactions et préserver une relation adaptée.</span></div>
                <div className="topic-item"><b>Relaxation &amp; respiration</b><span>Des approches favorisant l'apaisement et la régulation.</span></div>
                <div className="topic-item"><b>Activité physique</b><span>Des pratiques adaptées aux capacités et aux possibilités de chacun.</span></div>
                <div className="topic-item"><b>Sommeil &amp; routine</b><span>Des repères pour structurer le quotidien et favoriser un environnement sécurisant.</span></div>
                <div className="topic-item"><b>Environnement</b><span>Des pistes pour agir sur les facteurs environnementaux susceptibles d'influencer les comportements.</span></div>
                <div className="topic-item"><b>Activités &amp; stimulation</b><span>Des propositions adaptées aux capacités, aux intérêts et au contexte de la personne.</span></div>
              </div>
              <p className="topics-more">Et bien d'autres thématiques.</p>

              <div className="flyer">
                <div className="flyer-inner">
                  <div className="flyer-text">
                    <div className="flyer-title">Utiliser des interventions non médicamenteuses <span>tout en se formant au quotidien.</span></div>
                    <div className="flyer-count"><b>1500+</b><span>fiches de techniques non médicamenteuses et d'outils de compréhension des troubles, sourcées HAS, NICE, France Alzheimer, OMS et sociétés savantes.</span></div>
                  </div>
                  <div className="flyer-devices" aria-hidden="true">
                    <div className="device tablet">
                      <div className="device-head"><img src="/logo-phoenix.png" alt="" /><span>Apézeo</span></div>
                      <div className="mock-fiche">
                        <div className="mock-badge" />
                        <div className="mock-line w70" />
                        <div className="mock-line w90" />
                        <div className="mock-line w50" />
                        <div className="mock-chip" />
                      </div>
                    </div>
                    <div className="device phone">
                      <div className="mock-fiche small">
                        <div className="mock-badge sm" />
                        <div className="mock-line w80" />
                        <div className="mock-line w60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="two-col-blocks">
                <div className="mini-block">
                  <h4 className="block-title">Votre terrain a aussi ses bonnes pratiques</h4>
                  <p>Toutes les pratiques pertinentes ne figurent pas nécessairement dans une bibliothèque générique. Avec Apézeo, les professionnels peuvent créer leurs propres fiches pour formaliser une pratique développée au sein de leur équipe — la formaliser, la partager, la faire connaître.</p>
                </div>
                <div className="mini-block">
                  <h4 className="block-title">Retrouvez ce qui vous est utile</h4>
                  <p>Une pratique régulièrement utilisée ne devrait pas nécessiter une nouvelle recherche. Enregistrez vos fiches en favoris et retrouvez-les immédiatement — favoris personnels, favoris partagés avec l'équipe, accès rapide aux ressources les plus utilisées.</p>
                </div>
              </div>
            </PageShell>
          )}

          {page === "installation" && (
            <PageShell kicker="Installation" title="Disponible partout où vous travaillez." onBack={goHero}
              intro="Apézeo fonctionne comme une Progressive Web App (PWA). Pas besoin d'installation complexe : la bibliothèque reste accessible depuis les principaux navigateurs et peut être installée sur l'écran d'accueil comme une application.">

              <div className="everywhere-row">
                <span>Ordinateur</span><span>·</span><span>Tablette</span><span>·</span><span>Smartphone</span>
              </div>

              <div className="install-grid">
                <article className="install-card">
                  <h4>Android · Chrome</h4><p>Ajoutez Apézeo à l'écran d'accueil depuis Chrome.</p>
                  <div className="steps">
                    <div className="step"><b><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" /></svg></b><span>Ouvrir Apézeo dans Chrome.</span></div>
                    <div className="step"><b><svg className="ic" viewBox="0 0 24 24" strokeWidth="2.4"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></b><span>Ouvrir le menu du navigateur.</span></div>
                    <div className="step"><b><svg className="ic" viewBox="0 0 24 24"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg></b><span>Choisir « Installer l'application ».</span></div>
                  </div>
                </article>
                <article className="install-card">
                  <h4>iPhone / iPad · Safari</h4><p>Ajoutez Apézeo à l'écran d'accueil depuis Safari.</p>
                  <div className="steps">
                    <div className="step"><b><svg className="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polygon points="16,8 13,13 8,16 11,11" /></svg></b><span>Ouvrir Apézeo dans Safari.</span></div>
                    <div className="step"><b><svg className="ic" viewBox="0 0 24 24"><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg></b><span>Appuyer sur « Partager ».</span></div>
                    <div className="step"><b><svg className="ic" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8" /><path d="M8 12h8" /></svg></b><span>Choisir « Sur l'écran d'accueil ».</span></div>
                  </div>
                </article>
              </div>

              <p className="tagline-end">Au bureau. Dans une unité. En salle de soins. Au domicile. La ressource suit le professionnel.</p>
            </PageShell>
          )}

          {page === "tarifs" && (
            <PageShell kicker="Accès &amp; tarifs" title="Actuellement accessible gratuitement aux établissements." onBack={goHero}>
              <div className="access-box">
                <p>Apézeo est une bibliothèque numérique de pratiques non médicamenteuses destinée aux professionnels accompagnant les personnes vivant avec des troubles neurocognitifs.</p>
                <p>La plateforme est <strong>actuellement proposée gratuitement</strong> aux établissements souhaitant la découvrir et l'expérimenter sur le terrain. Cette phase permet de recueillir les retours des professionnels et de faire évoluer l'outil au plus près des besoins du terrain.</p>
                <p>Les modalités d'accès pourront évoluer à l'avenir, notamment avec la possibilité de proposer certaines fonctionnalités dans le cadre d'offres payantes. Toute évolution sera communiquée aux utilisateurs concernés.</p>
              </div>

              <h4 className="block-title">Des pratiques documentées, des sources identifiables</h4>
              <p className="sources-sober">Les contenus d'Apézeo s'appuient notamment sur des ressources issues de HAS · NICE · France Alzheimer · sociétés savantes · organismes de référence. L'objectif n'est pas de multiplier les références pour donner une apparence scientifique, mais de permettre aux professionnels de retrouver l'origine des informations et d'approfondir lorsque cela est nécessaire.</p>
            </PageShell>
          )}

          <footer>
            <div className="footer-links">
              <button onClick={() => setPage("pourquoi")}>Pourquoi Apézeo</button>
              <button onClick={() => setPage("fonctionnalites")}>Fonctionnalités</button>
              <button onClick={() => setPage("installation")}>Installer</button>
              <button onClick={() => setPage("tarifs")}>Accès &amp; tarifs</button>
              <button onClick={() => onChoose("pro")}>Connexion</button>
            </div>
            © Apézeo — Ressources d'accompagnement non médicamenteuses
          </footer>

        </div>
      </div>
    </div>
  );
}
