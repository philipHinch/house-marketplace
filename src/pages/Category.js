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
    const [lastFetchedListing, setLastFetchedListing] = useState(null)

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

                //get last listing in databse
                const lastVisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchedListing(lastVisible)


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
    }, [params.categoryName])

    //pagination load more
    const onFetchMoreListings = async () => {
        try {
            //get reference
            const listingsRef = collection(db, 'listings')

            //create query
            const q = query(listingsRef,
                where('type', '==', params.categoryName),
                orderBy('timestamp', 'desc'),
                startAfter(lastFetchedListing),
                limit(10)
            )

            //execute query
            const querySnap = await getDocs(q)

            //get last listing in databse
            const lastVisible = querySnap.docs[querySnap.docs.length - 1]
            setLastFetchedListing(lastVisible)


            const listings = []

            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })

            setListings((prevState) => [...prevState, ...listings])
            setLoading(false)

        } catch (error) {
            toast.error('Could not fetch listings')
        }
    }

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

                    <br />
                    <br />

                    {lastFetchedListing && (
                        <p className="loadMore" onClick={onFetchMoreListings}>Load More</p>
                    )}
                </>
                : <p>No Listings for {params.categoryName}</p>}
        </div>
    );
}

export default Category;