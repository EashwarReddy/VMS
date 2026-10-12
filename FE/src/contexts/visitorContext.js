import React, { createContext, useState, useEffect, useContext } from "react";

const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {
  const [visitorNow, setVisitorNow] = useState({
    data : '',
    isStanding : false
   });
const newVisitor = (data,standing)=>{
  console.log('setting visitor', data)
    setVisitorNow({
        data : data,
        isStanding : standing
    })
}
 const visitorFns = {
    newVisitor,
    visitorNow
 }

  return (
    <VisitorContext.Provider value={visitorFns}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => useContext(VisitorContext);
