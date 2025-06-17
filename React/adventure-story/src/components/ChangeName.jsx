import React from "react";

export default function ChangeName({ isEditing, tempName, setTempName, setIsEditing, handleSave, playerName }) {
  return (
    <>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={tempName}
            placeholder="Enter new name"
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)}>Change Name ({playerName})</button>
      )}
    </>
  );
}
