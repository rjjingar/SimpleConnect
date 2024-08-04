import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
//import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from "./useUser";
import { useLocalStorage } from "../utils/useLocalStorage";
import { ContextUser, User, UserSignInRequest, UserSignUpRequest } from "../types/user";
import * as userApis from '../utils/userApis';


interface AuthContextType {
  user?: User;
  loading: boolean;
  error?: any;
  signin: (request: UserSignInRequest, callback) => void;
  signup: (request: UserSignUpRequest, callback) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the provider as we need to wrap the entire app with it
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User>();
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  // We are using `react-router` for this example,
  // but feel free to omit this or use the
  // router of your choice.
  //const navigate = useNavigate();
  //const location = useLocation();

  // Reset the error state if we change page
  //useEffect(() => {
  //  if (error) setError(undefined);
  //}, [location.pathname]);

  // Check if there is a currently active session
  // when the provider is mounted for the first time.
  //
  // If there is an error, it means there is no session.
  //
  // Finally, just signal the component that the initial load
  // is over.
  useEffect(() => {
    userApis.fetchContextUser()
      .then((newUser) => setUser(newUser))
      .catch((_error) => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  // Flags the component loading state and posts the login
  // data to the server.
  //
  // An error means that the email/password combination is
  // not valid.
  //
  // Finally, just signal the component that loading the
  // loading state is over.
  function signin(request: UserSignInRequest, callback) {
    setLoading(true);
    setError('');
    userApis.loginUser(request)
      .then((newUser) => {
        setUser(newUser);
        userApis.setContextUser(newUser);
        //navigate('/');
        callback();
      })
      .catch((newError) => setError(newError.message))
      .finally(() => setLoading(false));
  }

  // Sends sign up details to the server. On success we just apply
  // the created user to the state.
  function signup(request: UserSignUpRequest, callback) {
    setLoading(true);
    setError('');
    userApis.createUser(request)
      .then((newUser) => {
        setUser(newUser);
        callback();
        //navigate("/");
      })
      .catch((newError) => setError(newError.message))
      .finally(() => setLoading(false));
  }

  // Call the logout endpoint and then remove the user
  // from the state.
  function logout() {
    userApis.logoutUser().then(() => setUser(undefined));
  }

  // Make the provider update only when it should.
  // We only want to force re-renders if the user,
  // loading or error states change.
  //
  // Whenever the `value` passed into a provider changes,
  // the whole tree under the provider re-renders, and
  // that can be very costly! Even in this case, where
  // you only get re-renders when logging in and out
  // we want to keep things very performant.
  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      signin,
      signup,
      logout,
    }),
    [user, loading, error]
  );

  // We only want to render the underlying app after we
  // assert for the presence of a current user.
  return (
    <AuthContext.Provider value={memoedValue as AuthContextType}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
}

// Let's only export the `useAuth` hook instead of the context.
// We only want to use the hook directly and never the context component.
export default function useAuth() {
  return useContext(AuthContext);
}