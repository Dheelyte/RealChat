import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import '../../styles/login.css'
import Api from "../Api";
import { Link, useLocation, useNavigate  } from 'react-router-dom'


const Login = () => {
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

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsSubmitting(true)
        try {
            const response = await Api.post('user/login/', {
                username: formData.username,
                password: formData.password,
            });
            setIsSubmitting(false);
            setIsSubmitted(true)
            login(response.data);
        } catch(error) {
            setIsSubmitting(false);
            error.response && setFormErrors(error.response.data);
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
                    <span className="logo hidden">
                        <span className="real">Real</span>
                        <span className="chat">Chat</span>
                    </span>
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
                        </div>
                        <div className="input-container">
                            <label>Password </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required />
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
                        <span className="logo">
                            <span className="real">Real</span>
                            <span className="chat">Chat</span>
                        </span>
                        <h1>Connect with friends!</h1>
                        <p>Real-time messaging with end-to-end encryption</p>
                        <button className="overlay-button" id="signIn"><Link to='/signup'>Sign Up</Link></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;