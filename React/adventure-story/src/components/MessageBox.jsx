import React from "react";

const MessageBox = ({ message }) => {
  return (
    <div className="w-full max-w-3xl bg-zinc-900 p-4 rounded-lg shadow text-lg leading-relaxed">
      {/* <p>&gt; You are searching for something...</p>
      <p>&gt; You find something...</p>
      <p>&gt; 2 coins.</p> */}
      <p>{message}</p>
    </div>
  );
};

export default MessageBox;
