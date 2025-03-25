export default {
	data() {
	  return {
		userRole: null
	  };
	},
	created() {
	  // Check if user is logged in and get their role
	  const token = this.$store.state.auth_token;
	  const storedUserRole = this.$store.state.role;
	  console.log('i am hereee');
	  console.log(token);
	  console.log(storedUserRole);
	//   if (token && storedUserRole) {
	// 	console.log("loop is valid")
	//   } else {
	// 	console.log("loop is not valid")
	//   }

	  if (token && storedUserRole !== undefined && storedUserRole !== null) {		// Convert storedUserRole to a number if it's stored as a string
		this.userRole = storedUserRole;
		
		// Redirect based on user role
		switch (this.userRole) {
		  case 0:
			console.log('Admin logged in');
			this.$router.push('/admin-home');
			break;
		  case 1:
			console.log('Customer logged in');
			this.$router.push('/home-customer');
			break;
		  case 2:
			console.log('Professional logged in');
			this.$router.push('/professional-home');
			break;
		  default:
			console.log('Invalid user role');
			// If role is not recognized, stay on home page
			break;
		}
	  }
	},
	template: `
	  <div class="container text-center mt-5">
		<!-- Big Title -->
		<h1 class="display-4 fw-bold mb-3">A2Z Household Services</h1>
		<p class="lead text-muted mb-4">
		  Your one-stop solution for all household services. Register today to enjoy seamless services from trusted professionals.
		</p>
		
		<!-- Register Today Button -->
		<div class="d-grid gap-3 col-6 mx-auto">
		  <router-link to="/register-customer" class="btn btn-primary btn-lg fw-bold">
			Register Today
		  </router-link>
		  
		  <!-- Register as Professional Button -->
		  <router-link to="/professional-register" class="btn btn-secondary fw-semibold">
			Register as Professional
		  </router-link>
		</div>
		
		<!-- Already Registered -> Login Button -->
		<div class="mt-4">
		  <router-link to="/login" class="btn btn-link text-decoration-none fw-bold">
			Already registered? <span class="text-primary">Login</span>
		  </router-link>
		</div>
		
		<!-- Contact Us Section -->
		<footer class="mt-5">
		  <button @click="contactUs" class="btn btn-outline-dark btn-sm">
			Contact Us
		  </button>
		</footer>
	  </div>
	`,
	methods: {
	  contactUs() {
		window.location.href = 'mailto:23f1002838@ds.study.iitm.ac.in';
	  },
	},
  };