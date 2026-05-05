import { useState } from 'react'
import { Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css'
import { Header, Footer} from './exports';
import Home from './pages/home'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import AllAcademies from './pages/AllAcademies'
import AllCourses from './pages/AllCourses'
import AllTrainers from './pages/AllTrainers'
import ContactUs from './pages/ContactUs'
import TrainerProfile from './pages/TrainerPofile'
import AcademyDetails from './pages/AcademyDetails';
import CourseDetails from './pages/CourseDetails.jsx';
import ForgotPassword from './pages/ForgotPassword';
import PendingApproval from './pages/PendingApproval';
import AcademyRegister from './pages/AcademyRegister';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register/academy" element={<AcademyRegister />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Additional public routes */}
        <Route path="/all-academies" element={<AllAcademies />} />
        <Route path="/all-courses" element={<AllCourses />} />
        <Route path="/all-trainers" element={<AllTrainers />} />
        <Route path="/trainer-profile/:id" element={<TrainerProfile />} />
        <Route path="/contact-us" element={<ContactUs />} />

        <Route path="/courses/:id" element={<CourseDetails/>} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/academy-details/:id" element={<AcademyDetails />} />
      </Routes>
      <Footer />

    <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastStyle={{
        background: '#1e293b',
        border: '2px solid #22d3ee',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '500',
        textAlign: 'center',
        minWidth: '300px',
        maxWidth: '500px',
        margin: '0 auto',
        marginTop: '20px',
      }}
      progressStyle={{
        background: 'linear-gradient(90deg, #22d3ee, #1e40af)',
        height: '3px',
      }}
      bodyStyle={{
        margin: '0',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    /> {/* responsible for displaying toast notifications */}

    </Router>

  )
}

export default App
