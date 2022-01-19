//styles
import './App.css';
//router
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//pages
import Explore from './pages/Explore';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import Category from './pages/Category';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import Contact from './pages/Contact';
//components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {



  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Explore />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/category/:categoryName' element={<Category />} />
          <Route path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
          </Route>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route path='/category/:categoryName/:listingId' element={<Listing />} />
          <Route path='/contact/:landlordId' element={<Contact />} />
        </Routes>
        <Navbar />
      </Router>

      <ToastContainer />
    </>
  );
}

export default App;
