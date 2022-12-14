import { useEffect, useState, useReducer, useContext } from 'react';
import { useHistory } from 'react-router';
import Cookies from 'universal-cookie'

import { Link } from 'react-router-dom';
import '../App.css'
import React from 'react';
import { LoggedInContext } from './LoggedInContext';

const cookie = new Cookies();


const NavBar = () => {

    const logged_in_state = useContext(LoggedInContext)

    const [userProfile, setUserProfile] = useState(null);
    const history = useHistory();

    useEffect(() => {
        if (logged_in_state.isLoggedIn) {
            fetch(`${process.env.REACT_APP_DOMAIN}/api/users/profile`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + cookie.get('token'),
                    'user-id': cookie.get('user-id'),
                    'SID': cookie.get('SID')
                },
            })
            .then(res => {
                if (res.status === 200) {
                    if(res.headers.get('X-JWT') != null) {
                        cookie.set('token', res.headers.get('X-JWT'), {path: '/'})
                    }
                    localStorage.setItem('logged_in', 'true');
                    logged_in_state.setIsLoggedIn(true);
                    return res.json()
                } 
                else if (res.status === 401) {
                    localStorage.setItem('logged_in', 'false');
                    logged_in_state.setIsLoggedIn(false);
                    return null
                }
            })
            .then(data => {
                setUserProfile(data.requester_profile)
            })
            .catch(err => {
                console.log(err)
            })
        } else{
            cookie.remove('token', {path: '/'})
            cookie.remove('user-id', {path: '/'})
            cookie.remove('SID', {path: '/'})
            setUserProfile(null)
        }

    }, [logged_in_state.isLoggedIn]);

    const LogOut = () => {
        fetch(`${process.env.REACT_APP_DOMAIN}/api/users/logout`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cookie.get('token'),
                'user-id': cookie.get('user-id'),
                'SID': cookie.get('SID')
            },
        }).then(res=> {
            if(res.status === 200) {
                cookie.remove('token', {path: '/'})
                cookie.remove('user-id', {path: '/'})
                cookie.remove('SID', {path: '/'})
            }
            localStorage.setItem('logged_in', 'false');
            logged_in_state.setIsLoggedIn(false);
            history.push('/login')
        }).catch(err=> {
            localStorage.setItem('logged_in', 'false');
            logged_in_state.setIsLoggedIn(false);
            history.push('/login')
        })
    }
    return (
        <div className="sub naver">
            <div className='container-fluid'>
                <div className="d-flex row p-3">
                    
                    <div className="d-flex col-3 align-items-center">
                        <Link to="/login" className='nav-brand'>
                            <h2>Blogoo</h2>
                        </Link>
                    </div>
                        <div className="d-flex col-6 justify-content-center align-items-center">
                            <input className="form-control search-bar" type="text" placeholder="Search for people, tags, and categories"></input>
                        </div>
                    <div className="d-flex col-3 justify-content-end align-items-center">
                        <div className="dropdown sub">
       <a className="" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                                {userProfile != null ? <img src={userProfile.pfp_url} className="image-fluid pfp"></img>
                                            : <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" className="image-fluid pfp"></img>
                                }
                            </a>

                            <ul className="dropdown-menu m-3" aria-labelledby="dropdownMenuLink">
                                {userProfile != null ? [<li key={1}><Link to={`/user/${userProfile.username}`} className="dropdown-item">Profile</Link></li>,
                                            <li key={2}><Link to="/"className="dropdown-item">Settings</Link></li>,
                                            <li key={3}><a className="dropdown-item" onClick={() => LogOut() }>Log out</a></li>]
                                            : <li><Link to="/login" className="dropdown-item" >Log In</Link></li>
                            }
                            </ul>
                        </div>
                        
                    </div>
                </div>
            
            </div>
        </div>
    );
}

export default NavBar;