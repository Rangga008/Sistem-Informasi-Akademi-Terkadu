import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { user, skills, projects } = body;

		// Prepare prompt for AI
		const highlighted = (projects || [])
			.filter((p: any) => p.highlight)
			.slice(0, 5);
		const prompt = `Generate a concise, professional CV/resume for the following student. Use Indonesian language. Make a short professional summary, list skills, and include highlighted projects with a short description and role. Format using simple HTML sections.

Student:
Name: ${user?.name || "Unknown"}
Email: ${user?.email || ""}
Location: ${user?.location || ""}

Skills: ${(skills || []).map((s: any) => s.name).join(", ")}

Highlighted Projects (title - description):\n${highlighted
			.map((p: any) => `${p.title} - ${p.description}`)
			.join("\n")}

Please output only the HTML body (no <html> or <head>), with clear headings and short paragraphs.`;

		const OPENAI_KEY =
			process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

		if (!OPENAI_KEY) {
			// Fallback: return simple HTML if no key present
			const fallbackHtml = `<div style="font-family:system-ui, sans-serif;line-height:1.4;color:#111"><h1>${
				user?.name || "Nama"
			}</h1><p><strong>Email:</strong> ${
				user?.email || "-"
			}</p><p><strong>Lokasi:</strong> ${
				user?.location || "-"
			}</p><h2>Ringkasan</h2><p>${
				user?.bio || "Belum ada ringkasan."
			}</p><h2>Skills</h2><p>${
				(skills || []).map((s: any) => s.name).join(", ") || "-"
			}</p><h2>Highlighted Projects</h2>${highlighted
				.map((p: any) => `<h3>${p.title}</h3><p>${p.description}</p>`)
				.join("")}</div>`;
			return NextResponse.json({ ok: true, html: fallbackHtml });
		}

		// Call OpenAI Chat Completions (Chat API)
		const res = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [{ role: "user", content: prompt }],
				max_tokens: 800,
				temperature: 0.2,
			}),
		});

		if (!res.ok) {
			const text = await res.text();
			console.error("OpenAI error", res.status, text);
			return NextResponse.json(
				{ ok: false, error: "AI provider error", text },
				{ status: 502 }
			);
		}

		const data = await res.json();
		const aiText = data.choices?.[0]?.message?.content || "";

		// AI might return raw HTML as asked — return as html
		return NextResponse.json({ ok: true, html: aiText });
	} catch (err) {
		console.error("generate-cv error", err);
		return NextResponse.json(
			{ ok: false, error: "server error" },
			{ status: 500 }
		);
	}
}
