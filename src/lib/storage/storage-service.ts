export type StoragePersistence =
  "persistent" | "best-effort" | "unsupported" | "error";

export type StorageHealth = {
  persistence: StoragePersistence;
  usageBytes?: number | undefined;
  quotaBytes?: number | undefined;
  error?: string | undefined;
};

export const INITIAL_STORAGE_HEALTH: StorageHealth = {
  persistence: "best-effort",
};

function storageManager(): StorageManager | null {
  if (typeof navigator === "undefined" || navigator.storage === undefined) {
    return null;
  }
  return navigator.storage;
}

async function estimateStorage(
  manager: StorageManager,
): Promise<Pick<StorageHealth, "usageBytes" | "quotaBytes">> {
  if (manager.estimate === undefined) {
    return {};
  }

  const estimate = await manager.estimate();
  return {
    usageBytes: estimate.usage,
    quotaBytes: estimate.quota,
  };
}

export async function inspectStorageHealth(): Promise<StorageHealth> {
  const manager = storageManager();
  if (manager === null || manager.persisted === undefined) {
    return { persistence: "unsupported" };
  }

  try {
    const [persistent, estimate] = await Promise.all([
      manager.persisted(),
      estimateStorage(manager),
    ]);
    return {
      persistence: persistent ? "persistent" : "best-effort",
      ...estimate,
    };
  } catch (cause: unknown) {
    return {
      persistence: "error",
      error:
        cause instanceof Error
          ? cause.message
          : "No se pudo consultar el almacenamiento.",
    };
  }
}

export async function requestPersistentStorage(): Promise<StorageHealth> {
  const manager = storageManager();
  if (
    manager === null ||
    manager.persisted === undefined ||
    manager.persist === undefined
  ) {
    return { persistence: "unsupported" };
  }

  try {
    const alreadyPersistent = await manager.persisted();
    if (!alreadyPersistent) {
      await manager.persist();
    }
    return inspectStorageHealth();
  } catch (cause: unknown) {
    return {
      persistence: "error",
      error:
        cause instanceof Error
          ? cause.message
          : "No se pudo solicitar almacenamiento persistente.",
    };
  }
}

export function isStorageAlmostFull(health: StorageHealth): boolean {
  return (
    health.usageBytes !== undefined &&
    health.quotaBytes !== undefined &&
    health.quotaBytes > 0 &&
    health.usageBytes / health.quotaBytes >= 0.9
  );
}

export function friendlyStorageError(cause: unknown): Error {
  const name =
    typeof cause === "object" && cause !== null && "name" in cause
      ? String(cause.name)
      : "";
  if (name === "QuotaExceededError") {
    return new Error(
      "No hay espacio suficiente para guardar el cambio. Liberá espacio y creá un respaldo antes de continuar.",
    );
  }

  return cause instanceof Error
    ? cause
    : new Error("No se pudo acceder al almacenamiento del dispositivo.");
}
