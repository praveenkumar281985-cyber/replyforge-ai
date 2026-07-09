function MessageInput({ message, setMessage }) {
  return (
    <>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste the message you received..."
      />

      <p
        style={{
          textAlign: "right",
          color: "#666",
          fontSize: "14px",
          marginTop: "5px",
        }}
      >
        {message.length} characters
      </p>
    </>
  );
}

export default MessageInput;