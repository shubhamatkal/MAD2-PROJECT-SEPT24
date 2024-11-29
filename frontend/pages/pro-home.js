export default {
	template: `
	  <div class="container mt-5">
		<h1 class="mb-4">Welcome to A2Z Household Services, {{ firstName }}</h1>
  
		<h2>Service Requests</h2>
		<table class="table table-striped">
		  <thead>
			<tr>
			  <th>Sr. No</th>
			  <th>Customer Name</th>
			  <th>Contact</th>
			  <th>Location</th>
			  <th>Pin Code</th>
			  <th>Actions</th>
			</tr>
		  </thead>
		  <tbody>
			<tr v-for="(request, index) in openRequests" :key="request.id">
			  <td>{{ index + 1 }}</td>
			  <td>{{ request.customer_name }}</td>
			  <td>{{ request.contact }}</td>
			  <td>{{ request.location }}</td>
			  <td>{{ request.pin_code }}</td>
			  <td>
				<button class="btn btn-success btn-sm" @click="acceptRequest(request.id)">Accept</button>
				<button class="btn btn-primary btn-sm" @click="viewRequest(request.id)">View</button>
				<button class="btn btn-danger btn-sm" @click="rejectRequest(request.id)">Reject</button>
			  </td>
			</tr>
			<tr v-if="openRequests.length === 0">
			  <td colspan="6" class="text-center">No open service requests</td>
			</tr>
		  </tbody>
		</table>
  
		<h2>Service History</h2>
		<table class="table table-striped">
		  <thead>
			<tr>
			  <th>Sr. No</th>
			  <th>Customer Name</th>
			  <th>Contact</th>
			  <th>Location</th>
			  <th>Pin Code</th>
			  <th>Closed Date</th>
			  <th>Rating</th>
			</tr>
		  </thead>
		  <tbody>
			<tr v-for="(history, index) in closedRequests" :key="history.id">
			  <td>{{ index + 1 }}</td>
			  <td>{{ history.customer_name }}</td>
			  <td>{{ history.contact }}</td>
			  <td>{{ history.location }}</td>
			  <td>{{ history.pin_code }}</td>
			  <td>{{ history.closed_date }}</td>
			  <td>{{ history.rating }}</td>
			</tr>
			<tr v-if="closedRequests.length === 0">
			  <td colspan="7" class="text-center">No service history</td>
			</tr>
		  </tbody>
		</table>
	  </div>
	`,
  
	data() {
	  return {
		openRequests: [],
		closedRequests: [],
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
		  const res = await fetch(location.origin + '/api/service_requests');
		  const data = await res.json();
		  
		  if (res.ok) {
			this.openRequests = data.filter(request => request.status === 'open' && request.professional_id === this.$store.state.user_id);
			this.closedRequests = data.filter(request => request.status === 'closed' && request.professional_id === this.$store.state.user_id);
		  } else {
			console.error(data.message || 'Failed to fetch service requests');
		  }
		} catch (error) {
		  console.error('Error fetching service requests:', error);
		}
	  },
  
	  acceptRequest(requestId) {
		alert(`Accepting request with ID: ${requestId}`);
		// Logic to handle acceptance (fetch PUT/POST call)
	  },
  
	  viewRequest(requestId) {
		alert(`Viewing request with ID: ${requestId}`);
		// Logic to handle viewing details
	  },
  
	  rejectRequest(requestId) {
		alert(`Rejecting request with ID: ${requestId}`);
		// Logic to handle rejection (fetch PUT/POST call)
	  }
	}
  };
  