import type { Scenario, ExportFormat } from "@/types";

export function scenariosToCSV(scenarios: Scenario[]): string {
  const headers = [
    "id",
    "fifaNumber",
    "qualifiedGroups",
    "excludedGroups",
    "includesSenegalGroup",
    "thirdIPlayedBy",
    "winner1IOpponent",
    "mappings",
  ];
  const rows = scenarios.map((s) =>
    [
      s.id,
      s.fifaNumber,
      s.qualifiedThirdPlaceGroups.join("-"),
      s.excludedGroups.join("-"),
      s.includesSenegalGroup,
      s.thirdIPlayedBy ?? "",
      s.winner1IOpponent ?? "",
      s.mappings.map((m) => `${m.winner}:${m.opponent}`).join("|"),
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function scenariosToJSON(scenarios: Scenario[]): string {
  return JSON.stringify(scenarios, null, 2);
}

export function downloadBlob(content: string | Blob, filename: string, mime: string) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportScenarios(
  scenarios: Scenario[],
  format: ExportFormat,
  filename = "senegal-scenarios"
): Promise<void> {
  switch (format) {
    case "csv":
      downloadBlob(scenariosToCSV(scenarios), `${filename}.csv`, "text/csv");
      break;
    case "json":
      downloadBlob(scenariosToJSON(scenarios), `${filename}.json`, "application/json");
      break;
    case "xlsx": {
      const XLSX = await import("xlsx");
      const data = scenarios.map((s) => ({
        ID: s.id,
        FIFA: s.fifaNumber,
        Groups: s.qualifiedThirdPlaceGroups.join(", "),
        Senegal: s.includesSenegalGroup ? "Oui" : "Non",
        "1I vs": s.winner1IOpponent,
        "3I joué par": s.thirdIPlayedBy,
        Mappings: s.mappings.map((m) => `${m.winner}→${m.opponent}`).join(" "),
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Scenarios");
      XLSX.writeFile(wb, `${filename}.xlsx`);
      break;
    }
    case "pdf": {
      const { default: JsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new JsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("SenegalScenario2026 — Export Scenarios", 14, 15);
      autoTable(doc, {
        startY: 22,
        head: [["ID", "FIFA #", "Groupes qualifiés", "Sénégal", "1I vs", "3I par"]],
        body: scenarios.slice(0, 100).map((s) => [
          s.id,
          s.fifaNumber,
          s.qualifiedThirdPlaceGroups.join(", "),
          s.includesSenegalGroup ? "✓" : "—",
          s.winner1IOpponent ?? "—",
          s.thirdIPlayedBy ?? "—",
        ]),
      });
      if (scenarios.length > 100) {
        doc.setFontSize(8);
        doc.text(`… ${scenarios.length - 100} lignes supplémentaires (export CSV/Excel complet)`, 14, doc.internal.pageSize.height - 10);
      }
      doc.save(`${filename}.pdf`);
      break;
    }
  }
}
