import Login from "./pages/Login";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ViewExpenses from "./pages/ViewExpenses";
import AddExpense from "./pages/AddExpense";
import BulkExpenseUpload from "./pages/BulkExpenseUpload";
import ProfilePage from "./components/ProfilePage";
import ProfileMenu from "./components/ProfileMenu";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./routes/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/common.css"
import MLInsightPage from "./pages/MLInsightPage";
import { UIProvider } from "./context/uiContext";

function App(){

  return (
    <BrowserRouter>
      <ToastContainer theme="auto" />
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route element={<PrivateRoute><><ProfileMenu /><Outlet /></></PrivateRoute>} >
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/view-expenses" element={<ViewExpenses />}/>
          <Route path="/add-expense" element={<AddExpense />}/>
          <Route path="/add-bulk-expense" element={<BulkExpenseUpload />} />
          <Route path="/smart-insights" element={<MLInsightPage />} />
          <Route path="edit-profile" element={<ProfilePage />}></Route>
        </Route>
        <Route path="*" element={<NotFound />}/>
      </Routes>
  </BrowserRouter>
  );
}

export default App;