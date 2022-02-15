import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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

function EditReview() {
  const [listing, setListing] = useState(null);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const params = useParams();
  const auth = getAuth();
  const navigate = useNavigate();

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
  }, [navigate, params.listingId]);

  useEffect(() => {
    const getReview = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      setReview(
        docSnap.data().reviews.filter((item) => {
          return item.userId == auth.currentUser.uid;
        })[0].review
      );
    };

    getReview();
  }, []);

  const onChange = (e) => {
    setReview(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* delete previus review */
      const docRef = doc(db, 'listings', params.listingId);

      const docSnap = await getDoc(docRef);

      const withOutPreviousReview = docSnap.data().reviews.filter((item) => {
        return item.userId !== auth.currentUser.uid;
      });

      console.log(withOutPreviousReview);

      const d = new Date();
      const Date1 = `${d.getDay()}/${d.getMonth() + 1}/${d.getFullYear()}`;
      const data = {
        userName: auth.currentUser.displayName,
        userId: auth.currentUser.uid,
        review: review,
        date: Date1,
      };

      const reviews = withOutPreviousReview;
      reviews.push(data);

      //Update in firestore

      await updateDoc(docRef, {
        reviews: reviews,
      });

      toast.success('Review has been edited');
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

export default EditReview;
