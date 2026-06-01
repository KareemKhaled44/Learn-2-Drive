import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css'
import { Header, Footer} from './exports';
import Home from './pages/home'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import AllAcademies from './pages/AllAcademies'
import AllCourses from './pages/AllCourses'
import ContactUs from './pages/ContactUs'
import TrainerProfile from './pages/TrainerPofile'
import AcademyDetails from './pages/AcademyDetails';
import CourseDetails from './pages/CourseDetails.jsx';
import ForgotPassword from './pages/ForgotPassword';
import PendingApproval from './pages/PendingApproval';
import AcademyRegister from './pages/AcademyRegister';
import Dashboard from './pages/dashboard/index'
import Overview from './pages/dashboard/Overview'
import Trainers from './pages/dashboard/Trainers'
import TrainerForm from './pages/dashboard/TrainerForm'
import Courses from './pages/dashboard/Courses'
import CourseForm from './pages/dashboard/CourseForm'
import Bookings from './pages/dashboard/Bookings'
import Profile from './pages/dashboard/Profile'
import AcademyRoute from './components/AcademyRoute'
import Booking from './pages/Booking';
import BookingDetail from './pages/BookingDetail';
import MyBookings from './pages/MyBookings';
import UserDashboard from "./pages/User_Dashboard/UserDashboard";
import UserProfile from "./pages/User_Dashboard/UserProfile";
import UserBookings from "./pages/User_Dashboard/UserBooking";
import UserRatings from "./pages/User_Dashboard/UserRating";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  return (
    <>
      <Header />
      <Routes>
        <Route path="/dashboard" element={
            <AcademyRoute>
                <Dashboard />
            </AcademyRoute>
        }>
            <Route index element={<Overview />} />
            <Route path="trainers" element={<Trainers />} />
            <Route path="trainers/add" element={<TrainerForm />} />
            <Route path="trainers/edit/:id" element={<TrainerForm />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/add" element={<CourseForm />} />
            <Route path="courses/edit/:id" element={<CourseForm />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register/academy" element={<AcademyRegister />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Additional public routes */}
        <Route path="/all-academies" element={<AllAcademies />} />
        <Route path="/all-courses" element={<AllCourses />} />
        <Route path="/trainer-profile/:id" element={<TrainerProfile />} />
        <Route path="/contact-us" element={<ContactUs />} />

        <Route path="/courses/:id" element={<CourseDetails/>} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/academy-details/:id" element={<AcademyDetails />} />
        <Route path="/booking/course/:courseId" element={<Booking />} />
        <Route path="/booking/:id" element={<BookingDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        {/* User Dashboard Routes */}
        <Route path="/userdashboard" element={<UserDashboard />}>
          <Route index element={<UserProfile />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="ratings" element={<UserRatings />} />
        </Route>
        
      </Routes>
      {!isDashboard && <Footer />}   

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
    </>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>

  )
}

export default App
