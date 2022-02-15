import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import {
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase.config';
import { useNavigate, Link, useParams } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import Spinner from '../components/Spinner';

function Review() {
  const [listing, setListing] = useState(null);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setListing(docSnap.data());
        console.log(listing);
        setLoading(false);
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  const onChange = (e) => {
    setReview(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const d = new Date();
      const Date1 = `${d.getDay()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      const data = {
        userName: auth.currentUser.displayName,
        userId: auth.currentUser.uid,
        review: review,
        date: Date1,
      };

      const reviews = listing.reviews;
      reviews.push(data);
      console.log(reviews);

      //Update in firestore
      const docRef = doc(db, 'listings', params.listingId);

      await updateDoc(docRef, {
        reviews: reviews,
      });

      toast.success('Review has been submitted');
      navigate(`/category/${listing.type}/${params.listingId}`);
    } catch (error) {
      toast.error('Could not submit review');
      console.log(error);
    }
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <form
      className="messageForm"
      onSubmit={onSubmit}
      style={{ padding: ' 0px 15px' }}
    >
      <p className="pageHeader">Write a review for</p>
      <p className="landlordName">{listing.name}</p>
      <div className="messageDiv">
        <label htmlFor="message" className="messageLabel">
          <textarea
            name="message"
            id="message"
            className="textarea"
            placeholder="Write your review here ..."
            value={review}
            onChange={onChange}
            maxLength={200}
            required
          ></textarea>
        </label>
        <button type="submit" className="primaryButton">
          Submit Review
        </button>
      </div>
    </form>
  );
}

export default Review;
