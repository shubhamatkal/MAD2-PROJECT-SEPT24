export default {
  template: `
    <div class="container mt-5">
      <!-- Welcome Message -->
      <h1 class="display-4 fw-bold text-center">
        Welcome to A2Z Household Services, {{ firstName }}
      </h1>
      <p class="lead text-center">Looking for...</p>
      
      <!-- Services Section -->
      <div class="mt-4">
        <h2 class="mb-3">Available Services</h2>
        <div v-if="services.length" class="row">
          <div 
            v-for="service in services" 
            :key="service.id" 
            class="col-md-4 mb-3"
          >
            <div 
              class="card service-card" 
              @click="navigateToServiceDetail(service.id)"
              style="cursor: pointer;"
            >
              <div class="card-body">
                <h5 class="card-title">{{ service.name }}</h5>
                <p class="card-text">{{ service.description || 'Service details' }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No services available at the moment.</p>
        </div>
      </div>

      <!-- Service History Section -->
      <div class="mt-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="mb-0">Recent Service History</h2>
          <button  
            class="btn btn-outline-primary"
            @click="goToFullHistory"
          >
            View Full History
          </button>
        </div>
        
        <table v-if="displayedServiceRequests.length" class="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Service id</th>
              <th scope="col">Service Name</th>
              <th scope="col">Professional Name</th>
              <th scope="col">Phone No.</th>
              <th scope="col">Completion Date</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in displayedServiceRequests" :key="request.id">
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
        <p v-else>No service history available.</p>
      </div>
    </div>
  `,
  data() {
    return {
      services: [],
      serviceRequests: []
    };
  },
  computed: {
    firstName() {
      return this.$store.state.name.split(' ')[0];
    },
    displayedServiceRequests() {
      // Always show only first 2 entries
      return this.serviceRequests.slice(0, 2);
    }
  },
  methods: {
    async loadServicesAndRequests() {
      try {
        // Fetch services
        const servicesData = await this.fetchServices();
        this.services = servicesData;

        // Fetch service requests for specific customer
        const serviceRequestsData = await this.fetchCustomerServiceRequests();
        this.serviceRequests = serviceRequestsData;
      } catch (error) {
        console.error("Error loading services or requests:", error);
        // Optionally, show user-friendly error message
        this.$toast.error("Unable to load services and requests");
      }
    },
    async fetchServices() {
      try {
        const response = await fetch('/api/services', {
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error fetching services:", error);
        return [];
      }
    },
    async fetchCustomerServiceRequests() {
      try {
        // New API endpoint that takes customer ID
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
        return await response.json();
      } catch (error) {
        console.error("Error fetching customer service requests:", error);
        return [];
      }
    },
    async closeServiceRequest(requestId) {
      // For assigned requests, redirect to rating page
      if (this.serviceRequests.some(request => 
        request.id === requestId && 
        request.status.toLowerCase() === 'assigned'
      )) {
        this.$router.push(`/rate/${requestId}`);
        return;
      }
    
      try {
        const response = await fetch(`/api/service_requests/${requestId}/close`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.ok) {
          // Remove the closed request from the list
          this.serviceRequests = this.serviceRequests.filter(request => request.id !== requestId);
          
          // Show success message
          this.$toast.success("Service request closed successfully");
        } else {
          // Handle error scenario
          const errorData = await response.json();
          this.$toast.error(errorData.message || "Failed to close service request");
        }
      } catch (error) {
        console.error("Error closing service request:", error);
        this.$toast.error("Unable to close service request");
      }
    },
    navigateToServiceDetail(serviceId) {
      // Navigate to service detail page
      this.$router.push(`/services/${serviceId}`);
    },
    goToFullHistory() {
      // Navigate to full service history page
      this.$router.push('/cus_full_history');
    }
  },
  mounted() {
    this.loadServicesAndRequests();
  },
};