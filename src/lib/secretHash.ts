const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/i;

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const digestSha256 = async (input: string): Promise<string> => {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
};

export const isSha256Hex = (value: string): boolean => SHA256_HEX_REGEX.test(value);

export const hashPassword = async (password: string): Promise<string> => {
  return digestSha256(password);
};

export const normalizeSecurityAnswer = (answer: string): string => {
  return answer.toLowerCase().trim();
};

export const hashSecurityAnswer = async (answer: string): Promise<string> => {
  return digestSha256(normalizeSecurityAnswer(answer));
};
