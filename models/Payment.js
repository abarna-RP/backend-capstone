import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client', // "User" என்பதற்கு பதிலாக "Client"
        required: [true, 'Client ID is required'],
        validate: {
            validator: async function(clientId) {
                const client = await mongoose.model('Client').findById(clientId);
                return !!client;
            },
            message: 'No client found with ID {VALUE}'
        }
    },
    counselor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counselor',
        required: [true, 'Counselor ID is required'],
        validate: {
            validator: async function(counselorId) {
                const counselor = await mongoose.model('Counselor').findById(counselorId);
                return !!counselor;
            },
            message: 'No counselor found with ID {VALUE}'
        }
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be at least 0.01']
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Bank Transfer'],
        required: [true, 'Payment method is required']
    },
    stripeChargeId: {
        type: String,
        required: [true, 'Stripe charge ID is required'],
        unique: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

paymentSchema.index({ client: 1, counselor: 1, paymentDate: -1 });

paymentSchema.pre('save', async function(next) {
    if (typeof this.client === 'string') {
        this.client = mongoose.Types.ObjectId(this.client);
    }
    if (typeof this.counselor === 'string') {
        this.counselor = mongoose.Types.ObjectId(this.counselor);
    }

    if (this.amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;