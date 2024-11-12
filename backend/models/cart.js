import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
	product_id: {
		type: String,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
