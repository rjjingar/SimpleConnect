import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './home';
import HomePage from './components/home/homepage';
import SignIn from './components/login/SignIn';
import SignInV2Page from './components/login/SigninV2'; 
import SignUpV2Page from './components/login/SignupV2';
import SignUp from './components/login/SignUp';
import LandingPage from './components/landing/landing';
import { RequireAuth } from './RequireAuth';
import './App.css';
import { useEffect, useState } from 'react';
import { FetchAuthInfo } from './utils/userAuth';
import useAuth, { AuthProvider } from './hooks/useAuth';
import { AuthContext } from './context/AuthContext';
import { AuthRequired } from './AuthRequired';

function App() {
  const { user, login, logout, setUser } = useAuth();


  const [loggedIn, setLoggedIn] = useState(false)
  const [userId, setUserId] = useState("")
  const [email, setEmail] = useState("")
  const [userToken, setUserToken] = useState("")
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the user email and token from local storage
    FetchAuthInfo()
      .then((authInfo) => {
        console.log('### App.js Auth info fetched ' + JSON.stringify(authInfo));
        setLoading(false);
        if (!authInfo || !authInfo.isLoggedIn) {
            setLoggedIn(false);
            return;
        } else {
            setLoggedIn(true);
            setUserId(authInfo.id);
            setUserToken(authInfo.token);
        }
      });
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Routes requiring authentication */}
            {/*<Route path="/" element={<RequireAuth Component={Home} />}/>*/}
            <Route path="/" element={<AuthRequired Component={HomePage/>}/>
            {/* Public routes not requiring authentication */}
            <Route path="/landing" element={<LandingPage setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
            <Route path="/signin" element={<SignInV2Page setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
            <Route path="/signup" element={<SignUpV2Page setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

export default App;