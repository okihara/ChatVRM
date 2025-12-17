import { Message } from "@/features/messages/messages";
import { ChatLog } from "./chatLog";
import React, { useCallback, useState } from "react";
import { Settings } from "./settings";
import { AssistantText } from "./assistantText";
import { Choice } from "@/utils/choiceParser";
import { AIModel } from "@/features/chat/aiModel";

type Props = {
  aiModel: AIModel;
  systemPrompt: string;
  chatLog: Message[];
  assistantMessage: string;
  userMessage: string;
  isProcessing?: boolean;
  onChangeAiModel: (model: AIModel) => void;
  onChangeChatLog: (index: number, text: string) => void;
  handleClickResetChatLog: () => void;
  onChoiceSelect?: (choice: Choice) => void;
};
export const Menu = ({
  aiModel,
  systemPrompt,
  chatLog,
  assistantMessage,
  userMessage,
  isProcessing,
  onChangeAiModel,
  onChangeChatLog,
  handleClickResetChatLog,
  onChoiceSelect,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);

  const handleAiModelChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChangeAiModel(event.target.value as AIModel);
    },
    [onChangeAiModel]
  );

  return (
    <>
      <div className="mt-16 mx-16">
        <div className="grid grid-flow-col gap-[16px] items-start">
          <img
            src="/images/gage_heart.png"
            alt=""
            className="w-[48px] h-[48px]"
          />
          <button
            className="text-black hover:opacity-70 px-2 py-1-widest"
            onClick={() => setShowSettings(true)}
          >
            SETTINGS
          </button>
          <button
            className={`text-black px-2 py-1 ${
              chatLog.length <= 0 && !showChatLog
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-70"
            }`}
            disabled={chatLog.length <= 0 && !showChatLog}
            onClick={() => setShowChatLog(!showChatLog)}
          >
            TALK
          </button>
          <button
            className="text-black hover:opacity-70 px-2 py-1-widest"
          >
            MEMORY
          </button>
          <img
            src="/images/right_menu.png"
            alt=""
            className="w-[32px] h-[112px] -mr-4"
          />
        </div>
      </div>
      {showChatLog && <ChatLog messages={chatLog} onClose={() => setShowChatLog(false)} />}
      {showSettings && (
        <Settings
          aiModel={aiModel}
          chatLog={chatLog}
          systemPrompt={systemPrompt}
          onClickClose={() => setShowSettings(false)}
          onChangeAiModel={handleAiModelChange}
          onChangeChatLog={onChangeChatLog}
          onClickResetChatLog={handleClickResetChatLog}
        />
      )}
      {!showChatLog && (assistantMessage || userMessage) && (
        <AssistantText
          message={assistantMessage}
          userMessage={userMessage}
          onChoiceSelect={onChoiceSelect}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
};
