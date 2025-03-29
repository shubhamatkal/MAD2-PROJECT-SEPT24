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
	<div class="container my-5">
	<!-- Hero Section -->
	<div class="row justify-content-center text-center">
	  <div class="col-lg-8">
		<h1 class="display-3 fw-bold mb-3">A2Z Household Services</h1>
		<p class="lead mb-4">
		  Your one-stop solution for all household services. From plumbing to cleaning, electrical work to gardening - we've got you covered.
		</p>
		<p class="text-muted mb-5">
		  Join thousands of satisfied customers who trust our vetted professionals for quality service delivery.
		</p>
	  </div>
	</div>
	

	
	<!-- CTA Buttons -->
	<div class="row justify-content-center mb-4">
	  <div class="col-md-8 col-lg-6">
		<div class="card shadow border-0">
		  <div class="card-body p-4 text-center">
			<h4 class="mb-4">Ready to get started?</h4>
			<div class="d-grid gap-3 mb-3">
			  <router-link to="/register-customer" class="btn btn-primary btn-lg fw-bold py-3">
				<i class="bi bi-person-plus me-2"></i>Register as Customer
			  </router-link>
			  
			  <router-link to="/professional-register" class="btn btn-outline-primary fw-semibold py-2">
				<i class="bi bi-tools me-2"></i>Join as Professional
			  </router-link>
			</div>
			
			<router-link to="/login" class="btn btn-link text-decoration-none fw-bold">
			  Already registered? <span class="text-primary">Login here</span>
			</router-link>
		  </div>
		</div>
	  </div>
	</div>
	
	<!-- Trust Badges -->
	<div class="row justify-content-center text-center mb-5">
	  <div class="col-lg-8">
		<div class="d-flex justify-content-center gap-4 flex-wrap">
		  <div class="badge bg-light text-dark px-3 py-2 mb-2">
			<i class="bi bi-shield-check text-success me-1"></i> Verified Professionals
		  </div>
		  <div class="badge bg-light text-dark px-3 py-2 mb-2">
			<i class="bi bi-clock text-primary me-1"></i> 24/7 Support
		  </div>
		  <div class="badge bg-light text-dark px-3 py-2 mb-2">
			<i class="bi bi-star-fill text-warning me-1"></i> 4.8/5 Rating
		  </div>
		  <div class="badge bg-light text-dark px-3 py-2 mb-2">
			<i class="bi bi-currency-dollar text-success me-1"></i> Best Prices
		  </div>
		</div>
	  </div>
	</div>
	
  </div>
	`,
	methods: {
	  contactUs() {
		window.location.href = 'mailto:23f1002838@ds.study.iitm.ac.in';
	  },
	},
  };