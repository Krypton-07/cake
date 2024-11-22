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
import Orders from './models/orders.js';

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
				subject: 'OTP Verification - Your Sweet Access Code',
				html: `
    <div style="font-family: 'Arial, sans-serif'; background-color: #fff5e6; color: #5a372d; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; border: 2px solid #e3cbb8; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="text-align: center; font-size: 26px; margin-bottom: 20px; color: #d6634c;">🎂 Your Sweet Access Code 🎂</h1>
        <p style="font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 20px;">
            Hello! Here’s your one-time password (OTP) to verify your account. We hope this delightful email brightens your day:
        </p>
        <div style="background-color: #ffe0cc; padding: 15px; text-align: center; border-radius: 8px; font-size: 22px; font-weight: bold; color: #d6634c; border: 2px dashed #f3bfb0; margin: 20px 0;">
            ${generateOTP}
        </div>
        <p style="text-align: center; font-size: 14px; color: #856049; margin-bottom: 20px;">
            If you didn’t request this OTP, no worries! Just ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e3cbb8; margin: 20px 0;">
        <p style="text-align: center; font-size: 14px; color: #856049;">
            Thank you for trusting us. We hope your day is as sweet as cake!<br> 
            <strong>— The Sweet Treats Team</strong>
        </p>
    </div>`,
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
		} = req.body;

		const phoneRegex = /^01\d{9}$/;
		if (!phoneRegex.test(phoneNumber)) {
			return res
				.status(400)
				.json({ message: 'Invalid phone number format' });
		}

		let newOrder = await Orders.findOne({ createdBy: userId });

		if (!newOrder) {
			newOrder = new Orders({
				createdBy: userId,
				ordersData: [
					{
						product_id: id,
						quantity,
						total,
						orderedBy: name,
						phoneNumber,
					},
				],
			});
		} else {
			newOrder.ordersData.push({ product_id: id, quantity, total });
		}

		await newOrder.save();

		const mailOptions = {
			from: email,
			to: process.env.EMAIL,
			subject: `New Customer Knocked`,
			html: `
    <body style="font-family: Arial, sans-serif; background-color: #fff9f2; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; border: 2px solid #f8d7da; border-radius: 10px; background: #fff;">
            <div style="text-align: center; padding: 20px 0; background: #fbd5d5; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                <h1 style="font-size: 24px; color: #a83232;">🎂 New Cake Order 🎂</h1>
            </div>
            <div style="padding: 20px;">
                <img src="${img}" alt="Cake Image" style="width: 100%; max-width: 400px; display: block; margin: 0 auto; border-radius: 10px; border: 1px solid #f3f3f3;"/>
                <p style="font-size: 18px; text-align: center; margin: 10px 0; color: #d2691e;">${cakeName}</p>
                <hr style="border: none; border-top: 1px dashed #f3c8c8; margin: 20px 0;">

                <div style="font-size: 16px; line-height: 1.5;">
                    <p><strong>Customer Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    <p><strong>Quantity:</strong> ${quantity} x ${cakeName}</p>
                    <p><strong>Total Cost:</strong> ${total} BDT</p>
                </div>
            </div>
            <div style="text-align: center; padding: 10px 0; background: #fbd5d5; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 14px; color: #555;">
                <p>&copy; ${new Date().getFullYear()} Cake Delight. All rights reserved.</p>
            </div>
        </div>
    </body>`,
		};

		const transporter = Transporter();
		await transporter.sendMail(mailOptions);

		res.status(200).json({
			message: 'Order placed successfully',
			orderId: newOrder._id,
		});
	} catch (e) {
		response;
		console.error('Error placing order:', e);
		res.status(500).json({
			message: 'Error placing order',
			error: e.message,
		});
	}
});

app.get('/orderData/:createdBy', async (req, res) => {
	const { createdBy } = req.params;

	if (!mongoose.Types.ObjectId.isValid(createdBy)) {
		return res.status(400).json({ message: 'Invalid user ID format' });
	}

	try {
		const orders = await Orders.find({ createdBy });
		res.status(200).json({ orders });
	} catch (e) {
		console.error('Error fetching order data:', e);
		res.status(500).json({
			message: 'Error fetching order data',
			error: e.message,
		});
	}
});

app.get('/orderData', async (req, res) => {
	try {
		const orders = await Orders.find({});

		res.status(200).json({ orders });
	} catch {
		res.status(500).json({ message: 'Failed to load carts' });
	}
});

app.patch('/set/order/status', async (req, res) => {
	const { client, orderId, newStatus } = req.body;

	if (
		!mongoose.Types.ObjectId.isValid(client) ||
		!mongoose.Types.ObjectId.isValid(orderId) ||
		!['Processing', 'Shipped', 'Delivered'].includes(newStatus)
	) {
		return res.status(400).json({ message: 'Invalid input' });
	}

	try {
		await Orders.findOneAndUpdate(
			{ createdBy: client, 'ordersData.product_id': orderId },
			{ $set: { 'ordersData.$.status': newStatus } },
			{ new: true }
		);

		res.status(200).json({ message: 'Order status updated successfully' });
	} catch (error) {
		console.error('Error updating order status:', error);
		res.status(500).json({ message: 'Failed to update order status' });
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

app.post('/addCart', async (req, res) => {
	const { user_id, product_id } = req.body;

	try {
		let cart = await Cart.findOne({ createdBy: user_id });

		if (!cart) {
			cart = new Cart({
				createdBy: user_id,
				cartProducts: [{ product_id }],
			});
		} else {
			const existingProduct = cart.cartProducts.find(item => {
				return item.product_id.toString() === product_id.toString();
			});

			if (existingProduct) {
				return res.status(409).json({
					message: 'Product already in cart',
				});
			} else {
				cart.cartProducts.push({ product_id });
			}
		}

		await cart.save();
		res.status(200).json({
			message: 'Added to cart',
		});
	} catch (error) {
		console.error('Error adding to cart:', error);
		res.status(500).json({ message: 'Failed to add to cart' });
	}
});

app.get('/getCart/:createdBy', async (req, res) => {
	const { createdBy } = req.params;

	try {
		const cart = await Cart.findOne({ createdBy });

		if (!cart) {
			return res.status(200).json({ cartProducts: [] });
		}

		res.status(200).json(cart);
	} catch (error) {
		console.error('Error retrieving cart:', error);
		res.status(500).json({ message: 'Failed to load cart' });
	}
});

app.delete('/deleteCart/:createdBy/:product_id', async (req, res) => {
	const { createdBy, product_id } = req.params;

	if (!createdBy || !product_id) {
		return res
			.status(400)
			.json({ message: 'Missing user_id or product_id' });
	}

	try {
		const updatedCart = await Cart.findOneAndUpdate(
			{ createdBy },
			{ $pull: { cartProducts: { product_id } } },
			{ new: true }
		);

		if (!updatedCart) {
			return res.status(404).json({ message: 'Cart or item not found' });
		}

		res.status(200).json({
			message: 'Item removed from cart',
			updatedCart,
		});
	} catch (error) {
		console.error('Error deleting cart item:', error);
		res.status(500).json({ message: 'Failed to delete cart item' });
	}
});

app.listen(port, () =>
	console.log(`Server running on http://localhost:${port}`)
);
