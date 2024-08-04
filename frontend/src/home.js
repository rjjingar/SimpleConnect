import { useEffect, useState, useContext } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';
import { FetchAuthInfo } from './utils/userAuth';
import { AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

const Home = (props) => {
    const navigate = useNavigate();
    
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the user email and token from local storage
        console.log('### Fetching auth info');
        FetchAuthInfo()
            .then((authInfo) => {
                console.log('### Auth info fetched ' + JSON.stringify(authInfo));
                setLoading(false);
                if (!authInfo || !authInfo.isLoggedIn) {
                    setLoggedIn(false);
                    return;
                } else {
                    setLoggedIn(true);
                    setEmail(authInfo.id);
                }
            });
    }, []);
    
    
    
    
    const onButtonClick = () => {
        if (loggedIn) {
            localStorage.removeItem("user")
            props.setLoggedIn(false)
        } else {
            navigate("/signin")
        }
    }

    return <div className="mainContainer">
        <div className={"titleContainer"}>
            <div>Welcome!</div>
        </div>
        <div>
            This is the home page.
        </div>
        <AuthContext.Consumer>
            {(context) => (<p>{context.email}</p>)}
        </AuthContext.Consumer>
        <div className={"buttonContainer"}>
            <input
                className={"inputButton"}
                type="button"
                onClick={onButtonClick}
                value={loggedIn ? "Log out" : "Log in"} />
            {(loggedIn ? <div>
                Your email address is {email}
            </div> : <div/>)}
        </div>


    </div>
}

export default Home