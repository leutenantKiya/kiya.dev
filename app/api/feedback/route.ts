import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type Sql = ReturnType<typeof getDb>;

// The neon HTTP driver sends one request per query, so running CREATE TABLE
// before every read/write doubled the round trips. Create it lazily instead:
// run the real query first, and only create the table when Postgres reports
// it missing (error 42P01).
async function createTable(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS feedback_cards (
      id VARCHAR(100) PRIMARY KEY,
      category VARCHAR(50) NOT NULL,
      author VARCHAR(100) NOT NULL,
      message TEXT NOT NULL,
      timestamp VARCHAR(100) NOT NULL,
      drawing_data_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

function isMissingTable(error: unknown) {
  return (error as { code?: string })?.code === "42P01";
}

async function withTable<T>(sql: Sql, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!isMissingTable(error)) throw error;
    await createTable(sql);
    return run();
  }
}

// GET: one random handful of notes, plus the total.
// The board only ever shows a few cards, so picking them here keeps the doodle
// blobs out of the response for every note we are not about to draw.
export async function GET(req: Request) {
  try {
    const sql = getDb();

    const requested = Number(new URL(req.url).searchParams.get("limit"));
    const limit = Number.isFinite(requested)
      ? Math.min(Math.max(Math.trunc(requested), 1), 12)
      : 6;

    const [rows, totals] = await withTable(sql, () =>
      Promise.all([
        sql`
          SELECT
            id,
            category,
            author,
            message,
            timestamp,
            drawing_data_url AS "drawingDataUrl"
          FROM feedback_cards
          ORDER BY random()
          LIMIT ${limit};
        `,
        sql`SELECT count(*)::int AS total FROM feedback_cards;`,
      ])
    );

    return NextResponse.json({
      success: true,
      cards: rows,
      total: totals[0]?.total ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: store a new note / doodle in Neon
export async function POST(req: Request) {
  try {
    const sql = getDb();

    const body = await req.json();
    const { id, category, author, message, timestamp, drawingDataUrl } = body;

    if (!author?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "author and message are required" },
        { status: 400 }
      );
    }

    const cardId = id || "card_" + Date.now();
    const cardCategory = category || "Apresiasi";
    const cardTimestamp = timestamp || "Hari ini";

    await withTable(
      sql,
      () => sql`
        INSERT INTO feedback_cards (id, category, author, message, timestamp, drawing_data_url)
        VALUES (${cardId}, ${cardCategory}, ${author}, ${message}, ${cardTimestamp}, ${drawingDataUrl || null})
        ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          author = EXCLUDED.author,
          message = EXCLUDED.message,
          timestamp = EXCLUDED.timestamp,
          drawing_data_url = EXCLUDED.drawing_data_url;
      `
    );

    return NextResponse.json({ success: true, id: cardId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
