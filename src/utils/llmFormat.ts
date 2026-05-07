const SECTION_LABELS = [
  "Observation",
  "Analysis",
  "Action",
  "Documentation",
  "Source",
  "Data Gap",
  "Scout",
  "Self-Correction Note",
] as const;

type SectionLabel = (typeof SECTION_LABELS)[number];

function normalizeLabel(raw: string): SectionLabel | null {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  const match = SECTION_LABELS.find((l) => l.toLowerCase() === cleaned.toLowerCase());
  return match ?? null;
}

/**
 * Best-effort formatting so key sections render consistently,
 * even when the LLM doesn't output markdown.
 */
export function formatAssistantMarkdown(input: string): string {
  if (!input) return input;

  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  for (const line of lines) {
    // Matches: "Observation: ...", "DATA GAP: ...", "Self-Correction Note: ..."
    const colonMatch = line.match(/^\s*([A-Za-z][A-Za-z -]{1,60})\s*:\s*(.*)\s*$/);
    if (colonMatch) {
      const label = normalizeLabel(colonMatch[1]);
      if (label) {
        const rest = colonMatch[2]?.trim();
        out.push(`### ${label}`);
        if (rest) out.push(rest);
        out.push(""); // spacing between sections
        continue;
      }
    }

    // Matches: "O – Observation ...", "A - Analysis ...", etc.
    const oatdMatch = line.match(
      /^\s*([OATD])\s*[–-]\s*(Observation|Analysis|Action|Documentation)\b\s*:?\s*(.*)\s*$/
    );
    if (oatdMatch) {
      const label = normalizeLabel(oatdMatch[2]);
      if (label) {
        const rest = oatdMatch[3]?.trim();
        out.push(`### ${label}`);
        if (rest) out.push(rest);
        out.push("");
        continue;
      }
    }

    out.push(line);
  }

  // Avoid excessive trailing whitespace.
  return out.join("\n").replace(/\n{3,}$/g, "\n\n").trim();
}

