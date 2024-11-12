import Styles from './signin.module.css';
import { useEffect, useState } from 'react';
import { UseContext } from '../../contexts/context';
import { NavLink, useNavigate } from 'react-router-dom';

const Signin = () => {
	const [isShowingPass, setIsShowingPass] = useState(false);
	const [credentials, setCredentials] = useState({
		email: '',
		password: '',
	});

	const { signin, isAuthenticated } = UseContext();
	const navigate = useNavigate();

	const handleChange = ({ target: { name, value } }) =>
		setCredentials(prev => ({ ...prev, [name]: value }));

	const handleSignin = async e => {
		e.preventDefault();

		try {
			await signin(
				credentials.email.toLocaleLowerCase(),
				credentials.password
			);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		if (isAuthenticated) navigate('/');
	}, [isAuthenticated, navigate]);

	return (
		<main>
			<div className={Styles.signinContainer}>
				<h1>Welcome to Sweet Treats!</h1>

				<p>Sign in to explore delicious cakes & cookies</p>

				<form className={Styles.signinForm} onSubmit={handleSignin}>
					<input
						type="email"
						name="email"
						placeholder="Email"
						className={Styles.input}
						value={credentials.email}
						onChange={handleChange}
						required
					/>
					<div className={Styles.passField}>
						<input
							type={isShowingPass ? 'text' : 'password'}
							name="password"
							placeholder="Password"
							className={`${Styles.input} ${Styles.pass}`}
							value={credentials.password}
							onChange={handleChange}
							required
						/>
						<i
							className={
								isShowingPass
									? `fas fa-eye-slash ${Styles.faEyeSlash}`
									: `fas fa-eye ${Styles.faEye}`
							}
							onClick={() => setIsShowingPass(prev => !prev)}
						></i>
					</div>
					<button type="submit" className={Styles.signinButton}>
						Sign In
					</button>
				</form>

				<div className={Styles.signupLink}>
					Don’t have an account?{' '}
					<NavLink to="/signup">Join us!</NavLink>
				</div>
			</div>
		</main>
	);
};

export default Signin;
