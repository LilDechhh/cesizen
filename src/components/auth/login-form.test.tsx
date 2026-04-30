import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { supabase } from "@/config/supabaseClient";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/config/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ error: null, data: {} } as never);
    vi.mocked(supabase.auth.signUp).mockResolvedValue({ error: null, data: {} } as never);
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ error: null, data: {} } as never);
  });

  it("affiche les erreurs Zod quand les champs sont vides", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByText("L'adresse e-mail est requise.")).toBeInTheDocument();
    expect(await screen.findByText("Le mot de passe est requis.")).toBeInTheDocument();
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("bascule vers inscription et appelle signUp", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Créer un compte" }));
    expect(screen.getByText("Rejoignez CesiZen")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Adresse e-mail"), "new@user.com");
    await user.type(screen.getByLabelText("Mot de passe"), "123456");
    await user.click(screen.getByRole("button", { name: "S'inscrire" }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "new@user.com",
        password: "123456",
      });
      expect(navigateMock).toHaveBeenCalledWith("/profil");
    });
  });

  it("appelle signInWithPassword en mode connexion", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Adresse e-mail"), "john@doe.com");
    await user.type(screen.getByLabelText("Mot de passe"), "abcdef");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "john@doe.com",
        password: "abcdef",
      });
      expect(navigateMock).toHaveBeenCalledWith("/profil");
    });
  });
});
