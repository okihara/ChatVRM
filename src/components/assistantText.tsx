import { parseChoices, Choice } from "@/utils/choiceParser";

type Props = {
  message: string;
  onChoiceSelect?: (choice: Choice) => void;
  isProcessing?: boolean;
};

export const AssistantText = ({ message, onChoiceSelect, isProcessing }: Props) => {
  const parsed = parseChoices(message);

  // 感情タグを除去したテキスト
  const cleanText = parsed.textBeforeChoices.replace(/\[([a-zA-Z]*?)\]/g, "");

  return (
    <div className="absolute bottom-0 left-0 mb-104 w-full">
      <div className="mx-auto max-w-4xl w-full p-16">
        {/* メッセージテキスト部分 */}
        {cleanText && (
          <div className="bg-white rounded-8 mb-8" style={{ boxShadow: '0px 0px 24px 19px #FFFFFF', opacity: 0.9 }}>
            <div className="px-24 py-16">
              <div className="line-clamp-10 text-black typography-16 whitespace-pre-wrap">
                {cleanText}
              </div>
            </div>
          </div>
        )}

        {/* 選択肢ボタン部分 */}
        {parsed.hasChoices && !isProcessing && (
          <div className="flex flex-col gap-8 mt-8">
            {parsed.choices.map((choice) => (
              <button
                key={choice.number}
                onClick={() => onChoiceSelect?.(choice)}
                className="w-full px-24 py-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-8 text-left transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                style={{
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span className="font-bold mr-8">{choice.number}.</span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
