//hooks
import { useEffect, useState } from "react";
//router
import { useParams } from "react-router-dom";
//firebase
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase.config';
//toast
import { toast } from 'react-toastify';
//components
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Category = () => {

    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)

    const params = useParams()

    useEffect(() => {

        const fetchListings = async () => {
            try {
                //get reference
                const listingsRef = collection(db, 'listings')

                //create query
                const q = query(listingsRef,
                    where('type', '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )

                //execute query
                const querySnap = await getDocs(q)

                const listings = []

                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })

                setListings(listings)
                setLoading(false)

            } catch (error) {
                toast.error('Could not fetch listings')
            }
        }

        fetchListings()
    }, [])

    return (
        <div className="category">
            <header>
                <p className="pageHeader">
                    {params.categoryName === 'rent' ? 'Places for Rent' : 'Places for sale'}
                </p>
            </header>

            {loading ? <Spinner /> : listings && listings.length > 0 ?
                <>
                    <main>
                        <ul className="categoryListings">
                            {listings.map((listing) => (
                                <ListingItem listing={listing.data} id={listing.id} key={listing.id} />
                            ))}
                        </ul>
                    </main>
                </>
                : <p>No Listings for {params.categoryName}</p>}
        </div>
    );
}

export default Category;