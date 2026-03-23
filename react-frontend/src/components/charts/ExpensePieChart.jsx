import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import EmptyState from "../common/EmptyState"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFF"];

function ExpensePieChart({ data }){

    if(!data?.length){
        return <EmptyState message="No category data available" />
    }

    return (
    <div style={{ width: 500 }}>
        <h2>Category Summary</h2>

        <PieChart width={540} height={350}  margin={{ top: 20, right: 180, bottom: 50, left: 180 }}>
        <Pie
            data={data}
            dataKey="total"
            nameKey="category"
            cx="40%"
            cy="50%"
            outerRadius={90}
            label={({ category, total }) => `${category} (${total})`}
            labelLine={true}
            minAngle={3}
        >
            {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>

        <Tooltip formatter={(value) => [`${value}`, "Amount"]} />
        <Legend verticalAlign="bottom" />
        </PieChart>
    </div>
    );
}

export default ExpensePieChart;