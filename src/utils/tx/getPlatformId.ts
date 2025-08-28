import { Connection, PublicKey } from "@solana/web3.js";

const TARGET_PROGRAM_ID = new PublicKey("LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj");
const KNOWN_PLATFORM_IDS = [
  new PublicKey("8pCtbn9iatQ8493mDQax4xfEUjhoVBpUWYVQoRU18333"),
  new PublicKey("FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1"),
  new PublicKey("FEkF8SrSckk5GkfbmtcCbuuifpTKkw6mrSNowwB8aQe3")
];

export const getPlatformId = async (connection: Connection, mint: PublicKey): Promise<PublicKey | undefined> => {
  const signatures = await connection.getSignaturesForAddress(mint, { limit: 1, before: undefined });
  if (signatures.length === 0) return undefined;

  const creationSig = signatures[signatures.length - 1].signature;
  console.log("Token creation tx:", creationSig);

  const tx = await connection.getTransaction(creationSig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0
  } as any);
  if (!tx) return undefined;

  const message: any = tx.transaction.message;
  console.log("message", message)
  // Collect all account keys (static + address lookup tables)
  const staticKeys: PublicKey[] = (message.staticAccountKeys || message.accountKeys || []).map((k: any) => new PublicKey(k));
  const writableLookups: PublicKey[] = tx.meta?.loadedAddresses?.writable?.map((k) => new PublicKey(k)) || [];
  const readonlyLookups: PublicKey[] = tx.meta?.loadedAddresses?.readonly?.map((k) => new PublicKey(k)) || [];
  const allKeys: PublicKey[] = [...staticKeys, ...writableLookups, ...readonlyLookups];

  const compiledIxs = message.compiledInstructions || message.instructions || [];
  console.log("comple length", compiledIxs.length)
  for (const ix of compiledIxs) {
    const programId = allKeys[ix.programIdIndex];
    if (programId && programId.equals(TARGET_PROGRAM_ID)) {
      const accountPubkeys: PublicKey[] = (ix.accountKeyIndexes || ix.accounts || []).map((idx: number) => allKeys[idx]);
      console.log("Found target program instruction. Accounts:", accountPubkeys.map((k) => k.toBase58()));

      // Try to detect platformId among known list
      const found = accountPubkeys.find((k) => KNOWN_PLATFORM_IDS.some((p) => p.equals(k)));
      if (found) {
        console.log("Detected platformId:", found.toBase58());
        return found;
      }
      return undefined;
    }
  }

  return undefined;
};