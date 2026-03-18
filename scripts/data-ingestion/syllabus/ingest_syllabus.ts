import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

type Level = "subject" | "unit" | "chapter" | "topic" | "subtopic";

type TreeNode = {
  level: Level;
  code: string;
  title: string;
  ncert_chapter_number?: number | null;
  is_deleted_from_boards?: boolean;
  children?: TreeNode[];
};

type NcertTree = {
  subjects: TreeNode[];
};

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function runInsforge(args: string[], description: string): { stdout: string; stderr: string } {
  const isWin = process.platform === "win32";

  // On Windows, reliably pass SQL (single argv) by base64-decoding inside PowerShell.
  const result = isWin
    ? (() => {
        const b64 = Buffer.from(JSON.stringify(args), "utf8").toString("base64");
        const ps = [
          "$ErrorActionPreference='Stop';",
          `$argsJson=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${b64}'));`,
          "$cliArgs=ConvertFrom-Json $argsJson;",
          // Call: npx --yes @insforge/cli <args...>
          "& npx --yes @insforge/cli @cliArgs;",
        ].join(" ");
        return spawnSync(
          "powershell",
          ["-NoProfile", "-Command", ps],
          { encoding: "utf8", shell: false, windowsHide: true }
        );
      })()
    : spawnSync("npx", ["@insforge/cli", ...args], { encoding: "utf8", shell: false });

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    const err =
      (result as any).error && (result as any).error instanceof Error
        ? String((result as any).error.message || (result as any).error)
        : "";
    throw new Error(
      [
        `InsForge CLI failed (${description}).`,
        `Command: npx @insforge/cli ${args.join(" ")}`,
        err ? `SPAWN ERROR:\n${err}` : "",
        stdout ? `STDOUT:\n${stdout}` : "",
        stderr ? `STDERR:\n${stderr}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  return { stdout: (result.stdout || "").trim(), stderr: (result.stderr || "").trim() };
}

function runInsforgeJson(args: string[], description: string): unknown {
  const { stdout } = runInsforge([...args, "--json"], description);
  if (!stdout) return null;

  try {
    return JSON.parse(stdout) as unknown;
  } catch {
    // Some CLI builds may print non-JSON even with --json; return raw.
    return stdout;
  }
}

function runDbQueryReturningId(sql: string, description: string): string {
  const normalizedSql = sql.replace(/\s+/g, " ").trim();
  const out = runInsforgeJson(["db", "query", normalizedSql], description);

  // Expected (most common): { rows: [ { id: "uuid" } ] }
  if (out && typeof out === "object") {
    const anyOut = out as any;
    const rows = anyOut.rows;
    if (Array.isArray(rows) && rows.length > 0 && rows[0]?.id) {
      return String(rows[0].id);
    }
    // Alternate: { data: [...] } or direct array
    const data = anyOut.data;
    if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
      return String(data[0].id);
    }
  }
  if (Array.isArray(out) && out.length > 0 && (out as any)[0]?.id) {
    return String((out as any)[0].id);
  }

  throw new Error(
    `Could not parse returned id (${description}). Raw output:\n${JSON.stringify(out, null, 2)}`
  );
}

function upsertNode(params: {
  subjectName: string;
  board: string;
  exam: string;
  level: "subject" | "unit" | "chapter";
  parentId: string | null;
  code: string;
  title: string;
  displayOrder: number;
  ncertChapterNumber: number | null;
  isActive: boolean;
}): string {
  const parentExpr = params.parentId
    ? `'${escapeSqlString(params.parentId)}'::uuid`
    : "NULL";

  const sql = [
    "INSERT INTO public.syllabus_hierarchy",
    "  (subject, board, exam, level, parent_id, code, title, display_order, ncert_chapter_number, is_active)",
    "VALUES",
    `  ('${escapeSqlString(params.subjectName)}', '${escapeSqlString(
      params.board
    )}', '${escapeSqlString(params.exam)}', '${escapeSqlString(
      params.level
    )}', ${parentExpr}, '${escapeSqlString(params.code)}', '${escapeSqlString(
      params.title
    )}', ${params.displayOrder}, ${
      params.ncertChapterNumber === null ? "NULL" : params.ncertChapterNumber
    }, ${params.isActive ? "true" : "false"})`,
    "ON CONFLICT (code) DO UPDATE SET",
    "  subject = EXCLUDED.subject,",
    "  board = EXCLUDED.board,",
    "  exam = EXCLUDED.exam,",
    "  level = EXCLUDED.level,",
    "  parent_id = EXCLUDED.parent_id,",
    "  title = EXCLUDED.title,",
    "  display_order = EXCLUDED.display_order,",
    "  ncert_chapter_number = EXCLUDED.ncert_chapter_number,",
    "  is_active = EXCLUDED.is_active",
    "RETURNING id;",
  ].join("\n");

  return runDbQueryReturningId(sql, `upsert ${params.level} ${params.code}`);
}

function normalizeIsActive(node: TreeNode): boolean {
  return node.is_deleted_from_boards ? false : true;
}

function ingestTree(tree: NcertTree): void {
  const board = "NCERT";
  const exam = "CUET";

  for (let sIdx = 0; sIdx < tree.subjects.length; sIdx++) {
    const subjectNode = tree.subjects[sIdx];
    if (subjectNode.level !== "subject") {
      throw new Error(
        `Invalid root node level at subjects[${sIdx}]: expected "subject", got "${subjectNode.level}"`
      );
    }

    const subjectName = subjectNode.title;
    const subjectId = upsertNode({
      subjectName,
      board,
      exam,
      level: "subject",
      parentId: null,
      code: subjectNode.code,
      title: subjectNode.title,
      displayOrder: sIdx + 1,
      ncertChapterNumber: null,
      isActive: normalizeIsActive(subjectNode),
    });

    const units = subjectNode.children ?? [];
    for (let uIdx = 0; uIdx < units.length; uIdx++) {
      const unitNode = units[uIdx];
      if (unitNode.level !== "unit") {
        throw new Error(
          `Invalid unit node level under ${subjectNode.code}: expected "unit", got "${unitNode.level}"`
        );
      }

      const unitId = upsertNode({
        subjectName,
        board,
        exam,
        level: "unit",
        parentId: subjectId,
        code: unitNode.code,
        title: unitNode.title,
        displayOrder: uIdx + 1,
        ncertChapterNumber: null,
        isActive: normalizeIsActive(unitNode),
      });

      const chapters = unitNode.children ?? [];
      for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
        const chapterNode = chapters[cIdx];
        if (chapterNode.level !== "chapter") {
          // We only inject the skeleton (subject/unit/chapter) in this phase.
          continue;
        }

        upsertNode({
          subjectName,
          board,
          exam,
          level: "chapter",
          parentId: unitId,
          code: chapterNode.code,
          title: chapterNode.title,
          displayOrder: cIdx + 1,
          ncertChapterNumber:
            typeof chapterNode.ncert_chapter_number === "number"
              ? chapterNode.ncert_chapter_number
              : null,
          isActive: normalizeIsActive(chapterNode),
        });
      }
    }
  }
}

function fetchVerificationCounts(): Record<string, number> {
  const sql = [
    "SELECT level, COUNT(*)::int AS count",
    "FROM public.syllabus_hierarchy",
    "WHERE is_active = true",
    "  AND level IN ('subject','unit','chapter')",
    "GROUP BY level",
    "ORDER BY level;",
  ].join("\n");

  const normalizedSql = sql.replace(/\s+/g, " ").trim();
  const out = runInsforgeJson(["db", "query", normalizedSql], "verification counts");

  const rows =
    out && typeof out === "object" && Array.isArray((out as any).rows)
      ? ((out as any).rows as any[])
      : Array.isArray(out)
        ? (out as any[])
        : [];

  const counts: Record<string, number> = { subject: 0, unit: 0, chapter: 0 };
  for (const r of rows) {
    const level = String(r.level);
    const count = Number(r.count);
    if (level in counts && Number.isFinite(count)) counts[level] = count;
  }
  return counts;
}

function main() {
  // Preflight: ensure authenticated + project linked.
  runInsforge(["whoami"], "whoami");
  runInsforge(["current"], "current project");

  const treePath = path.resolve(__dirname, "ncert_tree.json");
  const raw = readFileSync(treePath, "utf8");
  const tree = JSON.parse(raw) as NcertTree;

  if (!tree?.subjects || !Array.isArray(tree.subjects)) {
    throw new Error("Invalid ncert_tree.json: expected { subjects: [...] }");
  }

  ingestTree(tree);
  const counts = fetchVerificationCounts();

  // Print machine-readable output for the runner.
  // (We still use --json for InsForge, but this is for our own script output.)
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, counts }, null, 2));
}

main();

