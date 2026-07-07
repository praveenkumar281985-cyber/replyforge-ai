function ReplyBox({ reply }) {
  return (
    <textarea
      value={reply}
      placeholder="Your AI-generated reply will appear here..."
      readOnly
    />
  );
}

export default ReplyBox;