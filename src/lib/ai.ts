const AI_KEY_STORAGE = "contapp:openaiKey";
const AI_MODE_STORAGE = "contapp:aiUseOwnKey";

export const getStoredAiKey = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AI_KEY_STORAGE) || "";
};

export const setStoredAiKey = (value: string) => {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(AI_KEY_STORAGE, value);
  } else {
    window.localStorage.removeItem(AI_KEY_STORAGE);
  }
};

export const getStoredAiMode = () => {
  if (typeof window === "undefined") return true;
  const value = window.localStorage.getItem(AI_MODE_STORAGE);
  if (value == null) return true;
  return value === "true";
};

export const setStoredAiMode = (value: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AI_MODE_STORAGE, value ? "true" : "false");
};
