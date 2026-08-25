import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TroublesView, OutilsView, FamillesView, FicheListView, SearchView,
  FavorisView, MesFichesView, HistoriqueView, AidantFavorisView,
} from "../browse.jsx";
import { mockFicheTechnique, mockFicheConcept } from "../../test/fixtures.js";

const fiches = [mockFicheTechnique, mockFicheConcept];
const noop = () => {};

describe("écrans de navigation (browse.jsx)", () => {
  it("TroublesView s'affiche sans planter", () => {
    render(<TroublesView fiches={fiches} onBack={noop} onOpenTrouble={noop} />);
    expect(screen.getByText("Choisir un trouble")).toBeInTheDocument();
  });

  it("OutilsView s'affiche sans planter", () => {
    render(<OutilsView fiches={fiches} onBack={noop} onOpenType={noop} />);
    expect(screen.getByText("Outils et soins spécifiques")).toBeInTheDocument();
  });

  it("FamillesView s'affiche sans planter", () => {
    render(<FamillesView fiches={fiches} onBack={noop} onOpenFamille={noop} />);
    expect(screen.getByText("Rechercher par besoin")).toBeInTheDocument();
  });

  it("FicheListView s'affiche avec des fiches technique + concept mélangées", () => {
    render(
      <FicheListView title="Test" items={fiches} onBack={noop} onOpenFiche={noop}
        favoris={{ liked: [], disliked: [] }} emptyLabel="Aucune fiche" />
    );
    expect(screen.getByText(mockFicheTechnique.titre)).toBeInTheDocument();
  });

  it("SearchView s'affiche sans planter", () => {
    render(<SearchView fiches={fiches} onBack={noop} onOpenFiche={noop} favoris={{ liked: [], disliked: [] }} />);
    expect(screen.getByText("Recherche libre")).toBeInTheDocument();
  });

  it("FavorisView s'affiche avec une fiche likée", () => {
    render(<FavorisView fiches={fiches} favoris={{ liked: [mockFicheTechnique.id], disliked: [] }} onBack={noop} onOpenFiche={noop} />);
    expect(screen.getByText(mockFicheTechnique.titre)).toBeInTheDocument();
  });

  it("MesFichesView s'affiche sans planter (aucune fiche perso)", () => {
    render(<MesFichesView fiches={fiches} favoris={{ liked: [], disliked: [] }} onBack={noop} onOpenFiche={noop} />);
    expect(screen.getByText("Mes fiches")).toBeInTheDocument();
  });

  it("HistoriqueView s'affiche sans planter", () => {
    render(<HistoriqueView historique={[]} ficheById={() => null} onBack={noop} />);
    expect(screen.getByText("Historique")).toBeInTheDocument();
  });

  // C'est ce test précis qui aurait attrapé le bug de l'icône Heart
  // manquante à l'import — la vue plante au rendu si un composant
  // JSX utilisé n'est pas importé.
  it("AidantFavorisView s'affiche avec un favori (régression icône Heart)", () => {
    render(<AidantFavorisView fiches={fiches} favoris={[mockFicheTechnique.id]} onBack={noop} onOpenFiche={noop} />);
    expect(screen.getByText(mockFicheTechnique.titre)).toBeInTheDocument();
  });
});
