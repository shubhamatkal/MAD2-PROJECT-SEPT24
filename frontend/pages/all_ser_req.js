export default {
	template: `
	  <div>
		<h2 class="text-center mt-3">All Service Requests</h2>
		
		<!-- Search Box -->
		<div class="d-flex justify-content-end mb-3">
		  <input 
			type="text" 
			v-model="searchQuery" 
			placeholder="Search by customer, service, or professional..." 
			class="form-control" 
			style="max-width: 350px;"
		  >
		</div>
		
		<!-- Loading indicator -->
		<div v-if="loading" class="text-center py-3">
		  <div class="spinner-border" role="status">
			<span class="sr-only">Loading...</span>
		  </div>
		</div>
		
		<!-- Table with filtered results -->
		<table v-if="filteredServiceRequests.length" class="table table-striped">
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
			<tr v-for="request in filteredServiceRequests" :key="request.id">
			  <td>{{ request.id }}</td>
			  <td>{{ request.customer_name }}</td>
			  <td>{{ request.service_name }}</td>
			  <td>{{ request.professional_name }}</td>
			  <td>{{ request.date_of_request }}</td>
			  <td>{{ request.service_status }}</td>
			</tr>
		  </tbody>
		</table>
		
		<!-- No results message -->
		<div v-else-if="serviceRequests.length && !filteredServiceRequests.length" class="alert alert-info text-center mt-3">
		  No service requests found matching your search.
		</div>
		
		<!-- Empty state -->
		<div v-else-if="!loading && !serviceRequests.length" class="text-center mt-5">
		  <p>No service requests found.</p>
		</div>
	  </div>
	`,
	data() {
	  return {
		serviceRequests: [],
		searchQuery: '',
		loading: true
	  };
	},
	computed: {
	  filteredServiceRequests() {
		if (!this.searchQuery) return this.serviceRequests;
		
		const query = this.searchQuery.toLowerCase();
		return this.serviceRequests.filter(request => 
		  (request.customer_name && request.customer_name.toLowerCase().includes(query)) || 
		  (request.service_name && request.service_name.toLowerCase().includes(query)) ||
		  (request.professional_name && request.professional_name.toLowerCase().includes(query)) ||
		  (request.service_status && request.service_status.toLowerCase().includes(query)) ||
		  (request.id && request.id.toString().includes(query))
		);
	  }
	},
	methods: {
	  async fetchData(endpoint) {
		try {
		  const res = await fetch(endpoint, {
			headers: {
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
		  });
		  return await res.json();
		} catch (error) {
		  console.error('Error fetching data:', error);
		  return [];
		}
	  },
	  async loadServiceRequests() {
		this.loading = true;
		this.serviceRequests = await this.fetchData('/api/service_requests');
		this.loading = false;
	  },
	},
	mounted() {
	  this.loadServiceRequests();
	},
  };