import axios from 'axios';

async function test() {
    try {
        const email = `test${Date.now()}@example.com`;
        const res = await axios.post('http://localhost:5001/api/auth/register', {
            name: 'Test', email, password: 'password', phone: '9876543210'
        });
        const token = res.data.token;

        const productsRes = await axios.get('http://localhost:5001/api/products');
        const product = productsRes.data.products[0];

        const payload = {
            items: [{ product: product._id, name: product.name, image: product.image, price: product.price, quantity: 1 }],
            shippingAddress: { name: 't', phone: '9876543210', street: 's', city: 'c', state: 's', pincode: '123456' },
            paymentMethod: 'razorpay' // testing razorpay
        };

        const orderRes = await axios.post('http://localhost:5001/api/orders', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", orderRes.data);
    } catch(err) {
        if(err.response) {
            console.error("HTTP ERROR:", err.response.status, err.response.data);
        } else {
            console.error("CLIENT ERROR:", err.message);
        }
    }
}
test();
