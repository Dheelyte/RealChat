import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import '../../styles/login.css'
import Api from "../Api";
import { useLocation, useNavigate  } from 'react-router-dom'


const Login = () => {
    document.body.classList.add('login-body');
    const navigate = useNavigate();
    const { login } = useAuth();

    const location = useLocation();
    const { newUser } = location.state ?? { newUser: false };
    console.log(newUser)

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const renderErrorMessage = (name) =>
        formErrors[name] && (
        <div className="error">{formErrors[name].join(", ")}</div>
    );
    

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsSubmitting(true)
        try {
            const response = await Api.post('user/login/', {
                username: formData.username,
                password: formData.password,
            });
            console.log(response.data);
            setIsSubmitting(false);
            setIsSubmitted(true)
            login(response.data);
        } catch(error) {
            setIsSubmitting(false);
            error.response && setFormErrors(error.response.data);
            error.response && console.log(error.response.data);
        }
    }

    useEffect(() => {
        if (isSubmitted) {
            navigate('/');
        }
    }, [isSubmitted, navigate]);

    return (
        <div className="body-container">
            <div className="auth-container">
                <div className="login-container">
            
                    <form onSubmit={handleLogin} className="form-container"> 
                        <h1 className="title">Log in</h1>
                        {
                            Object.keys(formErrors).length !== 0 &&
                            <div className="error">{formErrors["error"]}</div>
                        }
                        <div className="input-container">
                            <label>Username </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                            {renderErrorMessage("username")}
                        </div>
                        <div className="input-container">
                            <label>Password </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required />
                            {renderErrorMessage("password")}
                        </div>
                        <div className="button-container">
                            {
                                isSubmitting ? (
                                    <button type="submit" disabled>
                                        Loading...
                                    </button>
                                ) : (
                                    <button type="submit" >
                                        Log In
                                    </button>
                                )
                            }
                            
                        </div>
                    </form>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <h1>Welcome Back!</h1>
                        <p>To keep connected with us please login with your personal info</p>
                        <button className="overlay-button" id="signIn">Sign In</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;