import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Api from "../Api";


const Search = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [result, setResult] = useState([])

    const handleChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClear = (e) => {
        setResult([]);
    };

    useEffect(() => {
        if (searchTerm !== "") {
            const fetchData = setTimeout(async () => {
                try {
                    const response = await Api.get(`user/search/?search_term=${searchTerm}`)
                    setResult(response.data)
                } catch {
                    console.log('An error occurred')
                }
            }, 2000)

            return () => clearTimeout(fetchData)
        } else {
            setResult([])
        }
    }, [searchTerm])


    return (
        <div className='search-div'>
            <input
                onChange={handleChange}
                className='search'
                type='text'
                placeholder='Search for RealChat users...'
            />
            <div className="search-results">
                {result.map(user => (
                    <div onClick={handleClear} style={{position: 'relative'}}>
                        <p>{user.username}</p>
                        <Link to={user.username} className='chat-link'></Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Search;