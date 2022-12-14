import { useEffect, useState, useReducer, useContext, useRef } from 'react';
import { useHistory } from 'react-router'
import {Button} from 'react-bootstrap';
import Cookies from 'universal-cookie'
import { LoggedInContext } from './LoggedInContext';

const FollowButton = ({userProfile}) => {
    const history = useHistory();
    const logged_in_state = useContext(LoggedInContext);
    const cookie = new Cookies();
    const [following, setFollowing] = useState(userProfile.requester_follows);

    const [isHover, setIsHover] = useState(false);

    const didMount = useRef(false);

    useEffect(() => {
        if(didMount.current) {
            if (logged_in_state.isLoggedIn) {
                fetch(`${process.env.REACT_APP_DOMAIN}/api/users/${userProfile.user_id}/follow`, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + cookie.get('token'),
                            'user-id': cookie.get('user-id'),
                            'SID': cookie.get('SID')
                        },
                        body: JSON.stringify({following: following}),
                }).then(res => {
                    if (res.status === 200) {
                        if(res.headers.get('X-JWT') != null) {
                            cookie.set('token', res.headers.get('X-JWT'), {path: '/'})
                        }
                        return res.json()
                    } else if (res.status === 401) {
                        logged_in_state.setIsLoggedIn(false);
                        console.log('You are not logged in');
                    }
                }).catch(err => {
                    console.log(err);
                })
            }
        }
        else {
            didMount.current = true;
        }

    }, [following]);

    const FollowUser = (e, follow) => {
        e.stopPropagation();
        logged_in_state.isLoggedIn ? setFollowing(follow) : console.log('You are not logged in');;
    }

    return (
        <div>
            {following == 1?
                <Button id="following" className="bg-light text-dark" onClick={(e) => FollowUser(e, 0)} onMouseOver={()=> setIsHover(true)} onMouseOut={() => setIsHover(false)}>
                    { isHover ?  "Unfollow" : "Following" }
                </Button>
                : 
                <Button onClick={(e) => FollowUser(e, 1)}>
                    Follow
                </Button>
            }
        </div>
    );
}

export default FollowButton;