import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Navbar } from "./navbar";

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    session: null,
    profile: null,
  }),
}));

describe("Navbar snapshot", () => {
  it("reste stable visuellement", () => {
    const { container } = render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
