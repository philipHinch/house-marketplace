//hooks
import { useState, useEffect } from "react";
//router
import { Link, useNavigate, useParams } from 'react-router-dom';
//firebase
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
//componets
import Spinner from '../components/Spinner';
//icons
import shareIcon from '../assets/svg/shareIcon.svg';


const Listing = () => {

    const [listing, setListing] = useState(null)
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const navigate = useNavigate()
    const params = useParams()
    const auth = getAuth()

    //get listing on page load. in order to use async we need to create a function inside useeffect and then call that function
    useEffect(() => {
        const fetchListing = async () => {
            const docRef = doc(db, "listings", params.listingId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(docSnap.data());
                setListing(docSnap.data())
                setLoading(false)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                setLoading(false)
            }
        }

        fetchListing()

    }, [navigate, params.listingId])

    if (loading) {
        return <Spinner />
    }

    return (
        <main>
            {/* {SLIDER} */}

            <div className="shareIconDiv" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                setShareLinkCopied(true)
                setTimeout(() => {
                    setShareLinkCopied(false)
                }, 2000)
            }}>
                <img src={shareIcon} alt="share icon" />
            </div>
            {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

            <div className="listingDetails">
                <p className="listingName">{listing.name} - ${listing.offer
                    ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>
                <p className="listingLocation">
                    {listing.location}
                </p>
                <p className="listingType">For {listing.type === 'rent' ? 'Rent' : 'Sale'}</p>
                {listing.offer && (
                    <p className="discountPrice">${listing.regularPrice - listing.discountedPrice} discount</p>
                )}
                <ul className="listingDetailsList">
                    <li>
                        {listing.bedrooms > 1 ? `${ listing.bedrooms } Bedrooms` : `${ listing.bedrooms } Bedroom`}
                    </li>
                    <li>
                        {listing.bathrooms > 1 ? `${ listing.bathrooms } Bathrooms` : `${ listing.bathrooms } Bathroom`}
                    </li>
                    <li>{listing.parking && 'Parking Spot'}</li>
                    <li>{listing.furnished && 'Furnished'}</li>
                </ul>

                <p className="listingLocationTitle">Location</p>

                {/* {MAP} */}

                {auth.currentUser?.uid !== listing.userRef && (
                    <Link to={`/contact/${ listing.userRef }?listingName=${ listing.name }`} className="primaryButton">Contact Landlord</Link>
                )}
            </div>

        </main>
    );
}

export default Listing;