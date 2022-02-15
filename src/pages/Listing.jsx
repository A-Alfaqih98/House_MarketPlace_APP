import { Firestore } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import ReviewItem from '../components/ReviewItem';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import shareICon from '../assets/svg/shareIcon.svg';
import { toast } from 'react-toastify';
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
      }
    };
    fetchListing();
  }, [navigate, params.listingId, listing]);

  if (loading) {
    return <Spinner />;
  }

  /* onReviewClick Function */
  const onReviewClick = () => {
    // Check if the person already has a review for the propertey
    for (let i = 0; i < listing.reviews.length; i++) {
      if (listing.reviews[i].userId === auth.currentUser.uid) {
        toast.warning('You have already reviewed this house');
        return;
      }
    }

    /* Navigate to review page */
    navigate(`/review/${params.listingId}`);
  };

  /* Delete review */
  const onDelete = async () => {
    if (window.confirm('Are you sure you want to delete your review')) {
      try {
        const docRef = doc(db, 'listings', params.listingId);
        const docSnap = await getDoc(docRef);

        // create the updated review array
        const reviews = listing.reviews;
        const updatedReviews = reviews.filter((item) => {
          return item.userId !== auth.currentUser.uid;
        });

        /*  update the doc by removing the deleteing review */
        await updateDoc(docRef, {
          reviews: updatedReviews,
        });
        setListing(docSnap.data());
        toast.success('Your review has been deleted');
      } catch (error) {
        toast.error("Couldn't delete this review");
      }
    }
  };

  /* Edit Review Function */
  const onEdit = () => {
    navigate(`../../edit-review/${params.listingId}/${auth.currentUser.uid}`);
  };

  return (
    <main>
      <Swiper slideperview={1} pagination={{ clickable: true }}>
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: 'cover',
              }}
              className="swiperSlideDiv"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        on
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareICon} alt="sharIcon" />
      </div>
      {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}
      <div className="listingDetails">
        <p className="listingName">
          {listing.name} - {''}$
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}

        <ul className="listingDetailsList">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : '1 Bathroom'}
          </li>
          <li>{listing.parking && 'Parking spot'}</li>
          <li>{listing.furnished && 'Furnished'}</li>

          <p className="listingLocationTitle">Location</p>

          <div className="leafletContainer">
            <MapContainer
              style={{ height: '100%', width: '100%' }}
              center={[listing.geolocation.lat, listing.geolocation.lng]}
              zoom={13}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
              />

              <Marker
                position={[listing.geolocation.lat, listing.geolocation.lng]}
              >
                <Popup>{listing.location}</Popup>
              </Marker>
            </MapContainer>
          </div>

          {auth.currentUser?.uid !== listing.userRef && [
            <Link
              to={`/contact/${listing.userRef}?listingName=${listing.name}`}
              className="primaryButton"
            >
              Contact Landlord
            </Link>,
            <button
              className="primaryButton secondaryButton"
              onClick={onReviewClick}
            >
              Write A Review
            </button>,
          ]}
        </ul>
      </div>
      {listing.reviews && (
        <div className="reviews">
          <p className="listingLocationTitle">Reviews</p>
          {listing.reviews.map((item) => {
            if (item.userId == auth.currentUser.uid) {
              return (
                <ReviewItem
                  name={item.userName}
                  review={item.review}
                  edit={true}
                  userId={item.uesrId}
                  date={item.date}
                  onDelete={onDelete}
                  onEdit={() => {
                    onEdit(item.uesrId);
                  }}
                />
              );
            }
          })}
          {listing.reviews.map((item, index) => {
            if (item.userId !== auth.currentUser.uid) {
              return (
                <ReviewItem
                  key={index}
                  name={item.userName}
                  review={item.review}
                  param={params.listingId}
                />
              );
            }
          })}
        </div>
      )}
    </main>
  );
}

export default Listing;
