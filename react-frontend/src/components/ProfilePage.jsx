import { useState,useEffect } from "react";
import api from"../api/axiosInstance";
import { toast } from "react-toastify";
import "../styles/FormData.css"

function ProfilePage(){

    const [formData, setFormdata]  = useState({    
        username: "",
        email: "",
        password: "",
    });

    const [isSubmit, setIsSubmit] = useState(false);

    const handleChange = (e) => {
        setFormdata(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const res = await api.get("/profile-update/");
            setFormdata({
                username: res.data.username || "",
                email: res.data.email || "",
                password: ""
            });
        } catch (err) {
            console.error("Failed to load profile", err);
        }
    };
        fetchProfile();
        }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let isValid = true; // Assume form is valid for submission
        // Select all inputs
        const inputs = document.querySelectorAll(".form-field input");
        inputs.forEach(input => {
            const error = input.nextElementSibling; // the error-message span
            
            if (input.hasAttribute("required") && !input.value.trim()) {
                if (error)
                    error.style.display = "block"; // show error
                isValid = false;
            } else {
                if (error) error.style.display = "none";  // hide if filled
            }
        });

        if (!isValid) return; // Don't call the api as manadatory fields are missing

        try{
            setIsSubmit(true);
            await api.put("/profile-update/",formData);
            toast.success("Profile updated successfully!")

            setFormdata({
                username: "",
                email: "",
                password: "",
            });
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Failed to update profile");
        }
        finally{
            setIsSubmit(false);
        }
    };


    return(
        <div className="form-page">
                <h2> Edit Profile</h2>
                <form onSubmit={handleSubmit} noValidate>
                    
                    <div className="form-row">

                        <div className="form-field">
                            <label>Username <span className="required-star">*</span></label>
                            <input type="text" name="username" placeholder="Username"
                                value={formData.username} onChange={handleChange} required/>
                            <span className="error-message">Username is required</span>
                        </div>

                        <div className="form-field">
                            <label>Email <span className="required-star">*</span></label>
                            <input type="email" name="email" placeholder="Email"
                                value={formData.email} onChange={handleChange} required/>
                            <span className="error-message">Email is required</span>
                        </div>
                    </div>

                    <div className="form-row">

                        <div className="form-field">
                                <label>Password</label>
                            <input type="password" name="password" placeholder="Leave blank to keep current password"
                                value={formData.password || ''} onChange={handleChange} />
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmit}>
                        {isSubmit? "Updating Profile..." : "Submit"}
                    </button>
                </form>
            </div>
    )
}

export default ProfilePage;