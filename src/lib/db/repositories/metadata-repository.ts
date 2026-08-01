import { getDatabase } from "@/lib/db/database";

export const metadataRepository = {
  async getLastBackupAt(): Promise<string | null> {
    const metadata = await getDatabase().metadata.get("local");
    return metadata?.lastBackupAt ?? null;
  },

  async setLastBackupAt(lastBackupAt: string): Promise<void> {
    await getDatabase().metadata.put({ id: "local", lastBackupAt });
  },
};
