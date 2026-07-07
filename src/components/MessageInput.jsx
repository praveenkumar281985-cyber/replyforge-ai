function MessageInput({ message, setMessage }) {
  return (
    <textarea
      placeholder="Paste the message you received..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
    />
  );
}

export default MessageInput;