export default {
    template: `

    <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h4 class="text-center">Login</h4>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <input type="email" class="form-control" placeholder="email" v-model="email"/>
            </div>
            <div class="mb-3">
              <input type="password" class="form-control" placeholder="password" v-model="password"/>
            </div>
            <button class="btn btn-primary w-100" @click="submitLogin">Login</button>
            <p v-if="message" class="text-danger mt-3">{{ message }}</p>
          </div>
        </div>
      </div>
    </div>
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
                    console.log('Login failed:', data);
                    this.message = data.message || 'Login failed. Please try again.';
                    return;
                }
        
                console.log("✅ Login Successful:", data);
        
                // ✅ Ensure Vuex state updates before navigation
                this.$store.commit('setUser', data);
                await this.$nextTick(); // Wait for Vuex state update
        
                console.log("✅ Vuex State Updated:", this.$store.state);
        
                // ✅ Check if localStorage is updated
                console.log("✅ LocalStorage User:", localStorage.getItem('user'));
        
                // ✅ Debug navigation guard variables
                console.log("✅ Navigating to:", data.role === 1 ? "/home-customer" : data.role === 0 ? "/admin-home" : "/professional-home");
        
                // ✅ Ensure correct redirection
                if (data.role === 1) {
                    this.$router.push('/home-customer');
                } else if (data.role === 0) {
                    this.$router.push('/admin-home');
                } else {
                    this.$router.push('/professional-home');
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                this.message = 'Something went wrong. Please try again.';
            }
        }
    }
};
