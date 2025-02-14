export default {
    template: `
    <div>
        <input placeholder="email" v-model="email"/>  
        <input type="password" placeholder="password" v-model="password"/>  
        <button class='btn btn-primary' @click="submitLogin">Login</button>
        <p v-if="message" style="color: red;">{{ message }}</p>
    </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            message: '' // Holds error messages
        };
    },
    methods: {
        async submitLogin() {
            this.message = ''; // Reset message on new attempt

            if (!this.email || !this.password) {
                this.message = 'Please enter email and password.';
                return;
            }

            try {
                const res = await fetch(location.origin + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 401) {
                        this.message = 'Invalid email or password. Kindly try again.';
                    } else if (res.status === 403) {
                        this.message = 'Your profile has not been approved by admin yet. Please wait for approval.';
                    } else {
                        this.message = data.message || 'Login failed. Please try again later.';
                    }
                    return;
                }

                // If login successful, store data and redirect
                this.$store.commit('setUser');
                localStorage.setItem('user', JSON.stringify(data));

                switch (data.role) {
                    case 0:
                        this.$router.push('/admin-home');
                        break;
                    case 1:
                        this.$router.push('/home-customer');
                        break;
                    case 2:
                        this.$router.push('/professional-home');
                        break;
                    default:
                        console.error('Unknown role');
                        break;
                }
            } catch (error) {
                console.error('Login error:', error);
                this.message = 'Something went wrong. Please try again.';
            }
        }
    }
};
