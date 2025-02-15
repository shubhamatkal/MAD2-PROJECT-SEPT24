export default {
	template: `
	  <div class="professionals-container">
		<h2>Professionals for Service</h2>
		<table v-if="professionals.length" class="professionals-table">
		  <thead>
			<tr>
			  <th>ID</th>
			  <th>Professional Name</th>
			  <th>Base Price</th>
			  <th>Avg Rating</th>
			  <th>Actions</th>
			</tr>
		  </thead>
		  <tbody>
			<tr v-for="professional in professionals" :key="professional.id">
			  <td>{{ professional.id }}</td>
			  <td>{{ professional.name }}</td>
			  <td>{{ professional.base_price }}</td>
			  <td>{{ professional.avg_rating }}</td>
			  <td>
				<button @click="bookProfessional(professional.id)">Book</button>
			  </td>
			</tr>
		  </tbody>
		</table>
		<p v-else>No professionals found for this service.</p>
	  </div>
	`,
	data() {
	  return {
		professionals: [],
		serviceId: null
	  }
	},
	created() {
	  this.serviceId = this.$route.params.serviceId;
	  this.fetchProfessionals();
	},
	methods: {
	  async fetchProfessionals() {
		try {
		  const response = await fetch(`/api/professionals/service/${this.serviceId}`);
		  this.professionals = await response.json();
		} catch (error) {
		  console.error('Error fetching professionals:', error);
		}
	  },
	  async bookProfessional(professionalId) {
		try {
			console.log(this.getUserId(), "this.getUserId()");
		  const response = await fetch('/api/book', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  professional_id: professionalId,
			  service_id: this.serviceId,
			  user_id: this.getUserId(),
			})
		  });
		  
		  if (response.ok) {
			alert('Booking successful!');
		  } else {
			alert('Booking failed. Please try again.');
		  }
		} catch (error) {
		  console.error('Booking failed:', error);
		  alert('Booking failed. Please try again.');
		}
	  },
	  getUserId() {
		const userData = localStorage.getItem("user"); 
		if (userData) {
		  try {
			const userObj = JSON.parse(userData);
			return userObj.id || 1;  // Return actual ID or default to 1
		  } catch (error) {
			console.error("Error parsing user data:", error);
			return 1; 
		  }
		}
		return 1; // Default if no user data is found
	  }
	}
  }