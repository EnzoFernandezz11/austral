import { afterEach, describe, expect, it, vi } from "vitest";
import {
  friendlyStorageError,
  inspectStorageHealth,
  isStorageAlmostFull,
  requestPersistentStorage,
} from "@/lib/storage/storage-service";

function stubStorage(storage?: Partial<StorageManager>) {
  vi.stubGlobal("navigator", storage === undefined ? {} : { storage });
}

describe("protección del almacenamiento local", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("informa cuando la API no está disponible", async () => {
    stubStorage();
    await expect(inspectStorageHealth()).resolves.toEqual({
      persistence: "unsupported",
    });
  });

  it("consulta persistencia y cuota en paralelo", async () => {
    stubStorage({
      persisted: vi.fn().mockResolvedValue(true),
      estimate: vi.fn().mockResolvedValue({ usage: 25, quota: 100 }),
    });

    await expect(inspectStorageHealth()).resolves.toEqual({
      persistence: "persistent",
      usageBytes: 25,
      quotaBytes: 100,
    });
  });

  it("solicita persistencia y refleja si el navegador la rechaza", async () => {
    const persisted = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);
    const persist = vi.fn().mockResolvedValue(false);
    stubStorage({ persisted, persist });

    await expect(requestPersistentStorage()).resolves.toMatchObject({
      persistence: "best-effort",
    });
    expect(persist).toHaveBeenCalledOnce();
  });

  it("detecta ocupación igual o superior al noventa por ciento", () => {
    expect(
      isStorageAlmostFull({
        persistence: "best-effort",
        usageBytes: 90,
        quotaBytes: 100,
      }),
    ).toBe(true);
  });

  it("traduce errores de cuota sin ocultar otros errores", () => {
    expect(
      friendlyStorageError({ name: "QuotaExceededError" }).message,
    ).toMatch(/espacio suficiente/);
    const original = new Error("fallo original");
    expect(friendlyStorageError(original)).toBe(original);
  });
});
