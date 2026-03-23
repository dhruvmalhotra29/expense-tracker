import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsername, logout } from "../utils/auth";
import "../styles/Dashboard.css";

function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const username = getUsername();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="profile-menu-wrapper" ref={menuRef}>
      <button className="profile-avatar-btn" onClick={() => setOpen(p => !p)}>
        {username?.[0]?.toUpperCase() || "U"}
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-item">→ {username}</div>

          <button className="profile-dropdown-item profile-edit" 
                  onClick={() => navigate("/edit-profile")}
          >
            Edit Profile
          </button>

          <button className="profile-dropdown-item profile-logout"
                  onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;