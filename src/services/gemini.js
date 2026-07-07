const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export async function generateReply(message) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Write a professional reply to this message:\n\n${message}`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "No reply generated."
  );
}