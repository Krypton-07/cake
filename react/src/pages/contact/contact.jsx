import { useState } from 'react';
import styles from './Contact.module.css';
import { UseContext } from '../../contexts/context';

const Contact = () => {
	const [msg, setMsg] = useState('');
	const [email, setEmail] = useState('');
	const [subject, setSubject] = useState('');

	const { communicate } = UseContext();

	const handleSubmit = async e => {
		e.preventDefault();
		try {
			await communicate(email.toLocaleLowerCase(), subject, msg);
			setEmail('');
			setSubject('');
			setMsg('');
		} catch (error) {
			console.log('Error:', error);
		}
	};

	return (
		<main>
			<section className={styles.contactSection}>
				<div className={styles.container}>
					<h2 className={styles.heading}>Get in Touch</h2>
					<p className={styles.subheading}>
						Have a question or want to place an order? Send us a
						message, and we&apos;ll get back to you as soon as
						possible!
					</p>
					<form
						className={styles.contactForm}
						onSubmit={handleSubmit}
					>
						<div className={styles.formGroup}>
							<label htmlFor="email" className={styles.label}>
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								className={styles.input}
								required
								onChange={e => setEmail(e.target.value)}
							/>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor="subject" className={styles.label}>
								Subject
							</label>
							<input
								type="text"
								id="subject"
								name="subject"
								className={styles.input}
								required
								onChange={e => {
									setSubject(e.target.value);
								}}
							/>
						</div>
						<div className={styles.formGroup}>
							<label htmlFor="message" className={styles.label}>
								Message
							</label>
							<textarea
								id="message"
								name="message"
								className={styles.textarea}
								rows="4"
								required
								onChange={e => {
									setMsg(e.target.value);
								}}
							></textarea>
						</div>
						<button type="submit" className={styles.submitButton}>
							Send Message
						</button>
					</form>
				</div>
			</section>
		</main>
	);
};

export default Contact;
