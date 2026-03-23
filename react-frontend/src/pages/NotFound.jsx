import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css";

function NotFound(){
    const navigate = useNavigate();

    return (
        <div className="notfound-page">
            <div className="notfound-content">
                <h1>404</h1>
                <p>Oops! The page you are looking for does not exists!</p>
                <button className="back-home-btn" onClick={() => navigate("/dashboard")} >
                    Go Back Home
                </button>
            </div>
        </div>
    );
}

export default NotFound;