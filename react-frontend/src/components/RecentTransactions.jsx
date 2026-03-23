import "../styles/RecentTransactions.css"
import EmptyState from "./common/EmptyState"

function RecentTransactions({ transactions }){
   
    if(!transactions?.length){
        return <EmptyState message="No recent transactions" />
    }

    return (
        <div className="recent-transactions">
            <h2>Recent Transactions</h2>

        <table className="transactions-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                </tr>
            </thead>

            <tbody>
                {transactions.map((transaction, index) => (
                    <tr key={index}>
                        <td>{transaction.date}</td>
                        <td>{transaction.category}</td>
                        <td>₹{transaction.amount}</td>
                    </tr>
                ))
                }
            </tbody>
        </table>
    </div>
    );
}

export default RecentTransactions;