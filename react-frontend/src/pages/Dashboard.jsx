import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import "../styles/Dashboard.css";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyExpenseChart from "../components/charts/MonthlyExpenseChart";
import RecentTransactions from "../components/RecentTransactions";
import ErrorMessage from "../components/common/ErrorMessage"
import EmptyState from "../components/common/EmptyState"
import InsightCardPlaceholder from "../components/InsightCardPlaceholder";

function Dashboard() {

  const navigate = useNavigate();
  const [dashboard_data, setDashboardData] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await api.get("expenses/available-years/");
        console.log(res.data)
        setYears(res.data);

        if(res.data.length > 0){
          setSelectedYear(res.data[0]); // latest by default
        }
      } catch (err) {
        console.log("Failed to fetch years.")
        setError(true);
        setLoading(false);
      }
    };

    fetchYears();
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      try{
        const res = await api.get(`/dashboard/?year=${selectedYear}`);
        setDashboardData(res.data);
        setError(false);
      } catch (err) {
        setError(true);
      }
      finally {
          setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [selectedYear]);
  

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-topbar">
          <h1>Expense Tracker Dashboard</h1>
        </div>

        <div className="dashboard-cards">
          <InsightCardPlaceholder />
          <InsightCardPlaceholder />
          <InsightCardPlaceholder />
          <InsightCardPlaceholder />
        </div>

        <div style={{ display: "flex", gap: 40, marginTop: 10}}>
          <InsightCardPlaceholder height="250px" width="50%" /> {/* Pie chart placeholder */}
          <InsightCardPlaceholder height="250px" width="50%" /> {/* Bar chart placeholder */}
        </div>

        <div className="table-container">
          <InsightCardPlaceholder height="200px" /> {/* Table placeholder */}
        </div>
      </div>
    );
  }
  if (error){
    return (
      <div className="dashboard-container">
        <div className="dashboard-topbar">
          <h1>Expense Tracker dashboard</h1>
        </div>

        <ErrorMessage message="Failed to load dashboard.Please check your connection or try again later." />
      </div>
    );
  } 

  if(years.length === 0) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-topbar">
          <h1>Expense Tracker Dashboard</h1>
        </div>

        
        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate("/view-expenses")}>
            <h3>View Expenses</h3>
            <p>Browse and manage all your recorded expenses</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/add-expense")}>
            <h3>Add Expense</h3>
            <p>Add a new expense entry</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/add-bulk-expense")}>
            <h3>Add Bulk Expense</h3>
            <p>Upload csv file to add multiple expenses</p>
          </div>

          <div className ="dashboard-card" onClick={() => navigate("/ml-insights")}>
            <h3>Smart Insights</h3>
            <p>AI-powered insights about your spending patterns</p>
          </div>
      </div>

        <EmptyState message="No expenses found yet" />
      </div>
    );
  }

  if(!dashboard_data){

      return (
      <div className="dashboard-container">
        <div className="dashboard-topbar">
          <h1>Expense Tracker dashbnoard</h1>
        </div>
        <EmptyState message="No dashboard data avialable" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* top bar */}
      <div className="dashboard-topbar">
        <h1>Expense Tracker Dashboard</h1>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => navigate("/view-expenses")}>
          <h3>View Expenses</h3>
          <p>Browse and manage all your recorded expenses</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/add-expense")}>
          <h3>Add Expense</h3>
          <p>Add a new expense entry</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/add-bulk-expense")}>
          <h3>Add Bulk Expense</h3>
          <p>Upload csv file to add multiple expenses</p>
        </div>

        <div className ="dashboard-card" onClick={() => navigate("/ml-insights")}>
          <h3>Smart Insights</h3>
          <p>AI-powered insights about your spending patterns</p>
        </div>

      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 10}}>
        <div className="chart-container">
          <ExpensePieChart data={dashboard_data.pie_chart}/>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2>Monthly Expenses</h2>
          <div className="year-filter">
            <label htmlFor="yearSelect">Year:</label>

            <select id="yearSelect" value={selectedYear || ''} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
            </select>
          </div>
        </div>

          <MonthlyExpenseChart data={dashboard_data.bar_graph}/>
        </div>
      </div>

      <div className="table-container">
        <RecentTransactions transactions={dashboard_data.recent_transactions}/>
      </div>
    </div>
    
  );
}

export default Dashboard;