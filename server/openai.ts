import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function processReceipt(base64Image: string, symbols: string[]): Promise<{
  total: number;
  splits: Array<{ symbol: string; amount: number }>;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a receipt processing assistant. Analyze the receipt image and extract:
1. The total amount
2. Find items marked with these symbols: ${symbols.join(", ")}
3. Calculate the sum for each symbol
Return the results in JSON format with this structure:
{
  "total": number,
  "splits": [{ "symbol": string, "amount": number }]
}`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Process this receipt and extract the marked items."
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
