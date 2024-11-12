import { useNavigate, useParams } from 'react-router-dom';
import cakeImage from '../../assets/cake.jpg';
import Styles from './order.module.css';
import { useEffect, useState } from 'react';
import { UseContext } from '../../contexts/context';

const Order = () => {
	const [cardData, setCardData] = useState([]);
	const [location, setLocation] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [quantity, setQuantity] = useState(1);
	const [total, setTotal] = useState('');
	const [loading, setLoading] = useState(false);

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
		setTotal(cardData.price * quantity || cardData.price);
	}, [id, cardsData, cardData.price, quantity]);

	const handleOrder = async () => {
		if (!isAuthenticated) {
			return navigate('/signin');
		}

		setLoading(true);
		await placeOrder(
			user?.username,
			cardData?.imageUrl,
			cardData?.name,
			user?.email,
			location,
			phoneNumber,
			quantity,
			total
		);
		setLocation('');
		setPhoneNumber('');
		setLoading(false);
	};

	return (
		<main className={Styles.orderContainer}>
			<div className={Styles.cardDetailContainer}>
				<img
					src={cardData?.imageUrl || cakeImage}
					className={Styles.cakeImage}
					alt="Cake"
				/>
				<div className={Styles.cakeDetails}>
					<h1 className={Styles.cakeTitle}>{cardData.name}</h1>
					<p className={Styles.cakeDescription}>
						{cardData.description}
					</p>
					<h3 className={Styles.cakePrice}>Price: {total} BDT</h3>
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
					placeholder="e.g., 01XXXXXXXXX"
					maxLength="11"
					pattern="01\d{9}"
				/>

				<div className={Styles.pricing}>
					<div className={Styles.quantity}>
						<i
							className={`fas fa-minus ${Styles.faPlusMinus}`}
							onClick={() =>
								setQuantity(Math.max(1, quantity - 1))
							}
						></i>
						<p>{quantity}</p>
						<i
							className={`fas fa-plus ${Styles.faPlusMinus}`}
							onClick={() => setQuantity(quantity + 1)}
						></i>
					</div>
					<div className={Styles.cod}>
						<h4 className={Styles.codTxt}>Cash On Delivery</h4>
						<h6 className={Styles.codSubTxt}>
							Delivery fee not included; pay courier on arrival
						</h6>
					</div>
				</div>
				<button
					className={Styles.orderButton}
					onClick={handleOrder}
					disabled={loading}
				>
					{loading ? 'Placing Order...' : 'Order Now'}
				</button>
			</div>
		</main>
	);
};

export default Order;
