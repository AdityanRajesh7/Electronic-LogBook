export const DEPARTMENTS = [
  "Pediatrics",
  "General Medicine",
  "General Surgery",
  "Obstetrics & Gynecology",
  "Orthopedics",
  "Radiodiagnosis",
] as const;

export const DEPARTMENT_HOD = "Dr. Mohammed M T P";

export const POSTING_OPTIONS = [
  "Ward Posting U1",
  "Ward Posting U2",
  "PICU",
  "NICU",
  "DRP",
] as const;

export const POSTING_CHIEFS: Record<(typeof POSTING_OPTIONS)[number], string> = {
  "Ward Posting U1": "Dr. Mohammed M T P",
  "Ward Posting U2": "Dr. Mohammed M T P",
  PICU: "Dr. Urmila K V",
  NICU: "Dr. Reetha G",
  DRP: "Dr. Mohammed M T P",
};

export const PROCEDURE_REQUIREMENTS = [
  { name: "Endotracheal Intubation", required: 15, group: "emergency" },
  { name: "Lumbar Puncture", required: 20, group: "invasive" },
  { name: "ICD Insertion", required: 5, group: "emergency" },
  { name: "Bone Marrow Aspiration", required: 3, group: "invasive" },
  { name: "Central Venous Line Insertion", required: 3, group: "invasive" },
  { name: "Peritoneal Dialysis", required: 2, group: "invasive" },
  { name: "Umbilical Venous Catheterisation", required: 20, group: "invasive" },
  { name: "Arterial Blood Gas", required: 3, group: "emergency" },
  { name: "Mechanical Ventilation Setup", required: 20, group: "emergency" },
  { name: "CPAP / HFNC", required: 10, group: "emergency" },
] as const;

export type ProcedureGroup = (typeof PROCEDURE_REQUIREMENTS)[number]["group"];

export const PROCEDURE_GROUPS: Record<ProcedureGroup, string[]> = {
  emergency: PROCEDURE_REQUIREMENTS
    .filter((procedure) => procedure.group === "emergency")
    .map((procedure) => procedure.name),
  invasive: PROCEDURE_REQUIREMENTS
    .filter((procedure) => procedure.group === "invasive")
    .map((procedure) => procedure.name),
};

export const PROCEDURE_OPTIONS = PROCEDURE_REQUIREMENTS.map((procedure) => procedure.name);
export const REQUIRED_PROCEDURE_COUNT = PROCEDURE_REQUIREMENTS.reduce(
  (total, procedure) => total + procedure.required,
  0,
);

export const ACADEMIC_REQUIREMENTS = [
  { name: "Case Discussion", requirement: "50 total", target: 50 },
  { name: "Journal Club", requirement: "2 per month", target: 2 },
  { name: "Seminar", requirement: "2 per month", target: 2 },
  { name: "Interesting Case Presentation", requirement: "1 per month", target: 1 },
] as const;

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

export function expectedCompletionDate(joiningDate: string): string {
  if (!joiningDate) return "";
  const [year, month, day] = joiningDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(year + 3, month - 1, day);
  if (Number.isNaN(date.getTime())) return "";
  const completionYear = date.getFullYear();
  const completionMonth = String(date.getMonth() + 1).padStart(2, "0");
  const completionDay = String(date.getDate()).padStart(2, "0");
  return `${completionYear}-${completionMonth}-${completionDay}`;
}
