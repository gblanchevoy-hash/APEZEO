import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FicheDetailView, LogView, FicheFormView } from "../ficheDetail.jsx";
import { mockFicheTechnique, mockFicheConcept, mockFicheOutil, mockFicheStandard } from "../../test/fixtures.js";

const noop = () => {};
const favoris = { liked: [], disliked: [] };

describe("FicheDetailView", () => {
  it("affiche une fiche technique (niveau Expert) sans planter", () => {
    render(<FicheDetailView fiche={mockFicheTechnique} favoris={favoris} onBack={noop} onToggleLike={noop} onToggleDislike={noop} />);
    expect(screen.getByText(mockFicheTechnique.titre)).toBeInTheDocument();
    expect(screen.getByText("Technique")).toBeInTheDocument();
  });

  it("affiche une fiche concept avec le badge Explicatif", () => {
    render(<FicheDetailView fiche={mockFicheConcept} favoris={favoris} onBack={noop} onToggleLike={noop} onToggleDislike={noop} />);
    expect(screen.getByText("Explicatif")).toBeInTheDocument();
  });

  it("affiche une fiche outil (mise en page dédiée) sans planter", () => {
    render(<FicheDetailView fiche={mockFicheOutil} favoris={favoris} onBack={noop} onToggleLike={noop} onToggleDislike={noop} />);
    expect(screen.getByText(mockFicheOutil.titre)).toBeInTheDocument();
  });

  it("affiche une fiche standard (non Expert) sans planter", () => {
    render(<FicheDetailView fiche={mockFicheStandard} favoris={favoris} onBack={noop} onToggleLike={noop} onToggleDislike={noop} />);
    expect(screen.getByText(mockFicheStandard.titre)).toBeInTheDocument();
  });

  it("affiche le mode simple (Aidant) sans planter", () => {
    render(<FicheDetailView fiche={mockFicheStandard} favoris={favoris} onBack={noop} onToggleLike={noop} onToggleDislike={noop} simple />);
    expect(screen.getByText(mockFicheStandard.titre)).toBeInTheDocument();
  });
});

describe("LogView", () => {
  it("s'affiche sans planter", () => {
    render(<LogView fiche={mockFicheTechnique} onBack={noop} onSave={noop} />);
    expect(screen.getByText("Enregistrer un essai")).toBeInTheDocument();
  });
});

describe("FicheFormView", () => {
  it("s'affiche sans planter (nouvelle fiche)", () => {
    render(<FicheFormView initial={{ titre: "", categorie: "Communication", troubles: [], stades: [], niveauPreuve: 3, description: "", pourquoi: "", quandUtiliser: "", dureeMinutes: 5, etapes: [], materiel: [] }} onBack={noop} onSave={noop} />);
    expect(screen.getByText("Nouvelle fiche personnelle")).toBeInTheDocument();
  });
});
