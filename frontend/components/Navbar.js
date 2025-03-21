export default {
    template: `
      <div>
        <router-link v-if="!isLoggedIn" to='/'>Home</router-link>
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <router-link v-if="!isLoggedIn" to="/register-customer">Register</router-link>
        <router-link v-if="isLoggedIn" to="/summary" class="nav-link">Summary</router-link>
        <!-- Show these links when the user is logged in -->
        <div v-if="isLoggedIn">
          <router-link v-if="userRole === 0" to="/admin-home">Admin Home</router-link>
          <router-link v-if="userRole === 1" to="/home-customer">Customer Home</router-link>
          <router-link v-if="userRole === 2" to="/professional-home">Professional Home</router-link>
          
          <router-link to="/profile">Profile</router-link>
          <button @click="logout">Logout</button>
        </div>
      </div>
    `,
    computed: {
      isLoggedIn() {
        console.log(this.$store.state.auth_token, "this.$store.state.user");
        // Check if user data (customer, professional, or admin) exists in the Vuex store
        return this.$store.state.auth_token !== null;
      },
      userRole() {
        // Return the role of the logged-in user (0 = Admin, 1 = Customer, 2 = Professional)
        return this.$store.state.role;
      }
    },
    methods: {
      logout() {
        console.log(this.$store.state.auth_token, "this is before.$store.state.user");
        // Clear user data from the store and local storage (if applicable)
        this.$store.commit('logout'); // Assuming you have a mutation for logout
        localStorage.removeItem('auth_token');
        this.$router.push('/login'); // Redirect to login page
        console.log(this.$store.state.auth_token, "this.$store.state.user");
      }
    }
  }
  