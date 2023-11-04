import { useAuth } from '../auth/AuthContext';
import { useState } from 'react';
import options from '../../images/options.svg'


const Header = () => {
    const { logout } = useAuth();
    const [showOptions, setShowOptions ] = useState(false)

    const handleShowOptions = () => {
        setShowOptions(prev => !prev)
    }

    return (
        <header>
            <span className="logo" style={{fontSize: '20px'}}>
                <span className="real" style={{color: '#766DF4'}}>Reel</span>
                <span className="chat">Chat</span>
            </span>

            <div onClick={handleShowOptions} className='header-options'>
                <img src={options} alt='' />
            </div>

            {
                showOptions && (
                <div className='header-action' style={{top: '65px'}}>
                    <li onClick={logout}>Logout</li>
                </div>)
            }
        </header>
    )
}

export default Header;