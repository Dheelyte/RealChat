import { useState, useEffect } from "react";
import { Link, useNavigate  } from 'react-router-dom'
import Api from "../Api";


const Signup = () => {

    const navigate = useNavigate();

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
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
    

    const handleSignup = async (event) => {
        event.preventDefault();
        setIsSubmitting(true)
        try {

            await Api.post('user/signup/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            setIsSubmitting(false);
            setIsSubmitted(true)
        } catch(error) {
            setFormErrors(error.response.data);
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (isSubmitted) {
            navigate('/login', { state: { newUser: true } });
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
                    <form onSubmit={handleSignup} className="form-container"> 
                        <h1 className="title">Sign Up</h1>
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
                            <label>Email </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required />
                            {renderErrorMessage("email")}
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
                                        Sign Up
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
                        <button className="overlay-button" id="signIn"><Link to='/login'>Log In</Link></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup;