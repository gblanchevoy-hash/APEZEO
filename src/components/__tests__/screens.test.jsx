import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuizView, RecommandationsView } from "../quiz.jsx";
import { Home_ } from "../Home.jsx";
import { GateV2 } from "../GateV2.jsx";
import { AidantApp } from "../../AidantApp.jsx";
import { AuthView } from "../AuthView.jsx";
import { mockFicheTechnique } from "../../test/fixtures.js";

const noop = () => {};

describe("QuizView", () => {
  it("s'affiche avec les 5 étapes du formulaire", () => {
    render(<QuizView onBack={noop} onSubmit={noop} />);
    expect(screen.getByText("Trouver la meilleure technique")).toBeInTheDocument();
    expect(screen.getByText("Type de fiche")).toBeInTheDocument();
  });
});

describe("RecommandationsView", () => {
  it("affiche un résultat sans planter", () => {
    render(
      <RecommandationsView title="Test" results={[{ f: mockFicheTechnique, pct: 80 }]} suggestions={[]}
        favoris={{ liked: [], disliked: [] }} onBack={noop} onOpenFiche={noop} />
    );
    expect(screen.getByText(mockFicheTechnique.titre)).toBeInTheDocument();
  });

  it("affiche les suggestions quand aucun résultat exact", () => {
    render(
      <RecommandationsView title="Test" results={[]} suggestions={[mockFicheTechnique]}
        favoris={{ liked: [], disliked: [] }} onBack={noop} onOpenFiche={noop} />
    );
    expect(screen.getByText("Ces fiches peuvent peut-être vous intéresser")).toBeInTheDocument();
  });
});

describe("Home_ (accueil Pro)", () => {
  it("s'affiche sans planter", () => {
    render(
      <Home_ fiches={[mockFicheTechnique]} dbCount={1} profession="Aide-soignant" isAdmin={false} isSuperAdmin={false}
        canToggleExpert modeExpert={false} onToggleAffichage={noop} onOpenTroubles={noop} onOpenBesoins={noop}
        onOpenOutils={noop} onOpenSearch={noop} onOpenFavoris={noop} onOpenQuiz={noop} onOpenAdd={noop}
        onOpenTeam={noop} onOpenCreateStructure={noop} onOpenSuperAdminStats={noop} onOpenMesFiches={noop}
        onOpenLegal={noop} onOpenCompte={noop} onRefresh={noop} onLogout={noop} onChangeMode={noop} />
    );
    expect(screen.getByText("Un geste apaisant, tout de suite.")).toBeInTheDocument();
  });
});

describe("GateV2 (nouvelle landing page)", () => {
  it("s'affiche sans planter et les deux parcours sont présents", () => {
    render(<GateV2 onChoose={noop} />);
    expect(screen.getAllByText(/Apézeo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/espace professionnel/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/espace aidant/i).length).toBeGreaterThan(0);
  });
});

describe("AuthView", () => {
  it("s'affiche sans planter", () => {
    render(<AuthView onChooseAidant={noop} />);
    expect(screen.getByText("Connexion")).toBeInTheDocument();
  });
});

describe("AidantApp", () => {
  it("s'affiche sans planter (accueil aidant, après clic sur la carte ambre de la landing)", () => {
    render(<AidantApp onChangeMode={noop} />);
    expect(screen.getAllByText(/Apézeo/i).length).toBeGreaterThan(0);
  });
});
