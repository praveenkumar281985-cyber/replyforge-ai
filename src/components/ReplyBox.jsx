import { useState } from "react";

function ReplyBox({ reply }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!reply) return;

    await navigator.clipboard.writeText(reply);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleDownload = () => {
    if (!reply) return;

    const blob = new Blob([reply], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "replyforge-reply.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reply-section">
      <textarea
        value={reply}
        placeholder="Your AI-generated reply will appear here..."
        readOnly
      />

      <div className="button-group">
        <button onClick={handleCopy}>
          📋 Copy Reply
        </button>

        <button onClick={handleDownload}>
          📄 Download TXT
        </button>
      </div>

      {copied && (
        <p className="toast">
          ✅ Reply copied successfully
        </p>
      )}
    </div>
  );
}

export default ReplyBox;