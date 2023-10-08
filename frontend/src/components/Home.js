import { Link } from "react-router-dom"
import { useAuth } from "./auth/AuthContext"

const Home = () => {
    const { user } = useAuth();
    console.log(user)
    return (
        <>
            <h1>Home</h1>
            <Link to='/messages'>Messages</Link>
            <Link to='/login'>login</Link>
            <Link to='/signup'>Sign Up</Link>
        </>
    )
}

export default Home