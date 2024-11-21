import Styles from './navbar.module.css';
import { useEffect, useState } from 'react';
import { UseContext } from '../../contexts/context';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
	const [isMenuActive, setIsMenuActive] = useState(false);
	const [isBiggerWidth, setIsBiggerWidth] = useState(false);

	const navigate = useNavigate();
	const { isAuthenticated, logOut, user } = UseContext();

	useEffect(() => {
		const handleResize = () => {
			setIsBiggerWidth(window.innerWidth > 768);
			if (window.innerWidth > 768) setIsMenuActive(false);
		};
		window.addEventListener('resize', handleResize);
		handleResize();
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleLogOut = async () => await logOut();

	const AuthenticatedLinks = () => (
		<>
			<NavLink
				to="/"
				className={checkingIsActive}
				onClick={() => setIsMenuActive(false)}
			>
				<i className="fas fa-home"></i>
			</NavLink>
			<NavLink
				to={`/cart/${user._id}`}
				className={({ isActive }) =>
					isActive ? Styles.activeLink : null
				}
				onClick={() => setIsMenuActive(false)}
			>
				Cart
			</NavLink>
			<NavLink
				to={`/orders/${user?._id}`}
				className={checkingIsActive}
				onClick={() => setIsMenuActive(false)}
			>
				Orders
			</NavLink>
			<NavLink
				to="/contact"
				className={({ isActive }) =>
					isActive ? Styles.activeLink : null
				}
				onClick={() => setIsMenuActive(false)}
			>
				Contact
			</NavLink>
			<NavLink className={Styles.logoutBtn} onClick={handleLogOut} to="/">
				Log out
			</NavLink>
		</>
	);

	const checkingIsActive = ({ isActive }) => {
		return isActive ? Styles.activeLink : '';
	};

	const AdminLinks = () => (
		<>
			<NavLink
				to="/"
				className={checkingIsActive}
				onClick={() => setIsMenuActive(false)}
			>
				<i className="fas fa-home"></i>
			</NavLink>
			<NavLink
				to="/add"
				className={checkingIsActive}
				onClick={() => setIsMenuActive(false)}
			>
				Add
			</NavLink>
			<NavLink
				to={`/orders/${user?._id}`}
				className={checkingIsActive}
				onClick={() => setIsMenuActive(false)}
			>
				Orders
			</NavLink>
			<NavLink className={Styles.logoutBtn} onClick={handleLogOut} to="/">
				Log out
			</NavLink>
		</>
	);

	const GuestLinks = () => (
		<>
			<NavLink
				to="/"
				className={checkingIsActive}
				onClick={() => setIsMenuActive(false)}
			>
				<i className="fas fa-home"></i>
			</NavLink>
			<NavLink to="/signin" className={checkingIsActive}>
				Sign In
			</NavLink>
			<NavLink to="/about" className={checkingIsActive}>
				About
			</NavLink>
			<NavLink to="/contact" className={checkingIsActive}>
				Contact
			</NavLink>
		</>
	);

	return (
		<header>
			<h1 onClick={() => navigate('/')}>Sweet Treats</h1>
			{isBiggerWidth ? (
				<ul className={Styles.navLinksHorizontal}>
					{isAuthenticated ? (
						user.role === 'admin' ? (
							<AdminLinks />
						) : (
							<AuthenticatedLinks />
						)
					) : (
						<GuestLinks />
					)}
				</ul>
			) : (
				<i
					className={`fas fa-bars ${Styles.faBars}`}
					onClick={() => setIsMenuActive(e => !e)}
				></i>
			)}
			<ul className={isMenuActive ? Styles.sideMenu : Styles.sideMenuOff}>
				<i
					className={`fas fa-times ${Styles.faTimes}`}
					onClick={() => setIsMenuActive(false)}
				></i>
				<div className={Styles.sideMenuLinks}>
					{isAuthenticated ? (
						user.role === 'admin' ? (
							<AdminLinks />
						) : (
							<AuthenticatedLinks />
						)
					) : (
						<GuestLinks />
					)}
				</div>
			</ul>
		</header>
	);
};

export default Navbar;
