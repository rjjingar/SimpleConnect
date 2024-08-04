import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FetchAuthInfo } from './utils/userAuth';
import useAuth from './hooks/useAuth';

export function AuthRequired({Component}) {

    const { user, loading } = useAuth();

    if (loading) {
        return <div className="App">Loading...</div>;
    } else if (user) {
        return <Component/>;
    }
    return <Navigate to='/landing'/>;
}
  