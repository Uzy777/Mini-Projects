import { useState } from "react";

export function useChangeName(playerName, setName) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  const handleSave = () => {
    if (tempName.trim()) {
      setName(tempName);
    }
    setTempName("");
    setIsEditing(false);
  };

  return {
    isEditing,
    tempName,
    setTempName,
    setIsEditing,
    handleSave,
    playerName,
  };
}
