import React from "react";
import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, token, role, adminOnly = false, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        // No token case - redirect to login
        if (!token) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
        
        // Admin-only route but user is not an admin
        if (adminOnly && role !== "admin") {
          return (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
        
        // User is authenticated (and is admin if required)
        return <Component {...rest} {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;