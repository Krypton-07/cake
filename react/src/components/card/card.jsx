import Styles from './card.module.css';
import { useState } from 'react';
import { UseContext } from '../../contexts/context';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const Card = ({ img, name, price, id }) => {
	const [isPopDelActive, setIsPopDelActive] = useState(false);
	const [isImageLoading, setIsImageLoading] = useState(true);

	const { user, deleteCard, addCart, deleteCartCard, getCards, getCart } =
		UseContext();
	const navigate = useNavigate();
	const location = useLocation();
	const isAdmin = user?.role === 'admin';
	const isInCartPage = location.pathname === `/cart/${user?._id}`;

	const handleDelete = async () => {
		try {
			if (isInCartPage) {
				await deleteCartCard(user?._id, id);
				getCart();
			} else if (isAdmin) {
				await deleteCard(id);
				getCards();
			}
			setIsPopDelActive(false);
		} catch (error) {
			console.error('Error deleting card:', error);
			alert('Something went wrong while deleting the card!');
		}
	};

	const handleAddCart = async () => {
		try {
			await addCart(user?._id, id);
		} catch (error) {
			console.error('Error adding item to cart:', error);
		}
	};

	const buttonIconClass = isInCartPage ? 'fa-trash-alt' : 'fa-bookmark';

	return (
		<>
			<div className={Styles.card}>
				<img
					src={img}
					alt="Card Image"
					className={
						isImageLoading
							? Styles.imageLoading
							: Styles.imageLoaded
					}
					onClick={() => navigate(`/card/order/${id}`)}
					onLoad={() => setIsImageLoading(false)}
					onError={() => setIsImageLoading(false)}
				/>
				<div className={Styles.cardBody}>
					<h1>{name}</h1>
					<h3>Price: {price} BDT</h3>
				</div>
				{isAdmin ? (
					<button
						className={Styles.trashBtn}
						aria-label="Delete Card"
						onClick={() => setIsPopDelActive(true)}
					>
						<i className="fas fa-trash-alt"></i>
					</button>
				) : (
					<button
						className={
							isInCartPage ? Styles.trashBtn : Styles.bookmarkBtn
						}
						aria-label={isInCartPage ? 'Delete Card' : 'Bookmark'}
						onClick={isInCartPage ? handleDelete : handleAddCart}
					>
						<i className={`fas ${buttonIconClass}`}></i>
					</button>
				)}
			</div>

			{isPopDelActive && (
				<div className={Styles.popupOverlay} aria-live="assertive">
					<div className={Styles.popupContent}>
						<img
							src={img}
							alt="Cake"
							className={Styles.popupCakeImg}
						/>
						<h2 className={Styles.popupTitle}>Are you sure?</h2>
						<p className={Styles.popupMessage}>
							This delicious cake will be gone forever!
						</p>
						<div className={Styles.popupButtons}>
							<button
								className={Styles.confirmBtn}
								onClick={handleDelete}
								aria-label="Confirm Deletion"
							>
								Yes, Delete
							</button>
							<button
								className={Styles.cancelBtn}
								onClick={() => setIsPopDelActive(false)}
								aria-label="Cancel Deletion"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

Card.propTypes = {
	img: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	id: PropTypes.string.isRequired,
};

export default Card;
