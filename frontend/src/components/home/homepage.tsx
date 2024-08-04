import React from "react";
import useAuth from "../../hooks/useAuth";


export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="mainContainer">
        <div className={"titleContainer"}>
            <div>Welcome! {user!.email}</div>
        </div>
        <div> This is the home page. </div>
        
        <div className={"buttonContainer"}>
            <input
                className={"inputButton"}
                type="button"
                onClick={logout}
                value="Log out"
            />
        </div>
    </div>
  );
}