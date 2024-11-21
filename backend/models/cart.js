import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
	cartProducts: [
		{
			product_id: {
				type: String,
			},
		},
	],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
