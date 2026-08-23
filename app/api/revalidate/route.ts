import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  revalidateTag("course", "max");
  return NextResponse.json({ revalidated: true, tag: "course" });
}
