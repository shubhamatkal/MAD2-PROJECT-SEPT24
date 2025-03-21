export default {
	template: `
	  <div class="container mt-5">
		<h1 class="mb-4">Welcome to A2Z Household Services, {{ firstName }}</h1>
		
		<div class="card mb-4">
		  <div class="card-header">
			<h2 class="mb-0">New Service Requests</h2>
		  </div>
		  <div class="card-body">
			<table class="table table-striped" v-if="newServiceRequests.length > 0">
			  <thead>
				<tr>
				  <th>ID</th>
				  <th>Customer Name</th>
				  <th>Contact</th>
				  <th>Address</th>
				  <th>Pin Code</th>
				  <th>Service</th>
				  <th>Actions</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="request in newServiceRequests" :key="request.id">
				  <td>{{ request.id }}</td>
				  <td>{{ request.customer_name }}</td>
				  <td>{{ request.customer_phone || 'N/A' }}</td>
				  <td>{{ request.customer_address }}</td>
				  <td>{{ request.customer_pincode }}</td>
				  <td>{{ request.service_name }}</td>
				  <td>
					<div class="btn-group btn-group-sm" role="group">
					  <button class="btn btn-success" @click="updateServiceRequestStatus(request.id, 'assigned')">Accept</button>
					  <button class="btn btn-danger" @click="updateServiceRequestStatus(request.id, 'rejected')">Reject</button>
					</div>
				  </td>
				</tr>
			  </tbody>
			</table>
			<p v-else class="text-center text-muted">No new service requests</p>
		  </div>
		</div>
		
		<div class="card">
		  <div class="card-header d-flex justify-content-between align-items-center">
			<h2 class="mb-0">Service Request History</h2>
			<router-link to="/pro_full_history" class="btn btn-primary btn-sm">View All History</router-link>
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
					  class="btn btn-primary btn-sm" >
					  Accept from homepage
					</button>
					<button 
					v-if="history.service_status === 'assigned'" 
					class="btn btn-primary btn-sm" >
					You cant mark as completed
				  </button>
				  </td>
				</tr>
			  </tbody>
			</table>
			<p v-else class="text-center text-muted">No service history</p>
		  </div>
		</div>
	  </div>
	`,
	data() {
	  return {
		newServiceRequests: [],
		serviceHistory: [],
		firstName: ''
	  };
	},
	created() {
	  this.firstName = this.getFirstName();
	  this.fetchServiceRequests();
	},
	methods: {
	  getFirstName() {
		const fullName = this.$store.state.name;
		return fullName ? fullName.split(' ')[0] : '';
	  },
	  async fetchServiceRequests() {
		try {
		  const professionalId = this.$store.state.user_id;
		  const response = await fetch(`/api/service-requests/professional/${professionalId}`,
			{
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.$store.state.auth_token}`,
				},
			}
		  );
		  if (!response.ok) throw new Error('Failed to fetch service requests');
		  const allRequests = await response.json();
		  this.newServiceRequests = allRequests.filter(request => request.service_status === 'requested');
		  this.serviceHistory = allRequests
			.sort((a, b) => new Date(b.date_of_completion) - new Date(a.date_of_completion))
			.slice(0, 5);
		} catch (error) {
		  console.error('Error fetching service requests:', error);
		}
	  },
	  async updateServiceRequestStatus(requestId, newStatus) {
		try {
		  const response = await fetch(`/api/service-requests/${requestId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},			body: JSON.stringify({ service_status: newStatus })
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
		return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
	  }
	}
  };
  