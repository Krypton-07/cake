import { NavLink } from 'react-router-dom';
import styles from './404.module.css';

const NotFound = () => {
	return (
		<main className={styles.container}>
			<div className={styles.cakeImage}>
				🍰 {/* Cake emoji as a placeholder for an image */}
			</div>
			<h1 className={styles.header}>404</h1>
			<p className={styles.text}>
				Oops! This page has been eaten by a cake monster!
			</p>
			<NavLink to="/" className={styles.link}>
				Return to Home
			</NavLink>
		</main>
	);
};

export default NotFound;
