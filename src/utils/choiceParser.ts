export type Choice = {
  number: string;
  text: string;
};

export type ParsedMessage = {
  textBeforeChoices: string;
  choices: Choice[];
  hasChoices: boolean;
};

/**
 * アシスタントのメッセージから選択肢を解析する
 * フォーマット: [CHOICES]1|選択肢1||2|選択肢2[/CHOICES]
 */
export function parseChoices(message: string): ParsedMessage {
  const choicesMatch = message.match(/\[CHOICES\](.*?)\[\/CHOICES\]/s);

  if (!choicesMatch) {
    return {
      textBeforeChoices: message,
      choices: [],
      hasChoices: false,
    };
  }

  // [CHOICES]タグの前のテキストを取得
  const textBeforeChoices = message.split('[CHOICES]')[0].trim();

  // 選択肢を解析
  const choicesString = choicesMatch[1];
  const choiceItems = choicesString.split('||');

  const choices: Choice[] = choiceItems
    .map((item) => {
      const [number, ...textParts] = item.split('|');
      const text = textParts.join('|').trim(); // テキスト内に|がある場合も対応
      return {
        number: number.trim(),
        text: text,
      };
    })
    .filter((choice) => choice.number && choice.text);

  return {
    textBeforeChoices,
    choices,
    hasChoices: choices.length > 0,
  };
}

/**
 * メッセージから感情タグと選択肢タグを除去してクリーンなテキストを返す
 */
export function cleanMessage(message: string): string {
  return message
    .replace(/\[([a-zA-Z]*?)\]/g, '') // 感情タグを除去
    // .replace(/\[CHOICES\].*?\[\/CHOICES\]/s, '') // 選択肢タグを除去
    .trim();
}
