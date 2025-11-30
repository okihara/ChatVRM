export const AssistantText = ({ message }: { message: string }) => {
  return (
    <div className="absolute bottom-0 left-0 mb-104  w-full">
      <div className="mx-auto max-w-4xl w-full p-16">
        <div className="bg-white rounded-8" style={{ boxShadow: '0px 0px 24px 19px #FFFFFF', opacity: 0.9 }}>
          <div className="px-24 py-16">
            <div className="line-clamp-10 text-black typography-16 font-bold whitespace-pre-wrap">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
