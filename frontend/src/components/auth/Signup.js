import { useState, useEffect } from "react";
import { useNavigate  } from 'react-router-dom'
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

            const response = await Api.post('user/signup/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });
            console.log(response.data);
            setIsSubmitting(false);
            setIsSubmitted(true)
        } catch(error) {
            setFormErrors(error.response.data);
            console.log(error.response.data)
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (isSubmitted) {
            navigate('/login', { state: { newUser: true } });
        }
    }, [isSubmitted, navigate]);

    return (
        <div className="signup">
            <div className="container">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignup}>
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
                            required
                        />
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

            <div className="form-container sign-up-container">
		<form action="#">
			<h1>Create Account</h1>
			<div className="social-container">
				<a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
				<a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
				<a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
			</div>
			<span>or use your email for registration</span>
			<input type="text" placeholder="Name" />
			<input type="email" placeholder="Email" />
			<input type="password" placeholder="Password" />
			<button>Sign Up</button>
		</form>
	</div>
        </div>
    )
}

export default Signup;