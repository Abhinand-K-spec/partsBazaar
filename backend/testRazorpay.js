import Razorpay from 'razorpay';
import 'dotenv/config';

console.log("Date parse test:", new Date(new Date().toLocaleDateString('en-IN')));

const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_Rjwn6o5N6LLqUb',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'K26aDqTOTVxTeLreh31dlCtW'
});

async function test() {
    try {
        const order = await rzp.orders.create({ amount: 1000, currency: 'INR', receipt: 'test' });
        console.log("Razorpay OK:", order.id);
    } catch(err) {
        console.error("Razorpay ERROR:", err);
    }
}
test();
