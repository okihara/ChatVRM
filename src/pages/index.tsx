import { useCallback, useContext, useEffect, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { KoeiroParam, DEFAULT_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { fetchSystemPrompt } from "@/features/chat/fetchSystemPrompt";
import { getGeminiChatResponseStream } from "@/features/chat/geminiChat";
import { AIModel, DEFAULT_AI_MODEL } from "@/features/chat/aiModel";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { Meta } from "@/components/meta";
import { parseChoices, Choice } from "@/utils/choiceParser";

// 画面中央オーバーレイのローディングスピナー
const LoadingOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="bg-white/90 backdrop-blur-sm rounded-full px-40 py-20 shadow-lg flex items-center gap-16">
      <div className="flex gap-8">
        <div className="w-16 h-16 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-16 h-16 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-16 h-16 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-black/70 text-lg font-medium">考え中...</span>
    </div>
  </div>
);

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAiKey, setOpenAiKey] = useState(process.env.NEXT_PUBLIC_API_KEY || "");
  const [geminiKey, setGeminiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const [aiModel, setAiModel] = useState<AIModel>(DEFAULT_AI_MODEL);
  const [koeiromapKey, setKoeiromapKey] = useState("");
  const [koeiroParam, setKoeiroParam] = useState<KoeiroParam>(DEFAULT_PARAM);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [hasChoices, setHasChoices] = useState(false);

  // アプリ起動時にスプレッドシートからシステムプロンプトを取得
  useEffect(() => {
    fetchSystemPrompt().then((prompt) => {
      setSystemPrompt(prompt);
    });
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setKoeiroParam(params.koeiroParam ?? DEFAULT_PARAM);
      setChatLog(params.chatLog ?? []);
      setAiModel(params.aiModel ?? DEFAULT_AI_MODEL);
      // setAiModel(DEFAULT_AI_MODEL);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, koeiroParam, chatLog, aiModel })
      )
    );
  }, [systemPrompt, koeiroParam, chatLog, aiModel]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog]
  );

  /**
   * 文ごとに音声を直列でリクエストしながら再生する
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      speakCharacter(screenplay, viewer, koeiromapKey, onStart, onEnd);
    },
    [viewer, koeiromapKey]
  );

  /**
   * アシスタントとの会話を行う
   * 送信ボタンが押された時の処理
   */
  const handleSendChat = useCallback(
    async (text: string) => {
      const currentApiKey = aiModel === "chatgpt" ? openAiKey : geminiKey;
      if (!currentApiKey) {
        setAssistantMessage("APIキーが入力されていません");
        return;
      }

      const newMessage = text;

      if (newMessage == null) return;

      setChatProcessing(true);
      setHasChoices(false); // 処理開始時は選択肢を非表示
      // ユーザーの発言を追加して表示
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      // AIモデルへ
      const messages: Message[] = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messageLog,
      ];

      // 選択したモデルに応じてAPIを呼び出す
      const stream = await (aiModel === "chatgpt"
        ? getChatResponseStream(messages, openAiKey)
        : getGeminiChatResponseStream(messages, geminiKey)
      ).catch((e) => {
        console.error(e);
        return null;
      });
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // 返答内容のタグ部分の検出
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // 返答を一文単位で切り出して処理する
          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // 発話不要/不可能な文字列だった場合はスキップ
            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], koeiroParam);
            aiTextLog += aiText;

            // 文ごとに音声を生成 & 再生、返答を表示
            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], () => {
              // console.log("currentAssistantMessage: " + currentAssistantMessage);
              // setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      // 残りのメッセージがあれば追加
      if (receivedMessage.trim()) {
        aiTextLog += `${tag} ${receivedMessage}`;
      }

      console.log("aiTextLog: " + aiTextLog);
      // ストリーミング完了後に最終メッセージを設定（選択肢タグも含む完全な状態）
      setAssistantMessage(aiTextLog);

      // アシスタントの返答をログに追加
      const messageLogAssistant: Message[] = [
        ...messageLog, 
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);

      // 選択肢があるかチェック
      // const parsed = parseChoices(aiTextLog);
      // setHasChoices(parsed.hasChoices);

      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, openAiKey, geminiKey, aiModel, koeiroParam]
  );

  /**
   * 選択肢がクリックされたときの処理
   */
  const handleChoiceSelect = useCallback(
    (choice: Choice) => {
      // 選択肢の番号を送信
      handleSendChat(choice.number);
    },
    [handleSendChat]
  );

  return (
    <div className={"font-M_PLUS_2"}>
      <Meta />
      {/* ローディングオーバーレイ */}
      {chatProcessing && <LoadingOverlay />}
      {/* デバッグ用: システムプロンプトのハッシュ表示 */}
      <div className="fixed bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-50">
        #{Array.from(systemPrompt).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0).toString(16).slice(-8)}
      </div>
      <Introduction
        openAiKey={openAiKey}
        geminiKey={geminiKey}
        koeiroMapKey={koeiromapKey}
        aiModel={aiModel}
        onChangeAiKey={setOpenAiKey}
        onChangeGeminiKey={setGeminiKey}
        onChangeKoeiromapKey={setKoeiromapKey}
        onChangeAiModel={setAiModel}
      />
      <VrmViewer />
      {/* 選択肢がある場合はテキスト入力を非表示 */}
      {!hasChoices && (
        <MessageInputContainer
          isChatProcessing={chatProcessing}
          onChatProcessStart={handleSendChat}
        />
      )}
      <Menu
        aiModel={aiModel}
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        assistantMessage={assistantMessage}
        isProcessing={chatProcessing}
        onChangeAiModel={setAiModel}
        onChangeChatLog={handleChangeChatLog}
        handleClickResetChatLog={() => setChatLog([])}
        onChoiceSelect={handleChoiceSelect}
      />
    </div>
  );
}
