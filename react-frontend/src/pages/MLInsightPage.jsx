import { useState, useEffect } from "react";
import { FaLightbulb, FaCalendarAlt, FaTags, FaChartLine } from "react-icons/fa";
import api from "../api/axiosInstance";
import "../styles/MLInsight.css"
import InsightCardPlaceholder from "../components/InsightCardPlaceholder";

function MLInsightPage() {

    const [prediction, setPrediction] = useState(null);
    const [trend, setTrend] = useState(null);
    const [alert, setAlert] = useState(null);
    const [budget, setBudget] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const categoryIcons = {
        Food: "🍔",
        Travel: "✈️",
        Shopping: "🛍️",
        Bills: "💡",
        Health: "🏥",
        Education: "📚",
        Entertainment: "🎬",
        Rent: "🏠",
        Savings: "💰",
        Other: "📦"
        };

    const fetchData = async () => {
        setLoading(true);
        try{
            const ml_insights = await api.get("/ml-insights")
         
            setPrediction(ml_insights.data.prediction);
            setTrend(ml_insights.data.trend);
            setAlert(ml_insights.data.overspending_alert);
            setBudget(ml_insights.data.budget);

        } catch (err) {
            console.error("Error fetching ML Insights", err);
            setError(true);
            setLoading(false);  
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    },[]);

    if (loading){
        return (
            <div className="ml-page">
                <h2 className="ml-header">Smart Insights</h2>
                <div className="ml-grid-2x2">
                    <InsightCardPlaceholder type="prediction" />
                    <InsightCardPlaceholder type="trend" />
                    <InsightCardPlaceholder type="alert" />
                    <InsightCardPlaceholder type="budget" />
                </div>
            </div>
        );
    } 

    if(error){
        console.error("ML Insight Page rendering error: Failed to load page");
        return (
        <div className="ml-page">
            <h2 className="ml-header">Smart Insights</h2>
            <div className="page-message-error">
                Failed to load ML Insights
            </div>
        </div>
        );
    } 

    return (
        <div className="ml-page">
            <h2 className="ml-header">Smart Insights</h2>
            

            <div className="ml-grid-2x2">
                {/* Predicted expense */}
                <div className="ml-card">
                    <FaCalendarAlt size={28} color="#1976d2" />
                    <h3>Predicted Expense</h3>
                    {prediction && prediction.predicted_expense ? (
                        <>
                            <p>For <b>{prediction.month}, {prediction.year}</b></p>
                            <h1>₹{prediction.predicted_expense}</h1>
                        </>
                    ) : (
                        <p className="empty">Not enough data to generate prediction</p>
                    )}
                </div>

                {/*Spending Trend */}
                <div className="ml-card">
                    <FaChartLine size={28} color="#2e7d32"/>
                    <h3>Spending Trend</h3>
                    {trend ? (
                        <p>
                            {trend.trend === "increase" ? "📈" : "📉"} Your spending changed by <b>{trend.percentage_change}%</b> compared to last month
                        </p>
                    ) : (
                        <p className="empty">No trend data available</p>
                    )}
                </div>

                <div className="ml-card alert-card">
                    <FaTags size={28} color="#d32f2f"/>
                    <h3>Overspending Alert</h3>
                    {alert && alert.category ? (
                        <p>{categoryIcons[alert.category]} You spent {" "} <b>{alert.increase_percent}% more</b> on <b>{alert.category}</b> than usual</p>
                    ) : (
                        <p className="empty">No overspending detected</p>
                    )}
                </div>

                {/* Budget Recommendation */}
                <div className="ml-card">
                    <FaLightbulb size={28} color="#f9a825"/>
                    <h3>Budget Recommendation</h3>
                    {budget && budget.recommended_budget ? (
                        <p>Suggested monthly budget: <b>₹{budget.recommended_budget}</b></p>
                    ) : (
                        <p className="empty">Budget recommendation not available</p>
                    )}
                </div>
            </div>
        </div>
        );
    }

export default MLInsightPage;