import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Api from "../Api";
import userImg from '../../images/user2.svg'


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
                    
                }
            }, 1000)

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
                placeholder='Search for users...'
            />

            { result.length !== 0 && (
                <div className="search-results">
                    {result.map((user, key) => (
                        <div key={key} onClick={handleClear} className="search-user">
                            <div className='search-image-div'>
                                <img src={userImg} alt="" />
                            </div>
                            <p>{user.username}</p>
                            <Link to={user.username} className='chat-link'></Link>
                        </div>
                    ))}
                </div>)
            }
        </div>
    )
}

export default Search;