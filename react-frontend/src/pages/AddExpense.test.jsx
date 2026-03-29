import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddExpense from "./AddExpense";
import api from "../api/axiosInstance";
import { test, describe, vi } from "vitest";

// mock API
vi.mock("../api/axiosInstance")

describe("AddExpense", () => {
    // Test 1: component renders
    test("renders Add Expense form", () => {
        render(<AddExpense />);
        expect(
            screen.getByRole("heading", { name: /add expense/i })
        ).toBeInTheDocument();
    });

    // Test 2: form submission calls API
    test("submit form and calls API", async () => {
        api.post.mockResolvedValue({}); // fake success response

        render(<AddExpense/>);

        // fill form
        fireEvent.change(screen.getByPlaceholderText(/amount/i),{
            target : {value:"100"},
        });

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Food"},    
        });

        fireEvent.change(screen.getByPlaceholderText(/date/i), {
            target: { value: "2025-03-29" }, 
        });

        //click submit 
        fireEvent.click(screen.getByRole("button",{name: /add expense/i}));

        // check API called
        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });
  });;
});