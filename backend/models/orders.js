import mongoose from 'mongoose';

const ordersSchema = new mongoose.Schema({
	ordersData: [
		{
			product_id: {
				type: mongoose.Schema.Types.ObjectId,
				required: true,
			},
			quantity: {
				type: Number,
			},
			total: {
				type: Number,
			},
			status: {
				type: String,
				enum: ['Processing', 'Shipped', 'Delivered'],
				default: 'Processing',
			},
			orderedBy: {
				type: String,
			},
			phoneNumber: {
				type: String,
			},
		},
	],

	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
});

ordersSchema.index({ createdBy: 1 });

const Orders = mongoose.model('Orders', ordersSchema);
export default Orders;
