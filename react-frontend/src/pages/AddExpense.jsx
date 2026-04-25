import { useState } from "react";
import api from "../api/axiosInstance";
import "../styles/FormData.css"
import { toast } from "react-toastify";

function AddExpense(){

    const [formData, setFormdata]  = useState({
        amount: "",
        category: "",
        date: "",
        note: ""
    });

    const [isSubmit, setIsSubmit] = useState(false);
    const [isDisable, setIsDisable] = useState(false);

    const handleChange = (e) => {
        setFormdata({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const onMouseEnter = () => {
        setIsDisable(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true; // Assume form is valid for submission

        // Select all inputs
        const inputs = document.querySelectorAll(".form-field input, .form-field select");

        inputs.forEach(input => {
            const error = input.nextElementSibling; // the error-message span
            if (!error) return; // skip if no error span found
            if (input.hasAttribute("required") && !input.value.trim()) {
            error.style.display = "block"; // show error
            isValid = false;
            } else {
            error.style.display = "none";  // hide if filled
            }
        });

        inputs.forEach(input => {
            const error = input.nextElementSibling;
            if (!error) return;

            input.addEventListener("input", () => {
                if (input.value.trim() !== "") {
                    error.style.display = "none";
                }
            });
        });

        if (!isValid) return; // Don't call the api as mandatory fields are missing

        try{
            setIsSubmit(true);
            console.log("Submitting expense details...",formData);
            await api.post("/expenses/",formData);
            toast.success("Expense added successfully!")

            setFormdata({
                amount: "",
                category: "",
                date: "",
                note: "",
            });
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Failed to add expense");
        }
        finally{
            setIsSubmit(false);
        }
    };

    return(
        <div className="form-page">
                <h2> Add Expense</h2>
                <form onSubmit={handleSubmit} noValidate>
                    
                    <div className="form-row">
                        <div className="form-field">
                            <label>Amount <span className="required-star">*</span></label>
                            <input type="number" name="amount" placeholder="Amount"
                                value={formData.amount} onChange={handleChange} required/>
                            <span className="error-message">Amount is required</span>
                        </div>

                        <div className="form-field">
                            <label>Category  <span className="required-star">*</span></label>
                            <select name="category" value={formData.category} 
                                    onMouseEnter={onMouseEnter} onChange={handleChange} required >
                                        <option value="" disabled={isDisable}>-- Select Category --</option>
                                        <option value="Food">Food</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Bills">Bills</option>
                                        <option value="Health">Health</option>
                                        <option value="Education">Education</option>
                                        <option value="Entertainment">Entertainment</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Savings">Savings</option>
                                        <option value="Other">Other</option>
                            </select>
                            <span className="error-message">Category is required</span>
                            
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-field">
                            <label>Date  <span className="required-star">*</span></label>
                            <input type="date" name="date" placeholder="date"
                                value={formData.date} onChange={handleChange} required/>
                            <span className="error-message">Date is required</span>
                        </div>

                        <div className="form-field">
                        <label>Note</label>
                        <input type="text" name="note" placeholder="Note"
                            value={formData.note} onChange={handleChange} />
                        </div>
                    </div>
                
                    <button type="submit" disabled={isSubmit}>
                        {isSubmit? "Adding Expense..." : "Add Expense"}
                    </button>
                </form>
            </div>
    )
}

export default AddExpense;