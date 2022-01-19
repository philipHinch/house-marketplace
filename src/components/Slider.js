//components
import Spinner from "./Spinner";
//hooks
import { useState, useEffect } from "react";
//router
import { useNavigate } from "react-router-dom";
//firebase
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from '../firebase.config';
//swiper
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { list } from "firebase/storage";
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]) //this enables modules for swiper ---> https://swiperjs.com/react



const Slider = () => {

    const [loading, setLoading] = useState(true)
    const [listings, setListings] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchListings = async () => {
            const listingsRef = collection(db, 'listings')
            const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
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
        }

        fetchListings()
    }, [])

    if (loading) {
        return <Spinner />
    }

    return (
        listings && (
            <>
                <p className="exploreHeading">Recomended-</p>

                <Swiper slidesPerView={1} pagination={{ clickable: true }}>
                    {listings.map(({ data, id }) => (
                        <SwiperSlide key={id} onClick={() => navigate(`/category/${ data.type }/${ id }`)}>
                            <div className="swiperSlideDiv" style={{ background: `url(${ data.imgUrls[0] }) center no-repeat`, backgroundSize: 'cover' }}>
                                <p className="swiperSlideText">{data.name}</p>
                                <p className="swiperSlidePrice">
                                    ${data.discountedPrice ?? data.regularPrice}
                                    {' '}
                                    {data.type === 'rent' && '/ month'}
                                </p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </>
        )
    );
}

export default Slider;