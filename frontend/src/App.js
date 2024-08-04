import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './components/home/homepage';
import SignInV2Page from './components/login/SigninV2'; 
import SignUpV2Page from './components/login/SignupV2';
import LandingPage from './components/landing/landing';
import './App.css';
import useAuth, { AuthProvider } from './hooks/useAuth';
import { AuthRequired } from './AuthRequired';

function App() {


  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Routes requiring authentication */}
            {/*<Route path="/" element={<RequireAuth Component={Home} />}/>*/}
            <Route path="/" element={<AuthRequired Component={HomePage}/>}/>
            {/* Public routes not requiring authentication */}
            <Route path="/landing" element={<LandingPage/>} />
            <Route path="/signin" element={<SignInV2Page />} />
            <Route path="/signup" element={<SignUpV2Page />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;