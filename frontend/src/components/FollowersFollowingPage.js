import { useEffect, useState, useReducer, react, useContext } from 'react';
import { useHistory, useParams } from 'react-router';
import Cookies from 'universal-cookie'
import { LoggedInContext } from './LoggedInContext';
import LoadingSpinner from './LoadingSpinner';
import UserList from './UserList';

const cookie = new Cookies();

const FollowersFollowingPage = ({type}) => {
    const {username} = useParams();  

    const [followers, setFollowers] = useState(null);
    const logged_in_state = useContext(LoggedInContext) 

    const history = useHistory();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_DOMAIN}/api/users/${username}/${type}`, {
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
                return res.json();
            } 
            else{
                history.push('/404')
            }
        })
        .then(data => {
            console.log(data)
            setFollowers(data);
        })
        .catch(err => {
            console.log(err)
        })
    }, [])

    return(
        <div>
            {followers != null ? 
                <div className="profile-header p-4">
                    <div className="hr">
                        <h4>{type.charAt(0).toUpperCase() + type.slice(1)} for {username}</h4>
                    </div>
                    <div className='mt-3'>
                        {followers.length > 0 ? 
                            followers.map(follower => {
                                return(
                                    <UserList key={follower.user_id} user_info={follower}/>
                                )
                            })
                            : <h5>No {type}</h5>
                        }
                    </div>
                </div>
            :<LoadingSpinner/>}
        </div>
    )
}

export default FollowersFollowingPage;