import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ViewExpenses from "./ViewExpenses";
import api from "../api/axiosInstance";
import { vi } from "vitest";

vi.mock("../api/axiosInstance");

// mock child components
vi.mock("../components/common/Loader.jsx", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("../components/common/ErrorMessage.jsx", () => ({
  default: () => <div>Error</div>,
}));

describe("ViewExpenses", () => {

  test("fetches and displays expenses", async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          { id: 1, amount: 100, category: "Food", date: "2025-03-29", note: "Lunch" }
        ],
        count: 1,
      },
    });

    render(<ViewExpenses />);

    // wait for data to appear
    expect(await screen.findByRole("cell", {name:"Food"})).toBeInTheDocument();
  });

  test("calls delete API when delete is confirmed", async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          { id: 1, amount: 100, category: "Food", date: "2025-03-29", note: "Lunch" }
        ],
        count: 1,
      },
    });

    api.delete.mockResolvedValue({});

    render(<ViewExpenses />);

    // wait for row
    await screen.findByRole("cell", {name: "Food"});

    // click delete button
    fireEvent.click(screen.getByText(/delete/i));

    // confirm delete
    fireEvent.click(screen.getByText(/yes, delete/i));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/expenses/1/");
    });
  });

});