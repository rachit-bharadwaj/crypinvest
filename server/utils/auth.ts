import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

/**
 * Verifies a wallet signature against a message.
 * @param publicKey - Wallet's public key
 * @param signature - Signature from the wallet (base64 encoded)
 * @param message - Original message
 * @returns boolean - Whether the signature is valid
 */
const verifySignature = (
  publicKey: string,
  signature: string,
  message: string
): boolean => {
  try {
    // Decode the inputs
    const pubKeyBuffer = new PublicKey(publicKey).toBytes(); // Convert publicKey to Uint8Array
    const signatureBuffer = Uint8Array.from(Buffer.from(signature, "base64")); // Convert signature to Uint8Array
    const messageBuffer = new TextEncoder().encode(message); // Convert message to Uint8Array

    // Ensure the signature length is 64 bytes (standard for Solana)
    if (signatureBuffer.length !== 64) {
      console.error("Invalid signature length:", signatureBuffer.length);
      return false;
    }

    // Use tweetnacl to verify the signature
    return nacl.sign.detached.verify(
      messageBuffer,
      signatureBuffer,
      pubKeyBuffer
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

export { verifySignature };
