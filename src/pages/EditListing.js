//hooks
import { useState, useEffect, useRef } from "react";
//router
import { useNavigate, useParams } from "react-router-dom";
//firebase
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from '../firebase.config';
//uuid - unique id generator package
import { v4 as uuidv4 } from 'uuid';
//components
import Spinner from '../components/Spinner';
//toast
import { toast } from 'react-toastify';


const EditListing = () => {

    const auth = getAuth()
    const navigate = useNavigate()
    const params = useParams()
    //to avoid memory leak error
    const isMounted = useRef(true)

    const [loading, setLoading] = useState(false)
    const [listing, setListing] = useState(null)
    //if true then we are using firebase geolocation coordinates, if false then we enter longitude + latitude manually
    const [geolocationEnabled, setGeolocationEnabled] = useState(true)
    //listing data
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0
    })

    //get destructured data from formData state
    const { type, name, bedrooms, bathrooms, parking, furnished, address, offer, regularPrice, discountedPrice, images, latitude, longitude } = formData

    //redirect if listing does not belong to user
    useEffect(() => {
        if (listing && listing.userRef !== auth.currentUser.uid) {
            toast.error('You cannot edit that listing')
            navigate('/')
        }
    }, [])

    //fetch the listing to edit 
    useEffect(() => {
        setLoading(true)
        const fetchListing = async () => {
            const docRef = doc(db, 'listings', params.listingId)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setListing(docSnap.data())
                setFormData({
                    ...docSnap.data(),
                    address: docSnap.data().location
                })
                setLoading(false)
            } else {
                setLoading(false)
                navigate('/')
                toast.error('Listing does not exist')
            }
        }
        fetchListing()
    }, [params.listingId, navigate])

    //sets userRef to loggedin user
    useEffect(() => {
        //isMounted is to avoid memory leak error
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({
                        ...formData,
                        userRef: user.uid
                    })
                } else {
                    navigate('/signin')
                }
            })
        }
        return () => {
            //to avoid memory leak error
            isMounted.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted])

    //send data to firebase
    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        //validate prices
        if (discountedPrice >= regularPrice) {
            setLoading(false)
            toast.error('Discounted price needs to be less than regular price')
            return
        }
        //set max 6 images
        if (images.length > 6) {
            setLoading(false)
            toast.error('Max 6 images')
            return
        }

        let geolocation = {}
        let location

        //if geolocation is enabled, use google api else use the form input values for lat and lng
        if (geolocationEnabled) {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${ address }&key=${ process.env.REACT_APP_GEOCODE_API_KEY }`)
            const data = await response.json()
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0
            location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0]?.formatted_address
            //check if location is undefined
            if (location === undefined || location.includes('undefined')) {
                setLoading(false)
                toast.error('Please enter a valid address')
                return
            }
        } else {
            geolocation.lat = latitude
            geolocation.lng = longitude
            location = address
        }

        //store image in firebase & get the download URL ---> https://firebase.google.com/docs/storage/web/upload-files
        const storeImage = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage()
                const fileName = `${ auth.currentUser.uid }-${ image.name }-${ uuidv4() }`
                const storageRef = ref(storage, 'images/' + fileName)
                const uploadTask = uploadBytesResumable(storageRef, image);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        reject(error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );

            })
        }

        //call storeImage for all images
        const imgUrls = await Promise.all(
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false)
            toast.error('Images not uploaded')
            return
        })

        //create copy of formData and add extra values
        const formDataCopy = {
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp()
        }

        formDataCopy.location = address
        //delete images from formDataCopy since we added imgUrls above
        delete formDataCopy.images
        //delete address fromm formDataCopy 
        delete formDataCopy.address
        //if there is no offer (if offer is false), delete discountedPice from formDataCopy
        !formDataCopy.offer && delete formDataCopy.discountedPrice

        //add edited doc to firebase
        const docRef = doc(db, 'listings', params.listingId)
        await updateDoc(docRef, formDataCopy)
        toast.success('Listing saved')
        navigate(`/category/${ formDataCopy.type }/${ docRef.id }`)
    }

    //this handles all the input changes
    const onMutate = (e) => {

        //booleans
        //transform the string boolean value from the form to an actual boolean
        let boolean = null
        if (e.target.value === 'true') {
            boolean = true
        }
        if (e.target.value === 'false') {
            boolean = false
        }

        //files
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files,
            }))
        }

        //text, numbers, booleans
        if (!e.target.files) {
            setFormData((prevState => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value
                //the input ids in jsx match the formData keys
            })))
        }
    }

    if (loading) {
        return <Spinner />
    }

    return (
        <div className='profile'>
            <header>
                <p className='pageHeader'>Edit Listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className='formLabel'>Sell / Rent</label>
                    <div className='formButtons'>
                        <button
                            type='button'
                            className={type === 'sale' ? 'formButtonActive' : 'formButton'}
                            id='type'
                            value='sale'
                            onClick={onMutate}
                        >
                            Sell
                        </button>
                        <button
                            type='button'
                            className={type === 'rent' ? 'formButtonActive' : 'formButton'}
                            id='type'
                            value='rent'
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>

                    <label className='formLabel'>Name</label>
                    <input
                        className='formInputName'
                        type='text'
                        id='name'
                        value={name}
                        onChange={onMutate}
                        maxLength='32'
                        minLength='10'
                        required
                    />

                    <div className='formRooms flex'>
                        <div>
                            <label className='formLabel'>Bedrooms</label>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='bedrooms'
                                value={bedrooms}
                                onChange={onMutate}
                                min='1'
                                max='50'
                                required
                            />
                        </div>
                        <div>
                            <label className='formLabel'>Bathrooms</label>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='bathrooms'
                                value={bathrooms}
                                onChange={onMutate}
                                min='1'
                                max='50'
                                required
                            />
                        </div>
                    </div>

                    <label className='formLabel'>Parking spot</label>
                    <div className='formButtons'>
                        <button
                            className={parking ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='parking'
                            value={true}
                            onClick={onMutate}
                            min='1'
                            max='50'
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !parking && parking !== null ? 'formButtonActive' : 'formButton'
                            }
                            type='button'
                            id='parking'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className='formLabel'>Furnished</label>
                    <div className='formButtons'>
                        <button
                            className={furnished ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='furnished'
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !furnished && furnished !== null
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            type='button'
                            id='furnished'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className='formLabel'>Address</label>
                    <textarea
                        className='formInputAddress'
                        type='text'
                        id='address'
                        value={address}
                        onChange={onMutate}
                        required
                    />

                    {!geolocationEnabled && (
                        <div className='formLatLng flex'>
                            <div>
                                <label className='formLabel'>Latitude</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='latitude'
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className='formLabel'>Longitude</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='longitude'
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className='formLabel'>Offer</label>
                    <div className='formButtons'>
                        <button
                            className={offer ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='offer'
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !offer && offer !== null ? 'formButtonActive' : 'formButton'
                            }
                            type='button'
                            id='offer'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className='formLabel'>Regular Price</label>
                    <div className='formPriceDiv'>
                        <input
                            className='formInputSmall'
                            type='number'
                            id='regularPrice'
                            value={regularPrice}
                            onChange={onMutate}
                            min='50'
                            max='750000000'
                            required
                        />
                        {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
                    </div>

                    {offer && (
                        <>
                            <label className='formLabel'>Discounted Price</label>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='discountedPrice'
                                value={discountedPrice}
                                onChange={onMutate}
                                min='50'
                                max='750000000'
                                required={offer}
                            />
                        </>
                    )}

                    <label className='formLabel'>Images</label>
                    <p className='imagesInfo'>
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        className='formInputFile'
                        type='file'
                        id='images'
                        onChange={onMutate}
                        max='6'
                        accept='.jpg,.png,.jpeg'
                        multiple
                        required
                    />
                    <button type='submit' className='primaryButton createListingButton'>
                        Edit Listing
                    </button>
                </form>
            </main>
        </div>
    );
}

export default EditListing;