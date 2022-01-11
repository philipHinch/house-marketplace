import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
//icons
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

const Signin = () => {

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const { email, password } = formData

    const onChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>

                <form>
                    <input type="email" placeholder="Email" id="email" value={email} className="emailInput" onChange={(e) => onChange(e)} />
                    <div className="passwordInputDiv">
                        <input type={showPassword ? 'text' : 'password'} className="passwordInput" id="password" placeholder="Password" value={password} onChange={(e) => onChange(e)} />
                        <img src={visibilityIcon} alt="show password" className="showPassword" onClick={() => setShowPassword(prevState => !prevState)} />
                    </div>
                    <Link to='/forgot-password' className="forgotPasswordLink">Forgot Password</Link>
                    <div className="signInBar">
                        <p className="signInText">Sign In</p>
                        <button className="signInButton"><ArrowRightIcon fill='ffffff' width='34px' height='34px' /></button>
                    </div>
                </form>

                {/* {google OAuth} */}

                <Link to='/signup' className="registerLink">
                    Sign Up Instead
                </Link>
            </div>

        </>
    );
}

export default Signin;