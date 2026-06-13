import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { buildImportPreview, importResultsFromJson } from "@/lib/results/import";

export async function POST(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { mode?: string; data?: unknown };
    const mode = body.mode === "import" ? "import" : "validate";
    const payload = body.data;

    if (payload == null) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (mode === "validate") {
      const result = await buildImportPreview(payload);
      return NextResponse.json({
        valid: result.valid,
        errors: result.errors,
        preview: result.preview,
      });
    }

    const { data, summary } = await importResultsFromJson(payload);
    return NextResponse.json({
      ok: true,
      summary,
      updatedAt: data.updatedAt,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import impossible" },
      { status: 400 }
    );
  }
}
