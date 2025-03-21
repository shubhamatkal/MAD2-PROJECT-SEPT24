export default {
	template: `
	  <div class="container mt-5">
		<h1 class="text-center mb-4">Register as a Professional</h1>
		<form @submit.prevent="submitRegistration">
		  <div class="mb-3">
			<label for="email" class="form-label">Email</label>
			<input type="email" id="email" v-model="email" class="form-control" placeholder="Enter your email" required>
		  </div>
		  <div class="mb-3">
			<label for="password" class="form-label">Password</label>
			<input type="password" id="password" v-model="password" class="form-control" placeholder="Enter your password" required>
		  </div>
		  <div class="mb-3">
			<label for="fullname" class="form-label">Full Name</label>
			<input type="text" id="fullname" v-model="fullname" class="form-control" placeholder="Enter your full name" required>
		  </div>
		  <div class="mb-3">
			<label for="service" class="form-label">Service Name</label>
			<select id="service" v-model="service" class="form-select" required>
			  <option v-for="service in services" :key="service.id" :value="service.name">
				{{ service.name }}
			  </option>
			</select>
		  </div>
		  <div class="mb-3">
			<label for="experience" class="form-label">Experience (Years)</label>
			<input type="number" id="experience" v-model="experience" class="form-control" placeholder="Enter your experience in years" required>
		  </div>
		  <div class="mb-3">
			<label for="document" class="form-label">Attach Document</label>
			<input type="file" id="document" @change="handleFileUpload" class="form-control" required>
		  </div>
		  <div class="mb-3">
			<label for="address" class="form-label">Address</label>
			<input type="text" id="address" v-model="address" class="form-control" placeholder="Enter your address" required>
		  </div>
		  <div class="mb-3">
			<label for="pincode" class="form-label">Pin Code</label>
			<input type="text" id="pincode" v-model="pincode" class="form-control" placeholder="Enter your pin code" required>
		  </div>
		  <button type="submit" class="btn btn-primary w-100">Register</button>
		</form>
	  </div>
	`,
	data() {
	  return {
		email: '',
		password: '',
		fullname: '',
		service: '',
		experience: '',
		document: null,
		address: '',
		pincode: '',
		services: []
	  };
	},
	methods: {
		async loadServicesAndRequests() {
			try {
				const servicesData = await this.fetchServices();
				this.services = servicesData; // Assign resolved data
				console.log(this.services);
	
				// const serviceRequestsData = await this.fetchServiceRequests();
				// this.serviceRequests = serviceRequestsData; // Assign resolved data
				// console.log(this.serviceRequests);
			} catch (error) {
				console.error("Error loading services or requests:", error);
			}
		},
		async fetchServices() {
			console.log('fetchServices');
			try {
			  const response = await fetch('/api/services'); 
			  return await response.json();
			} catch (error) {
			  console.error("Error fetching data:", error);
			}
		  },


	  handleFileUpload(event) {
		this.document = event.target.files[0];
	  },
	  async submitRegistration() {
		const formData = new FormData();
		formData.append('email', this.email);
		formData.append('password', this.password);
		formData.append('fullname', this.fullname);
		formData.append('service', this.service);
		formData.append('experience', this.experience);
		formData.append('document', this.document);
		formData.append('address', this.address);
		formData.append('pincode', this.pincode);
  
		try {
		  const res = await fetch('/pro-reg', {
			method: 'POST',
			body: formData
		  });
  
		  if (res.ok) {
			console.log('Registration successful');
			alert('You have registered successfully! Redirecting to login, kindly wait for approval from admin...');
			window.location.href = '/#/login'; // Redirect to the login page
		} else {
			const responseData = await res.json();
			if (responseData.message === 'user already exists') {
				alert('User already exists. Redirecting to login...');
				window.location.href = '/#/login'; // Redirect to the login page
			} else {
				alert('Registration failed. Please try again.');
			}
		}
		} catch (error) {
		  console.error('Error during registration:', error);
		}
	  }
	},
	mounted() {

		console.log('HomeCustomer mounted');

		this.loadServicesAndRequests();


	}
  };
  