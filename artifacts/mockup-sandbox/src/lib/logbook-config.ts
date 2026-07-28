export const PROCEDURE_GROUPS = {
  emergency: [
    "Pediatric Basic Life Support",
    "Neonatal Resuscitation",
    "Bag-mask Ventilation",
    "Endotracheal Intubation",
    "Intraosseous Access",
  ],
  invasive: [
    "Lumbar Puncture",
    "Bone Marrow Aspiration",
    "Umbilical Venous Catheterisation",
    "Pleural Aspiration",
    "Surfactant Administration via ETT",
  ],
} as const;

export type ProcedureGroup = keyof typeof PROCEDURE_GROUPS;
export const PROCEDURE_OPTIONS = Object.values(PROCEDURE_GROUPS).flat();

export const REQUIRED_PROCEDURE_COUNT = 15;

export function formatLogbookDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value.toString();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function todayForInput(): string {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
