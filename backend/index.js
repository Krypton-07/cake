import cors from 'cors';
import multer from 'multer';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import Otp from './models/otp.js';
import User from './models/user.js';
import Cart from './models/cart.js';
import Cards from './models/cards.js';

dotenv.config();

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary.v2,
	params: {
		folder: 'sweetes_records',
		allowed_formats: ['jpg', 'png', 'jpeg'],
	},
});

const upload = multer({ storage });

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store');
	next();
});

mongoose
	.connect(process.env.MONGODB_URL)
	.then(() => console.log('MongoDB connected successfully'))
	.catch(err => console.error('Failed to connect to MongoDB', err));

const Transporter = () => {
	return nodemailer.createTransport({
		service: 'gmail',
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.APP_PASS,
		},
	});
};

app.post('/signup', async (req, res) => {
	const { username, email, password, otp } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (existingUser)
			return res.status(409).json({ message: 'Email already exists' });

		if (!otp) {
			const generateOTP = Math.floor(
				100000 + Math.random() * 900000
			).toString();
			await Otp.create({
				email,
				otp: generateOTP,
				createdAt: new Date(),
			});

			const transporter = Transporter();
			const mailOptions = {
				from: process.env.EMAIL,
				to: email,
				subject: 'OTP Verification',
				html: `<p>Your OTP: <strong>${generateOTP}</strong></p>`,
			};
			await transporter.sendMail(mailOptions);
			return res.status(200).json({ message: 'OTP sent' });
		}

		const otpDetails = await Otp.findOne({ email });
		if (!otpDetails || otpDetails.otp !== otp)
			return res.status(400).json({ message: 'Invalid or expired OTP' });

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			username,
			email,
			password: hashedPassword,
		});
		res.status(201).json({ message: 'Registration successful' });
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({ message: 'Error signing up' });
	}
});

app.post('/signin', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user)
			return res.status(401).json({ message: 'Invalid Credentials' });

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(401).json({ message: 'Invalid Credentials' });

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '30d',
		});
		
		res.cookie('token', token, {
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		res.status(200).json({ user });
	} catch (error) {
		console.error('Signin error:', error);
		res.status(500).json({ message: 'Error signing in' });
	}
});

app.get('/checkauth', async (req, res) => {
	const token = req.cookies.token;
	if (!token) return res.status(401).json({ message: 'Unauthorized' });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);
		if (!user) return res.status(401).json({ message: 'Unauthorized' });

		res.status(200).json({ user });
	} catch (error) {
		res.status(401).json({ message: 'Unauthorized' });
	}
});

app.post('/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'Strict',
	});
	return res.status(200).json({ message: 'Logged out' });
});

app.post('/addcard', upload.single('image'), async (req, res) => {
	try {
		if (!req.file)
			return res.status(400).json({ message: 'Image upload failed' });

		const result = await cloudinary.v2.uploader.upload(req.file.path);

		const card = new Cards({
			name: req.body.name,
			price: req.body.price,
			description: req.body.description,
			imageUrl: result.secure_url,
		});

		await card.save();
		res.status(201).json({ message: 'Card added successfully', card });
	} catch (error) {
		console.error('Error while adding card:', error);
		res.status(500).json({ message: 'Card validation failed', error });
	}
});

app.get('/cardsData', async (req, res) => {
	try {
		const cards = await Cards.find({});
		res.status(200).json({ cards });
	} catch (e) {
		res.status(500).json({
			message: 'Error fetching cards data',
			error: e,
		});
	}
});

app.delete('/deleteCard/:id', async (req, res) => {
	try {
		const { id } = req.params;
		await Cards.findByIdAndDelete(id);

		res.status(200).json({ message: 'Card deleted successfully' });
	} catch (e) {
		res.status(500).json({ message: 'Error deleting card', error: e });
	}
});

app.post('/placeOrder', async (req, res) => {
	try {
		const {
			name,
			img,
			cakeName,
			email,
			location,
			phoneNumber,
			quantity,
			total,
		} = req.body;

		const phoneRegex = /^01\d{9}$/;
		if (!phoneRegex.test(phoneNumber)) {
			return res
				.status(400)
				.json({ message: 'Invalid phone number format' });
		}

		const mailOptions = {
			from: email,
			to: process.env.EMAIL,
			subject: `New Customer Order`,
			html: `
                <body>
                    <img src="${img}" style="width: 68.5333%; aspect-ratio: 13/10"/>
                    <p>Customer Name: <strong style="text-decoration: underline;">${name}</strong></p>
                    <p>Customer Email: <strong style="text-decoration: underline;">${email}</strong></p>
                    <p>Ordered Item: <strong style="text-decoration: underline;">${cakeName}</strong></p>
                    <p>Location: <strong style="text-decoration: underline;">${location}</strong></p>
                    <p>Phone Number: <strong style="text-decoration: underline;">${phoneNumber}</strong></p>
					<p>Quantity: <strong style="text-decoration: underline;">${quantity} ${cakeName}</strong></p>
					<p>Total Cost: <strong style="text-decoration: underline;">${total} BDT</strong></p>
                </body>`,
		};

		const transporter = Transporter();
		await transporter.sendMail(mailOptions);

		res.status(200).json({ message: 'Order placed successfully' });
	} catch (e) {
		res.status(500).json({ message: 'Error placing order', error: e });
	}
});

app.post('/communicate', async (req, res) => {
	try {
		const { email, subject, msg } = req.body;
		const mailOptions = {
			from: email,
			to: process.env.EMAIL,
			subject: subject,
			html: `<p>${msg}</p>`,
		};
		const transporter = Transporter();
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: 'Message sent successfully' });
	} catch (e) {
		res.status(500).json({ message: 'Error sending message', error: e });
	}
});

// Express routes to add, get, and delete cart items
app.post('/addCart', async (req, res) => {
	const { user_id, product_id } = req.body;

	try {
		const cart = await Cart.findOne({ user_id, product_id });
		if (cart) {
			return res.status(409).json({ message: 'Already added' });
		}

		await Cart.create({ user_id, product_id });
		res.status(200).json({ message: 'Product added to cart successfully' });
	} catch (error) {
		console.error('Error in /addCart route:', error);
		res.status(500).json({ success: false, error: 'Server Error' });
	}
});

app.get('/getCart/:userId', async (req, res) => {
	const userId = req.params.id;

	try {
		const cart = await Cart.find({ user_id: userId });

		if (!cart) {
			return res
				.status(404)
				.json({ success: false, message: 'Cart not found' });
		}

		res.status(200).json({ success: true, cart });
	} catch (error) {
		console.error('Error in /getCart route:', error);
		res.status(500).json({ success: false, error: 'Server Error' });
	}
});

app.delete('/deleteCart', async (req, res) => {
	const { id, userId } = req.body;

	try {
		const deletedItem = await Cart.findOneAndDelete({
			id,
			userId,
		});

		if (!deletedItem) {
			return res.status(404).json({ message: 'Item not found in cart' });
		}

		res.status(200).json({
			message: 'Product deleted from cart successfully',
		});
	} catch (error) {
		console.error('Error deleting cart item:', error);
		res.status(500).json({ message: 'Error deleting cart item' });
	}
});

app.listen(port, () =>
	console.log(`Server running on http://localhost:${port}`)
);
