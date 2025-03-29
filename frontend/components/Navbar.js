export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand fw-bold text-primary">
          A2Z HouseHold Services
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <template v-if="!isLoggedIn">
              <li class="nav-item">
                <router-link to='/' class="nav-link">Home</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/login" class="nav-link">Login</router-link>
              </li>
              <li class="nav-item">
                <router-link to="/register-customer" class="nav-link">Register</router-link>
              </li>
            </template>
            
            <template v-if="isLoggedIn">
              <li class="nav-item">
                <router-link to="/summary" class="nav-link">Summary</router-link>
              </li>
              
              <li v-if="userRole === 0" class="nav-item">
                <router-link to="/admin-home" class="nav-link">Admin Home</router-link>
              </li>
              <li v-if="userRole === 1" class="nav-item">
                <router-link to="/home-customer" class="nav-link">Customer Home</router-link>
              </li>
              <li v-if="userRole === 2" class="nav-item">
                <router-link to="/professional-home" class="nav-link">Professional Home</router-link>
              </li>
              
              <li class="nav-item">
                <router-link to="/profile" class="nav-link">Profile</router-link>
              </li>
              <li class="nav-item">
                <button @click="logout" class="btn btn-outline-danger ms-2">Logout</button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  `,
  computed: {
    isLoggedIn() {
      return this.$store.state.auth_token !== null;
    },
    userRole() {
      return this.$store.state.role;
    }
  },
  methods: {
    logout() {
      this.$store.commit('logout');
      localStorage.removeItem('auth_token');
      this.$router.push('/login');
    }
  }
}