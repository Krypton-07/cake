/* eslint-disable react/prop-types */
import Styles from './card.module.css';
import { useState } from 'react';
import { UseContext } from '../../contexts/context';
import { useNavigate, useLocation } from 'react-router-dom';

const Card = ({ img, name, price, id }) => {
	const [isPopDelActive, setIsPopDelActive] = useState(false);
	const [isImageLoading, setIsImageLoading] = useState(true);

	const { user, deleteCard, addCart, deleteCartCard } = UseContext();
	const navigate = useNavigate();
	const location = useLocation();
	const isAdmin = user?.role === 'admin';
	const isInCartPage = location.pathname === `/cart/${user?._id}`;

	const handleDelete = async () => {
		try {
			if (isInCartPage) {
				await deleteCartCard(user?._id, id).then(() => {
					window.location.reload();
				});
			} else if (isAdmin) {
				await deleteCard(id).then(() => {
					window.location.reload();
				});
			}
			setIsPopDelActive(false);
		} catch (error) {
			console.error('Error deleting card:', error);
		}
	};

	const handleAddCart = async () => {
		try {
			await addCart(user?._id, id);
		} catch (error) {
			console.error('Error adding item to cart:', error);
		}
	};

	return (
		<>
			<div className={Styles.card}>
				<img
					src={img}
					alt="Card Image"
					onClick={() => navigate(`/card/order/${id}`)}
					onLoad={() => setIsImageLoading(false)}
					onError={() => setIsImageLoading(false)}
					style={{ display: isImageLoading ? 'none' : 'block' }}
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
						<i
							className={`fas ${
								isInCartPage ? 'fa-trash-alt' : 'fa-bookmark'
							}`}
						></i>
					</button>
				)}
			</div>

			{isPopDelActive && (
				<div className={Styles.popupOverlay}>
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
								className="confirm-btn"
								onClick={handleDelete}
							>
								Yes, Delete
							</button>
							<button
								className="cancel-btn"
								onClick={() => setIsPopDelActive(false)}
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

export default Card;
