import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import EmptyState from "../common/EmptyState"


const COLORS = [
  "#6366F1",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
  "#14B8A6",
  "#F97316"
]

function MonthlyExpenseChart({ data }){

    console.log("bar chart re render");

    if(!data?.length){
        return <EmptyState message="No monthly expense data available" />
    }

    return (
        <div style={{width:700}}>
            <ResponsiveContainer width="150%" height={350}>
                <BarChart data={data} barCategoryGap="30%"  margin={{ top: 30, right: 20, left: 90, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis  dataKey="month" label={{ value: "Month →", position:"insideBottom", offset: -5, dy:20}}/>
                    <YAxis label={{value:"Cost (₹) →", angle: -90, position:"insideLeft", dx: -15}} />
                    <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
                    <Bar dataKey="total" maxBarSize={60} radius={[8,8,0,0]} label={{position: "top"}}>
                        {data.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default MonthlyExpenseChart;