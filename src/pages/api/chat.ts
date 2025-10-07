import { OpenAI } from "openai";

import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const apiKey = req.body.apiKey || process.env.OPEN_AI_KEY;

  if (!apiKey) {
    res
      .status(400)
      .json({ message: "APIキーが間違っているか、設定されていません。" });

    return;
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: req.body.messages,
    max_tokens: 100,
    temperature: 0.7,
  });

  const message = completion.choices[0]?.message?.content || "エラーが発生しました";

  res.status(200).json({ message: message });
}
