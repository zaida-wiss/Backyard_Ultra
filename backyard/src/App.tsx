import Dashboard from "./components/Dashboard/Dashboard";
import Header from "./components/Layout/Header/Header";
import './App.css';
import { UserLogin } from "./components/userLogin/userLogin";
import {useState} from "react";



export default function App() {
  const [loginIsOpen, setLoginIsOpen] = useState (false);


  return (
    <>
      <Header onLoginClick={() => setLoginIsOpen(true)}/>
      {loginIsOpen && (
        <div className="modal-overlay">
          <UserLogin onClose= {() => setLoginIsOpen(false)}/>
        </div>
      )}
      <Dashboard />
    </>
  );
};
