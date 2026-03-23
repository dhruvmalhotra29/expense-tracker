import {useState, useRef} from "react";
import api from "../api/axiosInstance";
import { toast } from "react-toastify";
import "../styles/BulkExpense.css"

function BulkExpenseUpload(){
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading,setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = function (event) {
        const text = event.target.result;
        const lines = text.split("\n").filter(Boolean);

        // ✅ header validation
        const expected = ["amount","category","date","note"];
        const header = lines[0].split(",").map(x => x.trim());

        if (JSON.stringify(header) !== JSON.stringify(expected)) {
            toast.error("Invalid CSV format. Please use the template.");
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const data = lines.slice(1).map((line) => {
        const [amount, category, date, note] = line.split(",").map(x => x.trim());
        return { amount, category, date, note };
      });
      setPreview(data);
    };
    reader.readAsText(selectedFile);
    };

    const downloadTemplate = () => {
         const csvContent = "amount,category,date,note\n100,Food,2026-03-10,Lunch\n250,Transport,2026-03-11,Metro";
         
         const blob  = new Blob([csvContent], { type: "text/csv" });
         const url = window.URL.createObjectURL(blob);

         const a = document.createElement("a");
         a.href = url;
         a.download = "expense_template.csv"
         a.click();

         window.URL.revokeObjectURL(url);
    };

    // send data to backend
    const handleUpload = async () => {

        if(!preview.length) return toast.error("No data to upload");
        setLoading(true);

        try{
            console.log(preview)
            const res = await api.post("/expenses/bulk/", preview)
            toast.success(
                `Success: ${res.data.success.length}, Failed: ${res.data.failed.length}`
            );
            console.log("Response:",res.data);
            setFile(null);
            setPreview([]);
            if(fileInputRef.current){
                fileInputRef.current.value = "";
            }
        }catch (err) {
            toast.error("Failed to upload bulk expenses");
        } finally {
            setLoading(false);
        }
    };

    return (
            <div className="bulk-card">
                <h3>Bulk Expense Upload</h3>
                <div className="upload-row">
                    <input type="file" accept=".csv" onChange={handleChange} ref={fileInputRef} />
                    <button className="upload-btn" onClick={handleUpload} disabled={loading} >
                        {loading ? "Uploading...": "⬆ Upload"}
                    </button>

                    <button className="template-btn" onClick={downloadTemplate}>
                       ⬇ Download template
                    </button>
                </div>

                <p className="template-hint">
                    Download the template and upload the csv in the same format.
                </p>

                    {preview.length > 0 && (
                    <div className="bulk-preview">
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row,idx) => (
                                    <tr key={idx}>
                                        <td>{row.amount}</td>
                                        <td>{row.category}</td>
                                        <td>{row.date}</td>
                                        <td>{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
        </div>

    );
}

export default BulkExpenseUpload;