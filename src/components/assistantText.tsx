import { useState, useEffect, useRef } from "react";
import { parseChoices, Choice } from "@/utils/choiceParser";

type Props = {
  message: string;
  userMessage?: string;
  onChoiceSelect?: (choice: Choice) => void;
  isProcessing?: boolean;
};

export const AssistantText = ({ message, userMessage, onChoiceSelect, isProcessing }: Props) => {
  const parsed = parseChoices(message);

  // 感情タグを除去したテキスト
  const cleanText = parsed.textBeforeChoices.replace(/\[([a-zA-Z]*?)\]/g, "");

  // 文字送り用のstate
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const previousMessageRef = useRef<string>("");

  // ユーザーメッセージのアニメーション用state
  const [userMessageAnimating, setUserMessageAnimating] = useState(false);
  const [displayedUserMessage, setDisplayedUserMessage] = useState<string>("");
  const previousProcessingRef = useRef<boolean>(false);

  // isProcessingがfalse→trueに変わったとき（新しいメッセージ送信時）にアニメーションをトリガー
  useEffect(() => {
    if (isProcessing && !previousProcessingRef.current && userMessage) {
      // まず消すアニメーション
      setUserMessageAnimating(false);
      // 少し待ってから新しいメッセージを設定してアニメーション開始
      const timer = setTimeout(() => {
        setDisplayedUserMessage(userMessage);
        requestAnimationFrame(() => {
          setUserMessageAnimating(true);
        });
      }, 150); // 消えるアニメーション分待つ
      previousProcessingRef.current = !!isProcessing;
      return () => clearTimeout(timer);
    }
    previousProcessingRef.current = !!isProcessing;
  }, [isProcessing, userMessage]);

  // 文字送りエフェクト
  useEffect(() => {
    // メッセージが変わったらリセット
    if (cleanText !== previousMessageRef.current) {
      previousMessageRef.current = cleanText;
      setDisplayedText("");
      setIsTypingComplete(false);
    }

    if (!cleanText) {
      setIsTypingComplete(true);
      return;
    }

    if (displayedText.length < cleanText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(cleanText.slice(0, displayedText.length + 1));
      }, 50); // 50msごとに1文字追加
      return () => clearTimeout(timer);
    } else {
      setIsTypingComplete(true);
    }
  }, [cleanText, displayedText]);

  return (
    <div className="absolute bottom-0 left-0 mb-104 w-full">
      <div className="mx-auto max-w-4xl w-full p-16">
        {/* キャラクターメッセージ部分 */}
        {cleanText && (
          <div className="bg-white rounded-8 mb-8" style={{ boxShadow: '0px 0px 8px 4px #FFFFFF', opacity: 0.9 }}>
            <div className="px-24 py-16">
              <div className="line-clamp-10 text-black typography-16 whitespace-pre-wrap">
                {displayedText}
              </div>
            </div>
          </div>
        )}
        {/* 選択肢ボタン部分 - 文字送り完了後に表示 */}
        {parsed.hasChoices && !isProcessing && isTypingComplete && (
          <div className="flex flex-col gap-12 mb-8">
            {parsed.choices.map((choice) => (
              <button
                key={choice.number}
                onClick={() => onChoiceSelect?.(choice)}
                className="w-full px-24 py-16 text-white rounded-8 text-left transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:brightness-110"
                style={{
                  background: 'linear-gradient(to right, #1e40af, #7e22ce)',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
                  opacity: 0.8,
                }}
              >
                <span className="font-bold mr-8">{choice.number}.</span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* ユーザーメッセージ部分 */}
        {displayedUserMessage && (
          <div
            className="rounded-8 mb-8 ml-auto max-w-[80%] transition-all duration-300 ease-out"
            style={{
              backgroundColor: '#dbeafe',
              boxShadow: '0px 0px 12px 8px rgba(59, 130, 246, 0.3)',
              opacity: userMessageAnimating ? 0.9 : 0,
              transform: userMessageAnimating ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            <div className="px-24 py-12">
              <div className="typography-16 whitespace-pre-wrap text-right" style={{ color: '#1e3a5f' }}>
                {displayedUserMessage}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
