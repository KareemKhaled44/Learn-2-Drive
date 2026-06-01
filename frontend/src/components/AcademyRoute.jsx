// src/components/AcademyRoute.jsx
import { Navigate } from 'react-router-dom'

const AcademyRoute = ({ children }) => {
    const role = localStorage.getItem('role')
    const access = localStorage.getItem('access')

    if (!access) return <Navigate to="/signin" />
    if (role !== 'academy') return <Navigate to="/" />

    return children
}

export default AcademyRoute