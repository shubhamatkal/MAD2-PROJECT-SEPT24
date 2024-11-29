export default {
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
  