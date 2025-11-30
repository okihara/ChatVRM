import { useEffect, useRef } from "react";
import { Message } from "@/features/messages/messages";
type Props = {
  messages: Message[];
  onClose?: () => void;
};
export const ChatLog = ({ messages, onClose }: Props) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [messages]);
  return (
    <div className="absolute w-col-span-6 max-w-full h-[100svh] pb-64">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-16 right-16 z-10 bg-white rounded-full w-32 h-32 flex items-center justify-center shadow-md hover:opacity-70"
          aria-label="閉じる"
        >
          <span className="text-black text-xl leading-none">&times;</span>
        </button>
      )}
      <div className="max-h-full px-16 pt-104 pb-64 overflow-y-auto scroll-hidden">
        {messages.map((msg, i) => {
          return (
            <div key={i} ref={messages.length - 1 === i ? chatScrollRef : null}>
              <Chat role={msg.role} message={msg.content} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Chat = ({ role, message }: { role: string; message: string }) => {
  const roleColor =
    role === "assistant" ? "bg-secondary text-white " : "bg-base text-primary";
  const roleText = role === "assistant" ? "tex-primary" : "text-primary";
  const offsetX = role === "user" ? "pl-40" : "pr-40";

  return (
    <div className={`mx-auto max-w-sm my-16 ${offsetX}`}>
      <div className="px-24 py-16 bg-white rounded-b-8 rounded-t-8">
        <div className={`typography-16 font-bold ${roleText}`}>{message}</div>
      </div>
    </div>
  );
};
