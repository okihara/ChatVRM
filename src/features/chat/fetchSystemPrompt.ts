import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";

/**
 * Google スプレッドシート（CSV公開）からシステムプロンプトを取得する
 * A1セルの内容を返す
 * 取得に失敗した場合はデフォルトのシステムプロンプトを返す
 */
export async function fetchSystemPrompt(): Promise<string> {
  const csvUrl = process.env.NEXT_PUBLIC_SYSTEM_PROMPT_CSV_URL;

  if (!csvUrl) {
    console.log("NEXT_PUBLIC_SYSTEM_PROMPT_CSV_URL is not set, using default prompt");
    return SYSTEM_PROMPT;
  }

  try {
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();

    // CSVの最初のセル（A1）を取得
    // ダブルクォートで囲まれている場合を考慮
    const prompt = parseCSVFirstCell(csvText);

    if (!prompt) {
      console.warn("Empty prompt from spreadsheet, using default");
      return SYSTEM_PROMPT;
    }

    console.log("System prompt loaded from spreadsheet");
    return prompt;
  } catch (error) {
    console.error("Failed to fetch system prompt from spreadsheet:", error);
    return SYSTEM_PROMPT;
  }
}

/**
 * CSVテキストから最初のセル（A1）の値を取得
 */
function parseCSVFirstCell(csvText: string): string {
  const trimmed = csvText.trim();

  if (!trimmed) {
    return "";
  }

  // ダブルクォートで始まる場合（セル内に改行やカンマがある場合）
  if (trimmed.startsWith('"')) {
    // 終端のダブルクォートを探す（エスケープされた""は除外）
    let endIndex = 1;
    while (endIndex < trimmed.length) {
      if (trimmed[endIndex] === '"') {
        // 次の文字も"ならエスケープなのでスキップ
        if (endIndex + 1 < trimmed.length && trimmed[endIndex + 1] === '"') {
          endIndex += 2;
          continue;
        }
        // 終端のクォート発見
        break;
      }
      endIndex++;
    }

    // クォート内の文字列を取得し、エスケープを解除
    const content = trimmed.slice(1, endIndex);
    return content.replace(/""/g, '"');
  }

  // クォートなしの場合：最初のカンマまたは改行まで
  const commaIndex = trimmed.indexOf(',');
  const newlineIndex = trimmed.indexOf('\n');

  if (commaIndex === -1 && newlineIndex === -1) {
    return trimmed;
  }

  if (commaIndex === -1) {
    return trimmed.slice(0, newlineIndex);
  }

  if (newlineIndex === -1) {
    return trimmed.slice(0, commaIndex);
  }

  return trimmed.slice(0, Math.min(commaIndex, newlineIndex));
}
