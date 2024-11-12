/* eslint-disable react-hooks/exhaustive-deps */
import Styles from './signup.module.css';
import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { UseContext } from '../../contexts/context';

const Signup = () => {
	const [isShowingPass, setIsShowingPass] = useState(false);
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		otp: '',
	});
	const [otpActive, setOtpActive] = useState(false);

	const { errorMsg, signup, isAuthenticated } = UseContext();
	const navigate = useNavigate();

	const handleChange = ({ target: { name, value } }) =>
		setFormData(prev => ({ ...prev, [name]: value }));

	const handleSignup = async e => {
		try {
			e.preventDefault();
			const { username, email, password, otp } = formData;
			if (username && email && password) {
				await signup(
					username,
					email.toLocaleLowerCase(),
					password,
					otp
				);
				setOtpActive(true);
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		if (isAuthenticated) navigate('/');
		if (errorMsg) setOtpActive(false);
	}, [isAuthenticated, errorMsg]);

	return (
		<main>
			<div className={Styles.signupContainer}>
				<h1>Join the Sweetness!</h1>
				<p>Enrich your taste with us!</p>
				<form onSubmit={handleSignup}>
					<div
						className={
							otpActive ? Styles.hidden : Styles.signupForm
						}
					>
						<input
							type="text"
							name="username"
							placeholder="Username"
							className={Styles.inputField}
							value={formData.username}
							onChange={handleChange}
							required
						/>
						<input
							type="email"
							name="email"
							placeholder="Email"
							className={Styles.inputField}
							value={formData.email}
							onChange={handleChange}
							required
						/>
						<div className={Styles.passField}>
							<input
								type={isShowingPass ? 'text' : 'password'}
								name="password"
								placeholder="Password"
								className={`${Styles.inputField} ${Styles.pass}`}
								value={formData.password}
								onChange={handleChange}
								required
							/>
							<i
								className={
									isShowingPass
										? `fas fa-eye-slash ${Styles.faEyeSlash}`
										: `fas fa-eye ${Styles.faEye}`
								}
								onClick={() => {
									setIsShowingPass(!isShowingPass);
								}}
							></i>
						</div>
						<button type="submit" className={Styles.signupBtn}>
							Sign Up
						</button>
					</div>

					{otpActive && (
						<div className={Styles.signupForm}>
							<input
								type="text"
								name="otp"
								placeholder="Enter OTP"
								className={Styles.inputField}
								value={formData.otp}
								onChange={handleChange}
								required
							/>
							<button type="submit" className={Styles.signupBtn}>
								Verify OTP
							</button>
						</div>
					)}
				</form>
			</div>
		</main>
	);
};

export default Signup;
