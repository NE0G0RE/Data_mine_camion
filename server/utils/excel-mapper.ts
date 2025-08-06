// Fonctions utilitaires pour mapper les valeurs Excel vers notre schéma
export function mapStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("yes") || v.includes("ok") || v === "1") return "oui";
  if (v.includes("non") || v.includes("no") || v.includes("ko") || v === "0") return "non";
  return "na";
}

export function mapTruckStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("fonctionnel") || v.includes("ok")) return "fonctionnel";
  if (v.includes("non") || v.includes("ko")) return "non_fonctionnel";
  return "test_requis";
}

export function mapPresence(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("yes") || v.includes("présent")) return "oui";
  return "non";
}

export function mapCompatibility(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("compatible") || v.includes("ok")) return "compatible";
  if (v.includes("incompatible") || v.includes("ko")) return "incompatible";
  return "test_requis";
}

export function mapAppStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("installé") || v.includes("ok")) return "installe";
  if (v.includes("erreur")) return "erreur";
  return "non_installe";
}

export function mapMaterial(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("présent")) return "oui";
  if (v.includes("non") && !v.includes("besoin")) return "non";
  return "pas_besoin";
}

export function mapMaterialStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("complet") || v.includes("ok")) return "complet";
  if (v.includes("manquant")) return "manquant";
  return "partiel";
}

export function mapTestStatus(value: string): string {
  const v = value.toLowerCase().trim();
  if (v.includes("oui") || v.includes("ok") || v.includes("validé")) return "oui";
  if (v.includes("cours") || v.includes("progress")) return "en_cours";
  return "non";
} 