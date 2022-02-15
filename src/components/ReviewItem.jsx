import { ReactComponent as EditICon } from '../assets/svg/editIcon.svg';
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg';
import { getAuth } from 'firebase/auth';
function ReviewItem({ name, review, userId, onDelete, onEdit, date }) {
  return (
    <div className="reviewContainer">
      <div className="reviewText">
        <p className="reviewName">
          {name} <p className="date">{date}</p>
        </p>
        <p className="review">{review}</p>
      </div>

      {/* Allow edit and delete if the review belong to the user */}
      {onDelete && (
        <DeleteIcon
          className="removeIconReview"
          fill="rgb(231, 76, 60)"
          onClick={onDelete}
        />
      )}

      {onEdit && (
        <EditICon className="editIconReview" onClick={() => onEdit(userId)} />
      )}
    </div>
  );
}

export default ReviewItem;
