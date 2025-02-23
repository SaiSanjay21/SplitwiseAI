import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function analyzeReceipt(base64Image: string): Promise<{
  totalAmount: number;
  items: Array<{ description: string; amount: number; symbol?: string }>;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this receipt image. Extract the total amount and identify any symbols (like *, #, @, etc.) next to items. Return the data in JSON format with fields: totalAmount and items (array with description, amount, and optional symbol for each item)."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}
