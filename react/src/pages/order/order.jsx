import { useNavigate, useParams } from 'react-router-dom';
import cakeImage from '../../assets/cake.jpg';
import Styles from './order.module.css';
import { useEffect, useState } from 'react';
import { UseContext } from '../../contexts/context';

const Order = () => {
	const [cardData, setCardData] = useState({});
	const [location, setLocation] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [isPopDelActive, setIsPopDelActive] = useState(false);
	const [showAlert, setShowAlert] = useState(false);

	const { id } = useParams();
	const { cardsData, user, placeOrder, isAuthenticated } = UseContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (id) {
			const selectedCard = cardsData.find(e => e._id === id);
			if (selectedCard) {
				setCardData(selectedCard);
			}
		}
	}, [id, cardsData, navigate]);

	useEffect(() => {
		if (cardData?.price) {
			setTotal(cardData.price * quantity);
		}
	}, [cardData?.price, quantity]);

	const adjustQuantity = change => {
		setQuantity(prev => Math.max(1, Math.min(prev + change, 10)));
	};

	const handleOrder = async () => {
		if (!isAuthenticated) {
			return navigate('/signin');
		}

		setLoading(true);
		await placeOrder(
			user?._id,
			user?.username,
			cardData?.imageUrl,
			cardData?.name,
			id,
			user?.email,
			location,
			phoneNumber,
			quantity,
			total
		);
		setLocation('');
		setPhoneNumber('');
		setLoading(false);
		setIsPopDelActive(false);
	};

	const handleOrderClick = () => {
		if (location.trim() === '' || phoneNumber.trim() === '') {
			setShowAlert(true);
			setTimeout(() => setShowAlert(false), 3000);
		} else {
			setIsPopDelActive(true);
		}
	};

	return (
		<main className={Styles.orderContainer}>
			<div className={Styles.cardDetailContainer}>
				<img
					src={cardData?.imageUrl || cakeImage}
					className={Styles.cakeImage}
					alt={cardData?.name || 'Default Cake'}
				/>
				<div className={Styles.cakeDetails}>
					<h1 className={Styles.cakeTitle}>{cardData?.name}</h1>
					<p className={Styles.cakeDescription}>
						{cardData?.description}
					</p>
					<h3 className={Styles.cakePrice}>
						Price: <span>{total}</span> BDT
					</h3>
				</div>
			</div>
			<div className={Styles.orderDetail}>
				<h3 className={Styles.orderTitle}>To Order...</h3>
				<div className={Styles.location}>
					<textarea
						className={Styles.locationTextArea}
						placeholder="Enter your location..."
						value={location}
						onChange={e => setLocation(e.target.value)}
						required
					/>
				</div>
				<input
					type="text"
					className={Styles.numberInput}
					value={phoneNumber}
					onChange={e => {
						const value = e.target.value;
						if (/^\d*$/.test(value)) {
							setPhoneNumber(value);
						}
					}}
					placeholder="e.g., +8801XXXXXXXXX"
					maxLength="11"
				/>
				<div className={Styles.pricing}>
					<div className={Styles.quantity}>
						<i
							className={`fas fa-minus ${Styles.faPlusMinus}`}
							onClick={() => adjustQuantity(-1)}
						></i>
						<p>{quantity}</p>
						<i
							className={`fas fa-plus ${Styles.faPlusMinus}`}
							onClick={() => adjustQuantity(1)}
						></i>
					</div>
					<div className={Styles.cod}>
						<h4 className={Styles.codTxt}>Cash On Delivery</h4>
						<h6 className={Styles.codSubTxt}>
							Delivery charge isn&apos;t included.
						</h6>
					</div>
				</div>
				<button
					className={Styles.orderButton}
					onClick={handleOrderClick}
					disabled={loading}
				>
					{loading ? 'Placing Order...' : 'Order Now'}
				</button>
				{showAlert && (
					<div className={Styles.alertBox}>
						<p>Please fill out all the required fields!</p>
					</div>
				)}
			</div>

			{isPopDelActive && (
				<div
					className={Styles.popupOverlay}
					aria-live="assertive"
					onKeyDown={e => {
						if (e.key === 'Escape') setIsPopDelActive(false);
					}}
				>
					<div className={Styles.popupContent}>
						<img
							src={cardData?.imageUrl || cakeImage}
							alt={cardData?.name || 'Default Cake'}
							className={Styles.popupCakeImg}
						/>
						<h2 className={Styles.popupTitle}>
							Are you sure to order?
						</h2>
						<p className={Styles.rules}>
							<p>Order implies agreeing terms:</p>
							<hr />
							<ul>
								<li>No return policy.</li>
								<li>Orders cannot be cancelled.</li>
								<li>Delivery charges are not included.</li>
							</ul>
						</p>
						<div className={Styles.popupButtons}>
							<button
								className={Styles.confirmBtn}
								onClick={handleOrder}
								aria-label="Confirm Order"
							>
								<i
									className="fas fa-check-circle"
									style={{ marginRight: '8px' }}
								></i>
								Yes, Place Order
							</button>
							<button
								className={Styles.cancelBtn}
								onClick={() => setIsPopDelActive(false)}
								aria-label="Cancel Order"
							>
								<i
									className="fas fa-times-circle"
									style={{ marginRight: '8px' }}
								></i>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
};

export default Order;
