import React from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import { AIModel, AI_MODELS } from "@/features/chat/aiModel";

type Props = {
  aiModel: AIModel;
  systemPrompt: string;
  chatLog: Message[];
  onClickClose: () => void;
  onChangeAiModel: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onClickResetChatLog: () => void;
};
export const Settings = ({
  aiModel,
  chatLog,
  systemPrompt,
  onClickClose,
  onChangeAiModel,
  onChangeChatLog,
  onClickResetChatLog,
}: Props) => {
  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="text-text1 max-w-3xl mx-auto px-24 py-64 ">
          <div className="my-24 typography-32 font-bold">設定</div>
          <div className="my-24">
            <div className="my-16 typography-20 font-bold">AIモデル選択</div>
            <select
              value={aiModel}
              onChange={onChangeAiModel}
              className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
            >
              {AI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div className="my-40">
            <div className="my-16 typography-20 font-bold">
              キャラクター設定（システムプロンプト）
            </div>
            <div className="px-16 py-8 bg-surface1 rounded-8">
              バージョン: #{Array.from(systemPrompt).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0).toString(16).slice(-8)}
            </div>
          </div>
          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-8 grid-cols-2">
                <div className="my-16 typography-20 font-bold">会話履歴</div>
                <TextButton onClick={onClickResetChatLog}>
                  会話履歴リセット
                </TextButton>
              </div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed"
                    >
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
                      </div>
                      <input
                        key={index}
                        className="bg-surface1 hover:bg-surface1-hover rounded-8 w-full px-16 py-8"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}
                      ></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
