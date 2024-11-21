/* eslint-disable react/prop-types */
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from 'react';

const BASE_URL = 'http://localhost:8080';
const Context = createContext();
export const UseContext = () => useContext(Context);

export const ContextProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [cardsData, setCardsData] = useState([]);
	const [cartCards, setCartCards] = useState([]);
	const [orderData, setOrderData] = useState([]);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const navigate = useNavigate();

	window.addEventListener('beforeunload', () => {
		setLoading(true);
	});

	window.addEventListener('unload', () => {
		setLoading(false);
	});

	window.oncontextmenu = e => {
		if (user?.role !== 'admin') {
			e.preventDefault();
		}
	};

	const signup = async (username, email, password, otp) => {
		try {
			setLoading(true);
			const response = await axios.post(`${BASE_URL}/signup`, {
				username,
				email,
				password,
				otp,
			});
			setLoading(false);
			if (response.status === 201) {
				navigate('/signin');
				toast.success('Registration successful');
			} else if (response.status === 200) {
				toast.success('OTP Sent');
			}
		} catch (e) {
			setLoading(false);
			if (e.status === 415) {
				toast.error('Invalid or expired OTP');
			} else if (e.status === 409) {
				toast.error('User already exists. Please SignIn!');
				navigate('/signin');
			}
			setIsAuthenticated(false);
		}
	};

	const signin = async (email, password) => {
		try {
			setLoading(true);
			const response = await axios.post(
				`${BASE_URL}/signin`,
				{ email, password },
				{ withCredentials: true }
			);
			setLoading(false);
			if (response.status === 200) {
				setIsAuthenticated(true);
				setUser(response.data.user);
				toast.success('Logged In');
			} else {
				toast.error('Invalid Credentials');
				setIsAuthenticated(false);
			}
		} catch (error) {
			setLoading(false);
			if (error.response?.status === 401) {
				toast.error('Invalid Credentials');
			}
		}
	};

	useEffect(() => {
		const checkAuth = async () => {
			try {
				await axios
					.get(`${BASE_URL}/checkauth`, {
						withCredentials: true,
					})
					.then(e => {
						if (e.status === 200) {
							setIsAuthenticated(true);
							setUser(e.data.user);
						} else if (e.status === 401) {
							setIsAuthenticated(false);
							setUser(null);
						}
					});
			} catch {
				setIsAuthenticated(false);
				setUser(null);
			}
		};

		checkAuth();
	}, []);

	const logOut = async () => {
		try {
			await axios
				.post(
					`${BASE_URL}/logout`,
					{},
					{
						withCredentials: true,
					}
				)
				.then(() => {
					setIsAuthenticated(false);
					setUser(null);
					toast.success('Successfully logged out');
				});
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const addCard = async formData => {
		try {
			setLoading(true);
			await axios
				.post(`${BASE_URL}/addcard`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				})
				.then(() => {
					setLoading(false);
					toast.success('Card added successfully');
					getCards();
				});
		} catch (error) {
			setLoading(false);
			toast.error('Failed to add card');
			console.error(error);
		}
	};

	const getCards = async () => {
		try {
			setLoading(true);
			await axios
				.get(`${BASE_URL}/cardsData`, {
					withCredentials: true,
				})
				.then(e => {
					const shuffledData = e.data.cards.sort(
						() => Math.random() - 0.5
					);
					setCardsData(shuffledData);
					setLoading(false);
				});
		} catch (error) {
			setLoading(false);
			toast.error('Failed to get cards');
			console.log(error);
		}
	};

	useEffect(() => {
		getCards();
	}, []);

	const deleteCard = async id => {
		try {
			setLoading(true);
			await axios.delete(`${BASE_URL}/deleteCard/${id}`).then(() => {
				setLoading(false);
				toast.success('Card deleted successfully');
				getCards();
			});
		} catch {
			setLoading(false);
			toast.error('Failed to delete card');
		}
	};

	const placeOrder = async (
		userId,
		name,
		img,
		cakeName,
		id,
		email,
		location,
		phoneNumber,
		quantity,
		total
	) => {
		try {
			setLoading(true);

			if (
				!location ||
				!phoneNumber ||
				!phoneNumber.startsWith('01') ||
				phoneNumber.length !== 11
			) {
				toast.error('Please fill in all fields correctly');
				setLoading(false);
				return;
			}

			const response = await axios.post(`${BASE_URL}/placeOrder`, {
				userId,
				name,
				img,
				cakeName,
				id,
				email,
				location,
				phoneNumber,
				quantity,
				total,
			});

			setLoading(false);

			if (response.status === 200) {
				toast.success('Order placed successfully');
			} else {
				toast.error('Something went wrong. Please try again.');
			}
		} catch (error) {
			setLoading(false);
			toast.error('Failed to place order');
			console.log(error);
		}
	};

	const getOrderData = async createdBy => {
		try {
			if (!createdBy) throw new Error('User ID is undefined');

			const response = await axios.get(
				`${BASE_URL}/orderData/${createdBy}`
			);
			if (response.status === 200) {
				const orders = response.data.orders.map(order => ({
					products:
						order.ordersData?.reverse()?.map(item => ({
							product_id: item.product_id,
							quantity: item.quantity,
							status: item.status,
							total: item.total,
						})) || [],
				}));

				setOrderData(orders);
				console.log(orders);

				return orders;
			}
		} catch (error) {
			console.error(
				'Error fetching order data:',
				error.response?.data || error.message
			);
		}
	};

	const getOrderDataAdmin = async () => {
		if (user?.role !== 'admin') {
			console.warn('Access denied: User is not an admin');
			return [];
		}

		try {
			const response = await axios.get(`${BASE_URL}/orderData`);
			if (response.status === 200) {
				const orders = response.data.orders.reverse().map(order => ({
					createdBy: order.createdBy,
					products: order.ordersData?.reverse().map(item => ({
						product_id: item.product_id,
						quantity: item.quantity,
						status: item.status,
						total: item.total,
						phoneNumber: item.phoneNumber,
						orderedBy: item.orderedBy,
					})),
				}));

				console.log("Admin's order", orders);
				return orders;
			}
		} catch (error) {
			console.error('Error fetching admin order data:', error);
			toast.error(
				error.response?.data?.message ||
					'Failed to load admin order data'
			);
			return [];
		}
	};

	const handleStatusChange = async (client, orderId, newStatus) => {
		try {
			if (!client || !orderId || !newStatus) {
				toast.error('Invalid client, order ID, or status');
				return;
			}

			setLoading(true);

			console.log('Updating status for:', { client, orderId, newStatus });

			const response = await axios.patch(`${BASE_URL}/set/order/status`, {
				client,
				orderId,
				newStatus,
			});

			if (response.status === 200) {
				toast.success('Order status updated!');
				await getOrderData(client);
				await getOrderDataAdmin();
			} else {
				toast.error('Failed to update order status');
			}
		} catch (error) {
			console.error(
				'Failed to update order status:',
				error.response?.data || error.message
			);
			toast.error(
				error.response?.data?.message || 'Failed to update status'
			);
		} finally {
			setLoading(false);
		}
	};

	const communicate = async (email, subject, msg) => {
		try {
			setLoading(true);
			const response = await axios.post(`${BASE_URL}/communicate`, {
				email,
				subject,
				msg,
			});
			setLoading(false);
			if (response.status === 200) {
				toast.success('Message sent successfully');
			}
		} catch {
			setLoading(false);
			toast.error('Failed to send message');
		}
	};

	const addCart = async (user_id = user?.id, product_id) => {
		try {
			setLoading(true);
			await axios
				.post(`${BASE_URL}/addCart`, {
					user_id,
					product_id,
				})
				.then(e => {
					setLoading(false);
					if (e.status === 200) {
						toast.success('Added to cart');
					}
					getCart(user?.id);
				});
		} catch (e) {
			setLoading(false);
			if (e.status === 409) {
				toast.error('Product already in cart');
			} else {
				toast.error('Failed to add to cart');
			}
			console.error('Error in addCart:', e);
		}
	};

	const getCart = async (createdBy = user?._id) => {
		try {
			if (!createdBy) {
				console.error('Error in getCart: createdBy is undefined');
				toast.error(
					'Unable to load cart data. User is not authenticated.'
				);
				setCartCards([]);
				return;
			}

			setLoading(true);
			await axios.get(`${BASE_URL}/getCart/${createdBy}`).then(e => {
				setLoading(false);

				const cartProducts = e.data.cartProducts || [];
				const matchingCards = cartProducts
					.map(x => {
						const matchedCards = cardsData.find(
							y => y._id.toString() === x.product_id
						);
						return matchedCards;
					})
					.filter(Boolean);

				setCartCards(matchingCards);
			});
		} catch (error) {
			setLoading(false);
			setCartCards([]);
			toast.error('Failed to load cart');
			console.error('Error in getCart:', error);
		}
	};

	const deleteCartCard = async (createdBy, product_id) => {
		try {
			await axios
				.delete(`${BASE_URL}/deleteCart/${createdBy}/${product_id}`)
				.then(e => {
					if (e.status === 200) {
						toast.success('Cart item deleted successfully');
						getCart(user?.id);
					}
				});
		} catch (error) {
			console.error('Error deleting cart item:', error);
			toast.error('Failed to delete cart item');
		}
	};

	return (
		<Context.Provider
			value={{
				signup,
				signin,
				isAuthenticated,
				user,
				logOut,
				loading,
				addCard,
				cardsData,
				deleteCard,
				placeOrder,
				getOrderData,
				orderData,
				communicate,
				addCart,
				getCart,
				cartCards,
				deleteCartCard,
				getOrderDataAdmin,
				handleStatusChange,
			}}
		>
			{children}
			<ToastContainer position="top-left" autoClose={1000} />
			{loading ? (
				<div className="loading-container">
					<div className="loader"></div>
				</div>
			) : null}
		</Context.Provider>
	);
};
