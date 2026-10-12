import React, { createContext, useState, useEffect, useContext } from "react";

const RegisterContext = createContext();

export const RegisterProvider = ({ children }) => {
  const [RegisterNow, setRegisterNow] = useState({
    pnr : null,
    currentTab : null
   });
const newRegister = (pnr,currentTab)=>{
  console.log('setting Register', pnr, currentTab)
    setRegisterNow({
        pnr : pnr,
        currentTab : currentTab
    })
}
 const RegisterFns = {
    newRegister,
    RegisterNow
 }

  return (
    <RegisterContext.Provider value={RegisterFns}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => useContext(RegisterContext);
