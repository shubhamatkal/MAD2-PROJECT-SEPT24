export default {
	template: `
		<div class="card">
		<div class="card-header d-flex justify-content-between align-items-center">
		<h2 class="mb-0">Service Request History</h2>
		<router-link to="/pro_full_history" class="btn btn-primary btn-sm">
			View All History
		</router-link>
		</div>
		<div class="card-body">
		<table class="table table-striped" v-if="serviceHistory.length > 0">
			<thead>
			<tr>
				<th>ID</th>
				<th>Customer Name</th>
				<th>Contact</th>
				<th>Location</th>
				<th>Pin Code</th>
				<th>Completion Date</th>
				<th>Status</th>
				<th>Rating</th>
				<th>Action</th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="history in serviceHistory" :key="history.id">
				<td>{{ history.id }}</td>
				<td>{{ history.customer_name }}</td>
				<td>{{ history.customer_phone || 'N/A' }}</td>
				<td>{{ history.customer_address }}</td>
				<td>{{ history.customer_pincode }}</td>
				<td>{{ formatDate(history.date_of_completion) }}</td>
				<td>{{ history.service_status }}</td>
				<td>{{ history.rating || 'N/A' }}</td>
				<td>
				<button 
				  v-if="history.service_status === 'pending'" 
				  class="btn btn-primary btn-sm">
				  Accept from homepage
				</button>
				<button 
				v-if="history.service_status === 'assigned'" 
				class="btn btn-primary btn-sm">
				you cant mark as completed
			  </button>
			  </td>
			</tr>
			</tbody>
		</table>
		<p v-else class="text-center text-muted">No service history</p>
		</div>
	</div>
	`,
	data() {
		return {
		  serviceHistory: [],
		};
	  },
	created() {
		// this.firstName = this.getFirstName();
		this.fetchServiceRequests();
		console.log(this.firstName);
	},
	methods: {
		// getFirstName() {
		//   const fullName = this.$store.state.name;
		//   return fullName ? fullName.split(' ')[0] : '';
		// },
		async fetchServiceRequests() {
		  try {
			// Fetch service requests for the current professional
			const professionalId = this.$store.state.user_id;
			const response = await fetch(`/api/service-requests/professional/${professionalId}`);
			
			if (!response.ok) {
			  throw new Error('Failed to fetch service requests');
			}
			
			const allRequests = await response.json();
			console.log(allRequests, 'allRequests');
			
			// // Filter new service requests (with status 'requested')
			// this.newServiceRequests = allRequests.filter(
			//   request => request.service_status === 'Requested'
			// );
			
			// Filter and limit service history to last 5 entries
			this.serviceHistory = allRequests
			.sort((a, b) => new Date(b.date_of_completion) - new Date(a.date_of_completion));
  
			  console.log(this.serviceHistory, 'serviceHistory');
		  } catch (error) {
			console.error('Error fetching service requests:', error);
			// Optionally show error message to user
		  }
		},

		async updateServiceRequestStatus(requestId, newStatus) {
			try {
			  const response = await fetch(`/api/service-requests/${requestId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ service_status: newStatus })
			  });
			  if (!response.ok) throw new Error('Failed to update service request status');
			  this.fetchServiceRequests();
			} catch (error) {
			  console.error('Error updating service request status:', error);
			}
		  },
		  async markAsCompleted(requestId) {
			this.updateServiceRequestStatus(requestId, 'closed');
		  },
		formatDate(dateString) {
		  if (!dateString) return 'N/A';
		  return new Date(dateString).toLocaleDateString();
		}
	  }
	};