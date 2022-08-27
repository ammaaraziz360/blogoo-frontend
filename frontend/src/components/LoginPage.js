import { useEffect, useState, useReducer, useContext } from 'react';
import { GoogleLogin } from 'react-google-login';
import {useHistory} from 'react-router';
import Cookies from 'universal-cookie'

import BlankModal from './Modal';
import EnterUsernameModal from './UsernameInputModal'

import '../App.css'
import React from 'react';
import {Redirect} from 'react-router-dom';
import { LoggedInContext } from './LoggedInContext';

const clientId = "31312193628-o29ttjk3ogu3ftvbvurt91oi8t3akt0m.apps.googleusercontent.com"
const cookies = new Cookies();

// regular expression with only letters, numbers, and _!#$%&*.'=+
const username_regex = new RegExp("^[a-zA-Z0-9_!#$%&*.'=+]*")

const LoginPage = ({...Props}) => {

    const logged_in_state = useContext(LoggedInContext) 

    const[toggleUsernameModal, setToggleUsernameModal] = useState(false);
    const[toggleModal, setToggleModal] = useState(false);

    const[modalText, setModalText] = useState({'title': '', 'body': ''})

    const history = useHistory()

    const responseGoogle = (response) => { 
        var google_user = response.profileObj

        var user_data = {
            'user-id': "",
            'email': google_user.email,
            'last_name': google_user.familyName,
            'first_name': google_user.givenName,
            'pfp_url': google_user.imageUrl
        }

        sessionStorage.setItem("google_auth_token", response.getAuthResponse().id_token)

        fetch(`${process.env.REACT_APP_DOMAIN}/api/users/login`, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(user_data),
            headers: {
                'Content-Type': 'application/json',
                'google-auth-token': response.getAuthResponse().id_token,
            },
        }) 
            .then(res => {
                if (res.status === 200){
                    cookies.set('token', res.headers.get('X-JWT'), {path: '/'})
                    return res.json()
                }
                else{
                    throw new Error("Internal server error, try again later")
                }
             }) 
            .then(data => {
                cookies.set('user-id', data.user_id, { path: '/' })
                cookies.set('SID', data.session_id, { path: '/' })
                if(data['user_exists'] == 1){
                    localStorage.setItem('logged_in', 'true')
                    logged_in_state.setIsLoggedIn(true);
                    history.push(`/user/${cookies.get('user-id')}`)
                }
                else {
                    localStorage.setItem('logged_in', 'false')
                    logged_in_state.setIsLoggedIn(false);
                    setToggleUsernameModal(!toggleUsernameModal)
                }
            })
            .catch(error => {
                localStorage.setItem('logged_in', 'false')
                logged_in_state.setIsLoggedIn(false);
                setModalText({'title': 'Something went very wrong', 'body': error.message})
                setToggleModal(!toggleModal)
            })
    }

    const NoResponseGoogle = () => {
        localStorage.setItem('logged_in', 'false')
        logged_in_state.setIsLoggedIn(false);
        setModalText({'title': 'Something went very wrong', 'body': 'Login failure, please try again'})
        setToggleModal(!toggleModal)
    }

    return(
        <>
            <div className='smokey_black'>
                    <div className='m-4 row justify-content-center'>
                        <div className='col-lg-6 col-sm-12 justify-content-center'>
                            <div className="p-3 full-border">
                                <div style={{"color": "white"}} className='text-center'>
                                    <h2>Sign in to Blogoo</h2>
                                    <p>Or create an account</p>
                                </div>
                                <div className="d-flex p-4 justify-content-center">
                                    <GoogleLogin
                                        clientId= {clientId}
                                        buttonText="Log in with Google"
                                        onSuccess={responseGoogle}
                                        onFailure={NoResponseGoogle}
                                        cookiePolicy={'single_host_origin'}
                                    />
                            </div>
                            </div>
                        </div>
                    </div>
                   
            </div>
            {toggleUsernameModal 
                ? <EnterUsernameModal toggleModal = {toggleUsernameModal}
                                    setToggleModal = {setToggleUsernameModal}
                                    setIsLoggedIn={Props.setIsLoggedIn}
                                    isLoggedIn={Props.isLoggedIn}/>
                : null
            }
            <BlankModal toggleModal = {toggleModal}
                        setToggleModal = {setToggleModal}
                        text = {modalText}/>
        </>
    )
}

export default LoginPage