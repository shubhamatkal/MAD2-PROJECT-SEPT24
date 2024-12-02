export default {
	template: `
	  <div class="container mt-5">
		<h1 class="display-4 fw-bold text-center mb-4">Service History</h1>
		
		<table v-if="serviceRequests.length" class="table table-bordered table-striped">
		  <thead>
			<tr>
			  <th scope="col">Sr. No</th>
			  <th scope="col">Service Name</th>
			  <th scope="col">Professional Name</th>
			  <th scope="col">Phone No.</th>
			  <th scope="col">Completion Date</th>
			  <th scope="col">Status</th>
			  <th scope="col">Action</th>
			</tr>
		  </thead>
		  <tbody>
			<tr v-for="(request, index) in serviceRequests" :key="request.id">
			  <td>{{ request.id }}</td>
			  <td>{{ request.service_name || 'N/A' }}</td>
			  <td>{{ request.professional_name || 'N/A' }}</td>
			  <td>{{ request.phone || 'N/A' }}</td>
			  <td>{{ request.date_of_completion || 'N/A' }}</td>
			  <td>{{ request.status }}</td>
			  <td>
				<button 
				  v-if="['assigned', 'pending'].includes(request.status.toLowerCase())"
				  @click="closeServiceRequest(request.id)"
				  class="btn btn-sm btn-outline-danger"
				>
				  Close
				</button>
			  </td>
			</tr>
		  </tbody>
		</table>
		<p v-else class="text-center">No service history available.</p>
	  </div>
	`,
	data() {
	  return {
		serviceRequests: []
	  };
	},
	methods: {
	  async fetchCustomerServiceRequests() {
		try {
		  const response = await fetch(`/api/customer_service_requests`, {
			method: 'POST',
			headers: {
			  'Authentication-Token': this.$store.state.auth_token,
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  customer_id: this.$store.state.user_id
			})
		  });
		  this.serviceRequests = await response.json();
		} catch (error) {
		  console.error("Error fetching customer service requests:", error);
		  this.$toast.error("Unable to load service history");
		}
	  },
	  async closeServiceRequest(requestId) {
		try {
		  const response = await fetch(`/api/service_requests/${requestId}/close`, {
			method: 'POST',
			headers: {
			  'Authentication-Token': this.$store.state.auth_token,
			  'Content-Type': 'application/json'
			}
		  });
  
		  if (response.ok) {
			this.serviceRequests = this.serviceRequests.filter(request => request.id !== requestId);
			this.$toast.success("Service request closed successfully");
		  } else {
			const errorData = await response.json();
			this.$toast.error(errorData.message || "Failed to close service request");
		  }
		} catch (error) {
		  console.error("Error closing service request:", error);
		  this.$toast.error("Unable to close service request");
		}
	  }
	},
	mounted() {
	  this.fetchCustomerServiceRequests();
	}
  }