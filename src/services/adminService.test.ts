import { beforeEach, describe, expect, it, vi } from "vitest";

import { adminService } from "@/services/adminService";
import { supabase } from "@/config/supabaseClient";

vi.mock("@/config/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe("adminService.getUserStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne les sessions et le total", async () => {
    const sessions = [
      {
        id: 1,
        utilisateur_id: 10,
        mode_respiratoire_id: 1,
        date_debut: "2026-04-26T10:00:00.000Z",
        duree_totale: 300,
        mode_respiratoire: { libelle: "Cohérence cardiaque" },
      },
    ];

    const orderMock = vi.fn().mockResolvedValue({
      data: sessions,
      count: 1,
      error: null,
    });
    const eqMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as never);

    const result = await adminService.getUserStats(10);

    expect(supabase.from).toHaveBeenCalledWith("seance");
    expect(selectMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("utilisateur_id", 10);
    expect(orderMock).toHaveBeenCalledWith("date_debut", { ascending: false });
    expect(result).toEqual({
      sessions,
      total: 1,
    });
  });

  it("lève une erreur Supabase", async () => {
    const orderMock = vi.fn().mockResolvedValue({
      data: null,
      count: null,
      error: new Error("DB error"),
    });
    const eqMock = vi.fn().mockReturnValue({ order: orderMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

    vi.mocked(supabase.from).mockReturnValue({
      select: selectMock,
    } as never);

    await expect(adminService.getUserStats(10)).rejects.toThrow("DB error");
  });
});
