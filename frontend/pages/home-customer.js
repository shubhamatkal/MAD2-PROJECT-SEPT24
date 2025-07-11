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
              <!-- Cancel Button for "requested" status -->
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
          
              <!-- No Button for "rated" or "cancelled" status -->
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth_token}`,
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
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth_token}`,
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

    async cancelServiceRequest(requestId) {
      try {
        const response = await fetch(`/api/service-requests/${requestId}/update-status`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth_token}`,
        },          body: JSON.stringify({ service_status: "cancelled" })
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
        },          body: JSON.stringify({ service_status: "completed" })
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
        },          body: JSON.stringify({ service_status: "rated" })
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


    async CcancelServiceRequest(requestId) {
      // For assigned requests, redirect to rating page
      if (this.serviceRequests.some(request => 
        request.id === requestId && 
        request.status.toLowerCase() === 'requested'
      )) {
        this.$router.push(`/rate/${requestId}`);
        return;
      }
    
      try {
        const response = await fetch(`/api/service_requests/${requestId}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.$store.state.auth_token}`,
        },
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