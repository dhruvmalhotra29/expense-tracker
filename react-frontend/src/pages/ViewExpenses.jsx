import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { toast } from "react-toastify";
import Loader from "../components/common/Loader.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";
import { useUI } from "../context/uiContext.jsx";
import "../styles/ViewExpenses.css";

function ViewExpenses()
{
    const [expenses, setExpenses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const { setModalOpen } = useUI();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    //filters
    const [category, setCategory] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");

    const [debouncedSearch, setdebouncedSearch] = useState(search);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setdebouncedSearch(search);
        }, 500); // 500ms delay
        return () => clearTimeout(handler);
    }, [search])
   
    useEffect(() => {
        const fetchExpenses = async () => {
            try{
                const params = {
                    page: currentPage,
                    ...(category && {category}),
                    ...(startDate && {start_date: startDate}),
                    ...(endDate && {end_date: endDate}),
                    ...(search && { search }),
                    ...(debouncedSearch && { search: debouncedSearch }),
                };
            const res = await api.get("/expenses/",{params});
                console.log(res.data)
                setExpenses(res.data.results);
                setTotalPages(Math.max(1,Math.ceil(res.data.count / 15))); // same as PAGE_SIZE
            }
            catch (err) {
                toast.error("Failed to fetch expenses");
                setError(true);
            }
            finally{
              setLoading(false);
            }
        };
        fetchExpenses();
    },[currentPage, category, startDate, endDate, search, debouncedSearch]);

    const downloadCSV = async () => {

        try{
            const res = await api.get("/expenses/download_csv/",{
                responseType: "blob" // important to treat response as a file
            });

        
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = "expenses.csv";
        a.click();
        window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Failed to download csv")
        }
    };

    const handleEditClick = (expense) => {
        setCurrentExpense(expense);
        setIsModalOpen(true);
        setModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try{
            const res = await api.put(`/expenses/${currentExpense.id}/`,
                                    {amount: currentExpense.amount,
                                    category: currentExpense.category,
                                    note: currentExpense.note,});
            setExpenses(prev => prev.map(exp => exp.id === res.data.id? res.data : exp));
            setIsModalOpen(false);
            setModalOpen(false);
            setCurrentExpense(null);
            toast.success("Expense updated successfully");
        } catch (err) {
            toast.error("Failed to update expense");
        }
    };

    const handleDelete = async (id) => {
        try{
            await api.delete(`/expenses/${id}/`);
                setExpenses(prev => prev.filter(exp => exp.id !== id));
                toast.success("Expense deleted successfully");
            } catch (err) {
                toast.error("Failed to delete expense");
            }
        };

   if (loading) {
        return (
            <div className="expenses-page">
                <div className="expenses-header">
                    <h2>Expenses</h2>                    
                </div>
                <Loader message="Loading expenses" />
            </div>
            );
    }

    if (error) {
        return (
            <div className="expenses-page">
                <div className="expenses-header">
                    <h2>Expenses</h2>
                </div>
                <ErrorMessage message="Failed to load expenses." />
            </div>
            );
    }
    
    return (
        <div className="expenses-page">
            <div className="expenses-header">
                <h2>Expenses</h2>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <label>Search</label>
                    <input type="text" placeholder="Search note..." 
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div className="filter-group">
                    <label>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
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
                </div>

                <div className="filter-group">
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}/>
                </div>

                <div className="filter-group">
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}/>
                </div>
                <button onClick={downloadCSV} className="download-btn">
                  ⬇ Download
                </button>
          
            </div>
            {expenses.length === 0 ? (
                    <p>No expenses found</p>
            ) : (
                <div className="table-wrapper">
                    <table className="expenses-table">
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense.id}>
                                    <td>{expense.amount}</td>
                                    <td>{expense.category}</td>
                                    <td>{expense.date}</td>
                                    <td>{expense.note}</td>
                                    <td>
                                        <button className="edit-btn" onClick={() => handleEditClick(expense)}>Edit</button>
                                        <button className="delete-btn" onClick={() => {setDeleteId(expense.id); setModalOpen(true);}}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage == 1}>Previous</button>
                
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={()=>setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}>Next</button>
            </div>
            { isModalOpen && (
                    <div className="modal-backdrop">
                        <div className="modal">
                            <button className="modal-close" onClick={() => {setIsModalOpen(false); setModalOpen(false);}}>x</button>
                            <h3>Edit Expense</h3>

                            <div className="form-group">
                                <label>Amount:</label>
                                <input type="number" value={currentExpense?.amount || ""}
                                onChange={e => setCurrentExpense(prev => ({...prev, amount:e.target.value}))}></input>
                            </div>

                            <div className="form-group">
                                <label className="label">Category:</label>
                                <select value={currentExpense?.category || ""} 
                                    onChange={e => setCurrentExpense(prev => ({...prev, category:e.target.value}))}>
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
                            </div>

                            <div className="form-group">
                                <label>Note:</label>
                                <input value={currentExpense?.note || ""}
                                onChange={e => setCurrentExpense(prev => ({...prev, note:e.target.value}))}></input>
                            </div>
                            
                            <div className="modal-buttons">
                                <button onClick={handleSaveEdit}>Save</button>
                                <button onClick={() => {setIsModalOpen(false); setModalOpen(false);}}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                {deleteId && (
                    <div className="modal-backdrop">
                        <div className="modal">
                            <button className="modal-close" onClick={() => {setDeleteId(null); setModalOpen(false);}}>x</button>
                            <h3>Confirm Delete</h3>
                            <p>This action cannot be undone. Are you sure?</p>

                            <div className="modal-buttons">
                                <button className="delete-btn" 
                                onClick={() => {
                                    handleDelete(deleteId);
                                    setDeleteId(null);
                                    setModalOpen(false);
                                    }}>Yes, Delete
                                </button>

                                <button onClick={() => {setDeleteId(null); setModalOpen(false);}}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
        </div>)
};

export default ViewExpenses;