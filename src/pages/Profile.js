//firebase
import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
//hooks
import { useEffect, useState } from 'react';
//router 
import { useNavigate, Link } from 'react-router-dom';
//toast
import { toast } from 'react-toastify';


const Profile = () => {

    const auth = getAuth()
    const navigate = useNavigate()

    const [changeDetails, setChangeDetails] = useState(false)

    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })

    const { name, email } = formData

    const onLogout = () => {
        auth.signOut()
        navigate('/')
    }

    const onSubmit = async () => {
        try {
            if (auth.currentUser.displayName !== name) {
                //update displayName in firebase
                await updateProfile(auth.currentUser, {
                    displayName: name
                })

                //update displayName in firestore
                const userRef = doc(db, 'users', auth.currentUser.uid)
                await updateDoc(userRef, {
                    name: name
                })
            }
        } catch (error) {
            toast.error('Could Not Update Profile Details')
        }
    }

    const onChange = (e) => {
        setFormData(prevState => (
            {
                ...prevState,
                [e.target.id]: e.target.value
            }
        ))
    }

    return (
        <div className='profile'>
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type='button' onClick={onLogout} className="logOut">Logout</button>
            </header>

            <main>
                <div className="profileDetailsHeader">
                    <p className="profileDetailsText">Personal Details</p>
                    <p className="changePersonalDetails" onClick={() => {
                        changeDetails && onSubmit()
                        setChangeDetails(prevState => !prevState)
                    }
                    }>
                        {changeDetails ? 'done' : 'change'}
                    </p>
                </div>
                <div className="profileCard">
                    <form>
                        <input
                            type="text"
                            id="name"
                            disabled={!changeDetails}
                            value={name}
                            onChange={onChange}
                            className={!changeDetails ? 'profileName' : 'profileNameActive'} />
                        <input
                            type="email"
                            id="email"
                            disabled={!changeDetails}
                            value={email}
                            onChange={onChange}
                            className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} />
                    </form>
                </div>
            </main >
        </div >
    )
}

export default Profile;