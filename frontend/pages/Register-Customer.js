export default {
    template: `
    <div class="container mt-5">
        <div class="card shadow-lg">
            <div class="card-body">
                <h3 class="card-title text-center mb-4">Customer Registration</h3>
                <form @submit.prevent="submitRegister">
                    <div class="mb-3">
                        <label for="fullName" class="form-label">Full Name</label>
                        <input type="text" id="fullName" v-model="fullName" class="form-control" placeholder="Enter your full name" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" v-model="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" id="password" v-model="password" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Address</label>
                        <textarea id="address" v-model="address" class="form-control" rows="3" placeholder="Enter your address" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="pincode" class="form-label">Pin Code</label>
                        <input type="text" id="pincode" v-model="pincode" class="form-control" placeholder="Enter your pin code" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Register</button>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            fullName: null,
            email: null,
            password: null,
            address: null,
            pincode: null,
        };
    },
    methods: {
        async submitRegister() {
            try {
                const res = await fetch(location.origin + '/register-customer', 
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: this.fullName,
                        email: this.email,
                        password: this.password,
                        address: this.address,
                        pincode: this.pincode,
                    }),
                });
        
                if (res.ok) {
                    console.log('Registration successful');
                    alert('You have registered successfully! Redirecting to login...');
                    window.location.href = '/#/login'; // Redirect to the login page
                } else {
                    const responseData = await res.json();
                    if (responseData.message === 'user already exists') {
                        alert('User already exists. Redirecting to login...');
                        window.location.href = '/login'; // Redirect to the login page
                    } else {
                        alert('Registration failed. Please try again.');
                    }
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('An error occurred. Please try again later.');
            }
        }
}
};
