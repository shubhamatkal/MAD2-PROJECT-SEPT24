export default {
	template: `
	  <div class="container mt-5">
		<h1 class="display-4 fw-bold text-center mb-4">Service History</h1>
  
		<div v-if="serviceRequests.length">
		  <table class="table table-bordered table-striped">
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
				<td>{{ index + 1 }}</td>
				<td>{{ request.service_name || 'N/A' }}</td>
				<td>{{ request.professional_name || 'N/A' }}</td>
				<td>{{ request.phone || 'N/A' }}</td>
				<td>{{ request.date_of_completion || 'N/A' }}</td>
				<td>{{ request.status }}</td>
				<td>
				  <!-- Cancel Button (If Status is Assigned or Pending) -->
				  <button 
				  v-if="request.status.toLowerCase() === 'requested'" 
				  @click="cancelServiceRequest(request.id)" 
				  class="btn btn-sm btn-outline-warning"
				>
				  Cancel
				</button>
			
				<!-- Mark as Completed Button for "pending" status -->
				<button 
				  v-if="request.status.toLowerCase() === 'pending'" 
				  @click="markAsCompleted(request.id)" 
				  class="btn btn-sm btn-outline-success"
				>
				  Mark as Completed
				</button>
				<button 
				v-if="request.status.toLowerCase() === 'assigned'" 
				@click="markAsCompleted(request.id)" 
				class="btn btn-sm btn-outline-success"
			  >
				Mark as Completed
			  </button>
			
				<!-- Rate Button for "completed" status -->
				<button 
				v-if="request.status.toLowerCase() === 'completed'" 
				@click="$router.push({ path: '/rate/' + request.id })"
				class="btn btn-sm btn-outline-primary"
			  >
				Rate
			  </button>
				</td>
			  </tr>
			</tbody>
		  </table>
		</div>
  
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
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
			body: JSON.stringify({
			  customer_id: this.$store.state.user_id
			})
		  });
  
		  this.serviceRequests = await response.json();
		} catch (error) {
		  console.error("Error fetching service requests:", error);
		  this.$toast.error("Unable to load service history");
		}
	  },

	  async cancelServiceRequest(requestId) {
		try {
		  const response = await fetch(`/api/service-requests/${requestId}/update-status`, {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
			body: JSON.stringify({ service_status: "cancelled" })
		  });
		  const data = await response.json();
		  if (response.ok) {
			alert("Service request cancelled successfully.");
			this.refreshData(); // Refresh the UI
		  } else {
			alert(data.message);
		  }
		} catch (error) {
		  console.error("Error cancelling request:", error);
		}
	  },
  
	  async markAsCompleted(requestId) {
		try {
		  const response = await fetch(`/api/service-requests/${requestId}/update-status`, {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
			body: JSON.stringify({ service_status: "completed" })
		  });
		  const data = await response.json();
		  if (response.ok) {
			alert("Service request marked as completed.");
			this.refreshData(); // Refresh the UI
		  } else {
			alert(data.message);
		  }
		} catch (error) {
		  console.error("Error marking request as completed:", error);
		}
	  },
  
	  async rateServiceRequest(requestId) {
		try {
		  const response = await fetch(`/api/service-requests/${requestId}/update-status`, {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},			body: JSON.stringify({ service_status: "rated" })
		  });
		  const data = await response.json();
		  if (response.ok) {
			alert("Service request rated successfully.");
			this.refreshData(); // Refresh the UI
		  } else {
			alert(data.message);
		  }
		} catch (error) {
		  console.error("Error rating request:", error);
		}
	  },
  
	  refreshData() {
		// Fetch latest service request data
		// (Assuming there's a method to update the request list)
		this.$emit("refreshRequests");
	  },
  
  

	//   async cCancelServiceRequest(requestId) {
	// 	try {
	// 	  const response = await fetch(`/api/service_requests/${requestId}/cancel`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			'Authorization': `Bearer ${this.$store.state.auth_token}`,
	// 		},
	// 	  });
  
	// 	  if (response.ok) {
	// 		this.serviceRequests = this.serviceRequests.map(request =>
	// 		  request.id === requestId ? { ...request, status: 'Cancelled' } : request
	// 		);
	// 		this.$toast.success("Service request cancelled successfully");
	// 	  } else {
	// 		this.$toast.error("Failed to cancel service request");
	// 	  }
	// 	} catch (error) {
	// 	  console.error("Error cancelling service request:", error);
	// 	  this.$toast.error("Unable to cancel service request");
	// 	}
	//   },
  
	  async closeServiceRequest(requestId) {
		try {
		  const response = await fetch(`/api/service_requests/${requestId}/close`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
		  });
  
		  if (response.ok) {
			this.serviceRequests = this.serviceRequests.map(request =>
			  request.id === requestId ? { ...request, status: 'Closed' } : request
			);
			this.$toast.success("Service request closed successfully");
		  } else {
			this.$toast.error("Failed to close service request");
		  }
		} catch (error) {
		  console.error("Error closing service request:", error);
		  this.$toast.error("Unable to close service request");
		}
	  },
  
	  rateService(requestId) {
		this.$router.push(`/rate/${requestId}`);
	  }
	},
  
	mounted() {
	  this.fetchCustomerServiceRequests();
	}
  };
  