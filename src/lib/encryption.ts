import crypto from "crypto";

// Chave de criptografia - em produção, use uma variável de ambiente
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-cbc";

/**
 * Gera uma chave de criptografia a partir de uma string
 */
function getKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

/**
 * Criptografa um valor
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Retorna IV + texto criptografado (IV é necessário para descriptografar)
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("[Encryption] Erro ao criptografar:", error);
    throw new Error("Erro ao criptografar valor");
  }
}

/**
 * Descriptografa um valor
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      throw new Error("Formato de texto criptografado inválido");
    }
    
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("[Encryption] Erro ao descriptografar:", error);
    throw new Error("Erro ao descriptografar valor");
  }
}

/**
 * Verifica se uma string está criptografada (formato IV:encrypted)
 */
export function isEncrypted(text: string): boolean {
  return text.includes(":") && text.split(":")[0].length === 32;
}

