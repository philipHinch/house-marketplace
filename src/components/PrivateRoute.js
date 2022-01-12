//router
import { Navigate, Outlet } from 'react-router-dom';
//hooks
import { useAuthStatus } from '../hooks/useAuthStatus';
//components
import Spinner from '../components/Spinner'

const PrivateRoute = () => {

    const { loggedIn, checkingStatus } = useAuthStatus()

    if (checkingStatus) {
        return <Spinner />
    }

    return loggedIn ? <Outlet /> : <Navigate to='/signin' />
}

export default PrivateRoute;


// checkout more details about private routes, outlet components and nested routes