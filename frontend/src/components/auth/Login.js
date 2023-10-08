import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import Api from "../Api";
import { useLocation, useNavigate  } from 'react-router-dom'


const Login = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/messages');
        }
    }, [user, navigate]);

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
            navigate('/messages');
        }
    }, [isSubmitted, navigate]);

    return (
        <div className="signup">
            <div className="container">
                <h1>Log In</h1>
                {
                    newUser && (
                        <h3>Sign up was successful. You can now log in</h3>
                    )
                }
                <form onSubmit={handleLogin}>
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
        </div>
    )
}

export default Login;