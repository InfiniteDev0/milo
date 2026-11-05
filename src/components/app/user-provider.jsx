"use client";

// Who's signed in — name, email, picture — for anything below the layout that shows it
// (the top bar takes it as a prop; deeper parts, like a menu's "Last edited", read it here)

import { createContext, useContext } from "react";

const UserContext = createContext(null);

export function UserProvider({ user, children }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
