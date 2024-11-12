import styles from './about.module.css';
import { NavLink, useNavigate } from 'react-router-dom';
import aboutImage from '../../assets/cake.jpg';

const About = () => {
	const navigate = useNavigate();

	return (
		<main>
			<div className={styles.aboutContainer}>
				{/* Header Section */}
				<div className={styles.header}>
					<h1 className={styles.title}>About Us</h1>
					<p className={styles.subtitle}>
						Discover the story behind our delicious and adorable
						cakes!
					</p>
				</div>

				{/* Content Section */}
				<div className={styles.content}>
					<img
						src={aboutImage}
						alt="About our cakes"
						className={styles.contentImage}
					/>
					<p className={styles.text}>
						At Sweet Treats, we believe every cake tells a story.
						Our bakers craft each cake with love, ensuring that
						every slice is a perfect blend of flavor and charm. We
						use only the finest ingredients to create our
						delightful, adorable cakes that bring joy to your
						celebrations.
					</p>
					<button
						className={styles.orderButton}
						onClick={() => {
							navigate('/signin');
						}}
					>
						Order a Cake
					</button>
				</div>

				{/* Footer */}
				<div className={styles.footerText}>
					<p>
						Want to learn more?{' '}
						<NavLink to="/contact" className={styles.footerLink}>
							Contact Us
						</NavLink>
					</p>
				</div>
			</div>
		</main>
	);
};

export default About;
