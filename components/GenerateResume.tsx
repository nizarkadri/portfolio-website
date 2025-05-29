import OpenAI from 'openai';
import PromptTemplate from './PromptTemplate';

const systemPromptContent = PromptTemplate();
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "<OPENROUTER_API_KEY>",
  defaultHeaders: {
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
  },
});
async function main() {
  const completion = await openai.chat.completions.create({
    model: "google/gemini-2.5-pro-preview",
    messages: [
      {
        "role": "system",
        "content": [
            {
                "type": "text",
                "text": `${systemPromptContent}`
            }
        ],
      },
      {
        "role": "user",
        "content": [
          
          {
            "type": "text",
            "text": `${jobDescriptionFromUser}`
          }
        ]
      }
    ],
    
  });

  console.log(completion.choices[0].message);
}

main();