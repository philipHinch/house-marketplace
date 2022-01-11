//hooks
import { useState } from "react";
//router
import { Link, useNavigate } from 'react-router-dom';
//toast
import { toast } from "react-toastify";
//icons
import { ReactComponent as ArrowRightIcon } from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from '../assets/svg/visibilityIcon.svg';
//firebase
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db } from '../firebase.config';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

const Signup = () => {

    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const { name, email, password } = formData

    const navigate = useNavigate()

    const onChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        try {
            const auth = getAuth()

            const userCredential = await createUserWithEmailAndPassword(auth, email, password)

            const user = userCredential.user

            updateProfile(auth.currentUser, {
                displayName: name
            })

            const formDataCopy = { ...formData }
            delete formDataCopy.password
            formDataCopy.timestamp = serverTimestamp()

            await setDoc(doc(db, 'users', user.uid), formDataCopy)

            navigate('/')

        } catch (error) {
            toast.error('Something went wrong with the registration')
        }
    }


    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>

                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        id="name"
                        value={name}
                        className="nameInput"
                        onChange={(e) => onChange(e)} />
                    <input
                        type="email"
                        placeholder="Email"
                        id="email"
                        value={email}
                        className="emailInput"
                        onChange={(e) => onChange(e)} />
                    <div className="passwordInputDiv">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="passwordInput"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => onChange(e)} />
                        <img src={visibilityIcon} alt="show password" className="showPassword" onClick={() => setShowPassword(prevState => !prevState)} />
                    </div>
                    <Link to='/forgot-password' className="forgotPasswordLink">Forgot Password</Link>
                    <div className="signUpBar">
                        <p className="signUpText">Sign Up</p>
                        <button className="signUpButton"><ArrowRightIcon fill='ffffff' width='34px' height='34px' /></button>
                    </div>
                </form>

                {/* {google OAuth} */}

                <Link to='/signin' className="registerLink">
                    Sign In Instead
                </Link>
            </div>

        </>
    );
}

export default Signup;