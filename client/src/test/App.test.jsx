import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import {
  authApi,
  goalsApi,
  roomsApi,
  sessionsApi,
  checkinsApi,
  analyticsApi,
  setToken,
} from "../services/api";

vi.mock("../services/api", () => {
  let token = null;
  return {
    getToken: () => token,
    setToken: (t) => {
      token = t;
    },
    setOnUnauthorized: vi.fn(),
    authApi: {
      login: vi.fn(),
      register: vi.fn(),
      me: vi.fn(),
    },
    goalsApi: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
    roomsApi: {
      list: vi.fn(),
      create: vi.fn(),
      join: vi.fn(),
      get: vi.fn(),
    },
    sessionsApi: {
      start: vi.fn(),
      end: vi.fn(),
      byRoom: vi.fn(),
    },
    checkinsApi: {
      join: vi.fn(),
      submit: vi.fn(),
      leave: vi.fn(),
      participants: vi.fn(),
    },
    analyticsApi: {
      me: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  setToken(null);
  window.scrollTo = vi.fn();
});

describe("FocusCircle Frontend", () => {
  it("renders landing page and navigates to login and register", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/Make your study/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Log in/i }));
    expect(screen.getByText(/Continue your work\./i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Create an account/i }));
    expect(screen.getByText(/Start with intention\./i)).toBeInTheDocument();
  });

  it("validates password mismatch on registration", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Get started/i }));

    await user.type(screen.getByPlaceholderText("Alex Morgan"), "Alex");
    await user.type(screen.getByPlaceholderText("alex@university.edu"), "alex@uni.edu");
    const pwdInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(pwdInputs[0], "secret123");
    await user.type(pwdInputs[1], "different");
    await user.click(screen.getByRole("button", { name: /Create account/i }));

    expect(screen.getByText(/Passwords do not match\./i)).toBeInTheDocument();
  });

  it("logs in, loads dashboard, and logs out", async () => {
    const user = userEvent.setup();
    authApi.login.mockResolvedValue({
      token: "jwt-123",
      user: { id: "u1", name: "Alex Morgan", email: "alex@uni.edu" },
    });
    analyticsApi.me.mockResolvedValue({
      summary: {
        totalGoals: 2,
        completedGoals: 1,
        totalSessions: 3,
        totalCheckIns: 2,
        totalStudyTimeMinutes: 90,
        totalStudyTimeHours: 1.5,
      },
      recentSessions: [],
    });
    goalsApi.list.mockResolvedValue([
      { _id: "g1", title: "Finish React tests", completed: false, targetDate: null },
    ]);

    render(<App />);
    await user.click(screen.getByRole("button", { name: /Log in/i }));
    await user.type(screen.getByPlaceholderText("alex@university.edu"), "alex@uni.edu");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Good afternoon, Alex\./i)).toBeInTheDocument();
    });
    expect(screen.getByText("Finish React tests")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Settings/i }));
    await user.click(screen.getByRole("button", { name: /Log out/i }));
    expect(screen.getByText(/Make your study/i)).toBeInTheDocument();
  });

  it("displays login error on failed login", async () => {
    const user = userEvent.setup();
    authApi.login.mockRejectedValue(new Error("Invalid email or password"));
    render(<App />);
    await user.click(screen.getByRole("button", { name: /Log in/i }));
    await user.type(screen.getByPlaceholderText("alex@university.edu"), "alex@uni.edu");
    await user.type(screen.getByPlaceholderText("••••••••"), "wrong");
    await user.click(screen.getByRole("button", { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it("manages goals: create, complete, and delete", async () => {
    const user = userEvent.setup();
    setToken("jwt-123");
    authApi.me.mockResolvedValue({ user: { id: "u1", name: "Alex", email: "a@b.com" } });
    analyticsApi.me.mockResolvedValue({
      summary: { totalGoals: 0, completedGoals: 0, totalSessions: 0, totalCheckIns: 0, totalStudyTimeMinutes: 0 },
      recentSessions: [],
    });
    goalsApi.list
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ _id: "g1", title: "New Study Goal", completed: false }])
      .mockResolvedValueOnce([{ _id: "g1", title: "New Study Goal", completed: true }])
      .mockResolvedValueOnce([]);
    goalsApi.create.mockResolvedValue({ _id: "g1", title: "New Study Goal", completed: false });
    goalsApi.update.mockResolvedValue({ _id: "g1", title: "New Study Goal", completed: true });
    goalsApi.remove.mockResolvedValue({ message: "Goal deleted" });

    render(<App />);
    await waitFor(() => expect(screen.getByText(/Good afternoon, Alex\./i)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /My goals/i }));
    await user.click(screen.getByRole("button", { name: /Create goal/i }));
    await user.type(screen.getByPlaceholderText(/Solve 5 dynamic programming/i), "New Study Goal");
    const createButtons = screen.getAllByRole("button", { name: /^Create goal$/i });
    await user.click(createButtons[createButtons.length - 1]);

    await waitFor(() => expect(screen.getByText("New Study Goal")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Mark completed/i }));
    await waitFor(() => expect(goalsApi.update).toHaveBeenCalledWith("g1", { completed: true }));

    await user.click(screen.getByRole("button", { name: /All goals/i }));
    await user.click(screen.getByRole("button", { name: /Delete goal/i }));
    await waitFor(() => expect(goalsApi.remove).toHaveBeenCalledWith("g1"));
  });

  it("runs study room -> focus timer -> check-in -> analytics flow", async () => {
    const user = userEvent.setup();
    setToken("jwt-123");
    authApi.me.mockResolvedValue({ user: { id: "u1", name: "Alex", email: "a@b.com" } });
    analyticsApi.me.mockResolvedValue({
      summary: { totalGoals: 1, completedGoals: 1, totalSessions: 1, totalCheckIns: 1, totalStudyTimeMinutes: 25, totalStudyTimeHours: 0.42 },
      recentSessions: [],
    });
    goalsApi.list.mockResolvedValue([]);
    roomsApi.list.mockResolvedValue([
      { _id: "r1", name: "Quiet Lab", code: "LAB123", owner: { name: "Alex" }, members: [{ _id: "u1" }] },
    ]);
    roomsApi.get.mockResolvedValue({
      _id: "r1",
      name: "Quiet Lab",
      code: "LAB123",
      owner: { name: "Alex" },
      members: [{ _id: "u1", name: "Alex", email: "a@b.com" }],
    });
    sessionsApi.byRoom.mockResolvedValue([]);
    sessionsApi.start.mockResolvedValue({ _id: "s1", room: { _id: "r1", name: "Quiet Lab", code: "LAB123" }, status: "active" });
    checkinsApi.join.mockResolvedValue({ _id: "p1" });
    sessionsApi.end.mockResolvedValue({ _id: "s1", room: { _id: "r1", name: "Quiet Lab", code: "LAB123" }, status: "completed", duration: 1500 });
    checkinsApi.submit.mockResolvedValue({ _id: "p1", checkIn: true });

    render(<App />);
    await waitFor(() => expect(screen.getByText(/Good afternoon, Alex\./i)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Study rooms/i }));
    await waitFor(() => expect(screen.getByText("Quiet Lab")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Enter room/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Start focus session/i })).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Start focus session/i }));
    await waitFor(() => expect(screen.getByText(/Session in progress/i)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Finish session/i }));
    await waitFor(() => expect(screen.getByText(/Close the loop\./i)).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText(/Summarize what you completed/i), "Finished 3 chapters");
    await user.click(screen.getByRole("button", { name: /Submit check-in/i }));

    await waitFor(() => expect(screen.getByText(/TOTAL FOCUS TIME/i)).toBeInTheDocument());
  });
});
