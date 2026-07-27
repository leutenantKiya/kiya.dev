import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper otomatis untuk membuat tabel jika belum ada di database Neon
async function initDb(sql: ReturnType<typeof getDb>) {
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

// GET: Mengambil daftar feedback dari database Neon
export async function GET() {
  try {
    const sql = getDb();
    await initDb(sql);

    const rows = await sql`
      SELECT 
        id, 
        category, 
        author, 
        message, 
        timestamp, 
        drawing_data_url AS "drawingDataUrl",
        created_at
      FROM feedback_cards
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    return NextResponse.json({ success: true, cards: rows });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Menyimpan masukan / doodle baru ke database Neon
export async function POST(req: Request) {
  try {
    const sql = getDb();
    await initDb(sql);

    const body = await req.json();
    const { id, category, author, message, timestamp, drawingDataUrl } = body;

    const cardId = id || "card_" + Date.now();
    const cardCategory = category || "Apresiasi";
    const cardTimestamp = timestamp || "Hari ini";

    await sql`
      INSERT INTO feedback_cards (id, category, author, message, timestamp, drawing_data_url)
      VALUES (${cardId}, ${cardCategory}, ${author}, ${message}, ${cardTimestamp}, ${drawingDataUrl || null})
      ON CONFLICT (id) DO UPDATE SET
        category = EXCLUDED.category,
        author = EXCLUDED.author,
        message = EXCLUDED.message,
        timestamp = EXCLUDED.timestamp,
        drawing_data_url = EXCLUDED.drawing_data_url;
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
