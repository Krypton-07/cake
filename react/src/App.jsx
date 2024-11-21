import Home from './pages/home/home';
import Cart from './pages/cart/cart';
import AddCard from './pages/add/add';
import Order from './pages/order/order';
import Footer from './components/footer';
import Signin from './pages/signin/signin';
import Signup from './pages/signup/signup';
import About from './pages/about us/about';
import Contact from './pages/contact/contact';
import Navbar from './components/navbar/navbar';
import { Routes, Route } from 'react-router-dom';
import NotFound from './pages/404/404';
import Orders from './pages/orders/orders';

const App = () => {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/signin" element={<Signin />} />
				<Route path="/add" element={<AddCard />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/card/order/:id" element={<Order />} />
				<Route path="/about" element={<About />} />
				<Route path="/cart/:id" element={<Cart />} />
				<Route path="/orders/:id" element={<Orders />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
			<Footer />
		</>
	);
};

export default App;
