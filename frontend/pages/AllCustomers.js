export default {
	template: `
	<div>
	  <h1>All Customers</h1>
	  <div class="mb-3">
		<router-link to="/" class="btn btn-secondary">Back to Dashboard</router-link>
	  </div>
	  
	  <div class="card">
		<div class="card-header d-flex justify-content-between align-items-center">
		  <h2 class="mb-0">Customer List</h2>
		  <div>
			<input 
			  type="text" 
			  v-model="searchQuery" 
			  placeholder="Search by name or email" 
			  class="form-control"
			>
		  </div>
		</div>
		
		<div class="card-body">
		  <div v-if="loading" class="text-center py-3">
			<div class="spinner-border" role="status">
			  <span class="sr-only">Loading...</span>
			</div>
		  </div>
		  
		  <div v-else-if="customers.length === 0" class="alert alert-info">
			No customers found.
		  </div>
		  
		  <table v-else class="table table-striped">
			<thead>
			  <tr>
				<th>ID</th>
				<th>Full Name</th>
				<th>Email</th>
				<th>Phone</th>
				<th>Registration Date</th>
				<th>Status</th>
				<th>Action</th>
			  </tr>
			</thead>
			<tbody>
			  <tr v-for="customer in filteredCustomers" :key="customer.id">
				<td>{{ customer.id }}</td>
				<td>{{ customer.full_name }}</td>
				<td>{{ customer.email }}</td>
				<td>{{ customer.phone || 'N/A' }}</td>
				<td>{{ formatDate(customer.created_at) }}</td>
				<td>
				  <span 
					:class="{
					  'text-success': customer.is_active,
					  'text-danger': !customer.is_active
					}"
				  >
					{{ customer.is_active ? 'Active' : 'Blocked' }}
				  </span>
				</td>
				<td>
				  <div class="btn-group">
					<button 
					  @click="viewCustomerDetails(customer)" 
					  class="btn btn-sm btn-info"
					>
					  View
					</button>
					<button 
					  @click="toggleCustomerStatus(customer.id, !customer.is_active)" 
					  class="btn btn-sm ml-1"
					  :class="customer.is_active ? 'btn-danger' : 'btn-success'"
					>
					  {{ customer.is_active ? 'Block' : 'Unblock' }}
					</button>
				  </div>
				</td>
			  </tr>
			</tbody>
		  </table>
		</div>
	  </div>
	  
	  <!-- Customer Details Modal -->
	  <div v-if="showCustomerDetailsModal" class="modal-overlay">
		<div class="modal-content">
		  <h3>Customer Details</h3>
		  <div v-if="currentCustomer" class="customer-details">
			<p><strong>ID:</strong> {{ currentCustomer.id }}</p>
			<p><strong>Full Name:</strong> {{ currentCustomer.full_name }}</p>
			<p><strong>Email:</strong> {{ currentCustomer.email }}</p>
			<p><strong>Phone:</strong> {{ currentCustomer.phone || 'N/A' }}</p>
			<p><strong>Registration Date:</strong> {{ formatDate(currentCustomer.created_at) }}</p>
			<p><strong>Status:</strong> 
			  <span 
				:class="{
				  'text-success': currentCustomer.is_active,
				  'text-danger': !currentCustomer.is_active
				}"
			  >
				{{ currentCustomer.is_active ? 'Active' : 'Blocked' }}
			  </span>
			</p>
			
			<h4>Service Request History</h4>
			<table v-if="customerServiceRequests.length" class="table table-sm">
			  <thead>
				<tr>
				  <th>ID</th>
				  <th>Service</th>
				  <th>Professional</th>
				  <th>Date</th>
				  <th>Status</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="request in customerServiceRequests" :key="request.id">
				  <td>{{ request.id }}</td>
				  <td>{{ request.service_name }}</td>
				  <td>{{ request.professional_name }}</td>
				  <td>{{ formatDate(request.date_of_request) }}</td>
				  <td>{{ request.service_status }}</td>
				</tr>
			  </tbody>
			</table>
			<p v-else>No service requests found for this customer.</p>
		  </div>
		  <div class="modal-actions">
			<button 
			  type="button" 
			  class="btn btn-secondary" 
			  @click="closeCustomerDetailsModal"
			>
			  Close
			</button>
		  </div>
		</div>
	  </div>
	</div>
	`,
	
	data() {
	  return {
		customers: [],
		serviceRequests: [],
		loading: true,
		searchQuery: '',
		showCustomerDetailsModal: false,
		currentCustomer: null,
		customerServiceRequests: []
	  };
	},
	
	computed: {
	  filteredCustomers() {
		if (!this.searchQuery) {
		  return this.customers;
		}
		
		const query = this.searchQuery.toLowerCase();
		return this.customers.filter(customer => {
		  return customer.full_name.toLowerCase().includes(query) || 
				 customer.email.toLowerCase().includes(query);
		});
	  }
	},
	
	methods: {
	  async fetchData(endpoint) {
		try {
		  const res = await fetch(endpoint, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
		  });
		  return await res.json();
		} catch (error) {
		  console.error("Error fetching data:", error);
		  return [];
		}
	  },
	  
	  async loadCustomers() {
		this.loading = true;
		this.customers = await this.fetchData('/api/customers');
		this.serviceRequests = await this.fetchData('/api/service_requests');
		this.loading = false;
	  },
	  
	  formatDate(dateString) {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString();
	  },
	  
	  viewCustomerDetails(customer) {
		this.currentCustomer = customer;
		
		// Filter service requests for this specific customer
		this.customerServiceRequests = this.serviceRequests.filter(
		  request => request.customer_id === customer.id
		);
		
		this.showCustomerDetailsModal = true;
	  },
	  
	  closeCustomerDetailsModal() {
		this.showCustomerDetailsModal = false;
		this.currentCustomer = null;
		this.customerServiceRequests = [];
	  },
	  
	  async toggleCustomerStatus(customerId, newStatus) {
		try {
		  const response = await fetch(`/api/customers/${customerId}/toggle-status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
			body: JSON.stringify({ is_active: newStatus })
		  });
  
		  if (response.ok) {
			// Update the local customers list
			const customer = this.customers.find(c => c.id === customerId);
			if (customer) {
			  customer.is_active = newStatus;
			}
			alert(`Customer ${newStatus ? 'unblocked' : 'blocked'} successfully!`);
		  } else {
			const errorData = await response.json();
			alert(`Error: ${errorData.message || 'Failed to update customer status'}`);
		  }
		} catch (error) {
		  console.error("Error updating customer status:", error);
		  alert('An error occurred while updating customer status');
		}
	  }
	},
	
	mounted() {
	  this.loadCustomers();
	},
	
	style: `
	  <style scoped>
	  .modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	  }
	  
	  .modal-content {
		background-color: white;
		padding: 20px;
		border-radius: 5px;
		width: 80%;
		max-width: 600px;
		max-height: 80vh;
		overflow-y: auto;
	  }
	  
	  .modal-actions {
		margin-top: 20px;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
	  }
	  
	  .text-success { color: green; }
	  .text-danger { color: red; }
	  .text-warning { color: orange; }
	  
	  .btn-group {
		display: flex;
		gap: 0.5rem;
	  }
	  
	  .ml-1 {
		margin-left: 0.25rem;
	  }
	  
	  .mb-3 {
		margin-bottom: 1rem;
	  }
	  </style>
	`
  };