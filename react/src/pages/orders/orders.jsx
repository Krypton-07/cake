/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Styles from './orders.module.css';
import { UseContext } from '../../contexts/context';
import hourGlass from '../../assets/hourglass.gif';
import delivered from '../../assets/shipped.png';
import shipped from '../../assets/delivered.gif';

const Orders = () => {
	const { id } = useParams();
	const {
		user,
		getOrderData,
		getOrderDataAdmin,
		handleStatusChange,
		cardsData,
	} = UseContext();
	const [orders, setOrders] = useState([]);

	const resolveOrders = data =>
		data.map(order => ({
			...order,
			products: order.products.map(product => {
				const card =
					cardsData.find(card => card._id === product.product_id) ||
					{};
				return {
					...product,
					client: order.createdBy,
					productName: card.name || 'Unknown Product',
					image: card.imageUrl || hourGlass,
				};
			}),
		}));

	useEffect(() => {
		(user?.role === 'admin' ? getOrderDataAdmin() : getOrderData(id))
			.then(data => setOrders(resolveOrders(data || [])))
			.catch(console.error);
	}, [id, user]);

	const renderOrderItem = product => (
		<div key={product.product_id} className={Styles.orderItem}>
			<img
				src={product.image}
				alt={product.productName}
				className={Styles.cakeImage}
			/>
			<div className={Styles.orderInfo}>
				{user?.role === 'admin' ? (
					<h3>
						{product.productName} × {product.quantity}
					</h3>
				) : (
					<>
						<h3>{product.productName}</h3>
						<p>
							<strong>Quantity:</strong> {product.quantity}
						</p>
					</>
				)}
				<p>
					<strong>Total:</strong> Tk. <u>{product.total}</u>
				</p>
				{user?.role === 'admin' ? (
					<>
						<p>
							<strong>OrderedBy:</strong> {product.orderedBy}
						</p>
						<p>
							<strong>Phone Number:</strong> {product.phoneNumber}
						</p>
					</>
				) : null}
			</div>
			<div className={Styles.orderStatus}>
				<strong>Status:</strong>
				<div className={Styles.statusImageContainer}>
					{user?.role === 'admin' ? (
						<select
							className={Styles.statusDropdown}
							value={product.status}
							onChange={e =>
								handleStatusChange(
									product.client,
									product.product_id,
									e.target.value
								)
							}
						>
							<option value="Processing">Processing</option>
							<option value="Shipped">Shipped</option>
							<option value="Delivered">Delivered</option>
						</select>
					) : (
						<p>{product.status}</p>
					)}
					<img
						src={
							product.status === 'Processing'
								? hourGlass
								: product.status === 'Delivered'
								? delivered
								: shipped
						}
						alt={product.status}
						className={
							product.status === 'Shipped'
								? Styles.shippedImage
								: Styles.statusImage
						}
					/>
				</div>
			</div>
		</div>
	);

	return (
		<main className={Styles.orderContainer}>
			<h1>
				{user?.role === 'admin'
					? '📦 All Orders 📦'
					: '🍰 Track Your Order 🍰'}
			</h1>
			<div className={Styles.userOrderContainer}>
				{orders.map((order, index) => (
					<div key={index} className={Styles.cardsWrapper}>
						{order.products.map(renderOrderItem)}
					</div>
				))}
			</div>
		</main>
	);
};

export default Orders;
