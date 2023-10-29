import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <h1>Home</h1>
            <Link to='/'>Messages</Link>
            <Link to='/login'>login</Link>
            <Link to='/signup'>Sign Up</Link>
        </>
    )
}

export default Home