import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FetchAuthInfo } from './utils/userAuth';
import useAuth from './hooks/useAuth';

export function RequireAuth({Component}) {

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

    if (isLoading) {
        return <div className="App">Loading...</div>;
    } else {
        return loggedIn ? <Component/> : <Navigate to="/landing"/>
    }
}
  