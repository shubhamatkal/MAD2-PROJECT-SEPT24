export default {
	template: `
	  <div>
		<h2 class="text-center mt-3">All Service Requests</h2>
		<table v-if="serviceRequests.length" class="table table-striped">
		  <thead>
			<tr>
			  <th>ID</th>
			  <th>Customer</th>
			  <th>Service</th>
			  <th>Professional</th>
			  <th>Date of Request</th>
			  <th>Status</th>
			</tr>
		  </thead>
		  <tbody>
			<tr v-for="request in serviceRequests" :key="request.id">
			  <td>{{ request.id }}</td>
			  <td>{{ request.customer_name }}</td>
			  <td>{{ request.service_name }}</td>
			  <td>{{ request.professional_name }}</td>
			  <td>{{ request.date_of_request }}</td>
			  <td>{{ request.service_status }}</td>
			</tr>
		  </tbody>
		</table>
		<div v-else class="text-center mt-5">
		  <p>No service requests found.</p>
		</div>
	  </div>
	`,
	data() {
	  return {
		serviceRequests: [],
	  };
	},
	methods: {
	  async fetchData(endpoint) {
		try {
		  const res = await fetch(endpoint, {
			headers: {
			  'Authentication-Token': this.$store.state.auth_token,
			},
		  });
		  return await res.json();
		} catch (error) {
		  console.error('Error fetching data:', error);
		  return [];
		}
	  },
	  async loadServiceRequests() {
		this.serviceRequests = await this.fetchData('/api/service_requests');
	  },
	},
	mounted() {
	  this.loadServiceRequests();
	},
  };
  