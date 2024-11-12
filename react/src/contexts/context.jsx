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
		name,
		img,
		cakeName,
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
				name,
				img,
				cakeName,
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

	const addCart = async (user = user?.id, product_id) => {
		try {
			setLoading(true);
			await axios
				.post(`${BASE_URL}/addCart`, {
					user,
					product_id,
				})
				.then(e => {
					setLoading(false);
					if (e.status === 200) {
						toast.success('Added to cart');
					}
					getCart();
				});
		} catch (e) {
			setLoading(false);
			toast.error('Failed to add to cart');
			console.error('Error in addCart:', e);
		}
	};

	const getCart = async userId => {
		try {
			setLoading(true);

			const response = await axios.get(`${BASE_URL}/getCart/${userId}`);
			setLoading(false);

			if (response.status === 200) {
				const cartItems = response.data.cart;

				const matchedCards = cartItems
					?.map(item => {
						const matchingCard = cardsData.find(
							card => card._id === item.product_id
						);
						return matchingCard;
					})
					.filter(Boolean);
				setCartCards(matchedCards || []);
			} else {
				setCartCards([]);
				toast.error('Failed to load cart items');
			}
		} catch (error) {
			setLoading(false);
			setCartCards([]);
			toast.error('Failed to load cart');
			console.error('Error in getCart:', error);
		}
	};

	const deleteCartCard = async (userId, id) => {
		try {
			setLoading(true);
			await axios
				.delete(`${BASE_URL}/deleteCart`, {
					id,
					userId,
				})
				.then(e => {
					setLoading(false);
					if (e.status === 200) {
						toast.success('Cart item deleted successfully');
						getCart();
					}
				});
		} catch {
			setLoading(false);
			toast.error('Failed to delete from cart');
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
				communicate,
				addCart,
				getCart,
				cartCards,
				deleteCartCard,
			}}
		>
			{children}
			<ToastContainer position="top-left" autoClose={1000} />F
			{loading ? (
				<div className="loading-container">
					<div className="loader"></div>
				</div>
			) : null}
		</Context.Provider>
	);
};
