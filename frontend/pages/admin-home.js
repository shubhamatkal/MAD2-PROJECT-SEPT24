export default {
    template: `
    <div>
        <h1>Admin Home</h1>
        <h2>{{ $store.state.name }}</h2>
        <button class='btn btn-primary' @click="logout">Logout</button>
        
        <h2>Services 
            <button @click="openAddServiceModal" class="btn btn-success ml-2">Add Service</button>
        </h2>
        <table v-if="services.length" class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Time Required (hours)</th>
            <th>Base Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>
              <a href="#" @click.prevent="openServiceDetailsModal(service)">
                {{ service.id }}
              </a>
            </td>
            <td>{{ service.name }}</td>
            <td>{{ service.time_required }}</td>
            <td>{{ service.price }}</td>
            <td>
              <button 
                @click="openEditServiceModal(service)" 
                class="btn btn-primary btn-sm"
              >
                Edit
              </button>
              <button 
                @click="deleteService(service.id)" 
                class="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Service Details Modal -->
      <div v-if="showServiceDetailsModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Service Details</h3>
          <div v-if="currentService" class="service-details">
            <p><strong>ID:</strong> {{ currentService.id }}</p>
            <p><strong>Name:</strong> {{ currentService.name }}</p>
            <p><strong>Base Price:</strong> {{ currentService.price }}</p>
            <p><strong>Time Required:</strong> {{ currentService.time_required }} hours</p>
            <p><strong>Description:</strong> {{ currentService.description }}</p>
            
            <h4>Professionals for this Service</h4>
            <table v-if="professionalsForService.length" class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prof in professionalsForService" :key="prof.id">
                  <td>{{ prof.id }}</td>
                  <td>{{ prof.full_name }}</td>
                  <td>{{ prof.experience }} years</td>
                  <td>
                    <span 
                      :class="{
                        'text-warning': prof.is_approved === 0,
                        'text-success': prof.is_approved === 1,
                        'text-danger': prof.is_approved === -1
                      }"
                    >
                      {{ getStatusText(prof.is_approved) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else>No professionals found for this service.</p>
          </div>
          <div class="modal-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeServiceDetailsModal"
            >
              Close
            </button>
          </div>
        </div>
      </div>

        <!-- Service Modal (Add/Edit) -->
        <div v-if="showServiceModal" class="modal-overlay">
            <div class="modal-content">
                <h3>{{ isEditMode ? 'Edit Service' : 'Add Service' }}</h3>
                <form @submit.prevent="submitService">
                    <div class="form-group">
                        <label>Name</label>
                        <input 
                            v-model="currentService.name" 
                            type="text" 
                            class="form-control" 
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label>Base Price</label>
                        <input 
                            v-model="currentService.base_price" 
                            type="number" 
                            class="form-control" 
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label>Time Required (hours)</label>
                        <input 
                            v-model="currentService.time_required" 
                            type="number" 
                            class="form-control" 
                            required
                        >
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea 
                            v-model="currentService.description" 
                            class="form-control" 
                            required
                        ></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="submit" class="btn btn-primary">
                            {{ isEditMode ? 'Update' : 'Submit' }}
                        </button>
                        <button 
                            type="button" 
                            class="btn btn-secondary" 
                            @click="closeModal"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <h2>Professionals</h2>
        <table v-if="professionals.length" class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Experience (years)</th>
            <th>Service</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="professional in professionals" :key="professional.id">
            <td>
              <a href="#" @click.prevent="openProfessionalDetailsModal(professional)">
                {{ professional.id }}
              </a>
            </td>
            <td>{{ professional.full_name }}</td>
            <td>{{ professional.experience }}</td>
            <td>{{ professional.service_name }}</td>
            <td>
              <span 
                :class="{
                  'text-warning': professional.is_approved === 0,
                  'text-success': professional.is_approved === 1,
                  'text-danger': professional.is_approved === -1
                }"
              >
                {{ getStatusText(professional.is_approved) }}
              </span>
            </td>
            <td>
  <div class="btn-group">
    <button 
      class="btn btn-sm btn-danger" 
      @click="confirmDeleteProfessional(professional.id)"
    >
      Delete
    </button>
    
    <template v-if="professional.is_approved === 0">
      <button 
        class="btn btn-sm btn-success ml-1" 
        @click="updateProfessionalStatus(professional.id, 1)"
      >
        Approve
      </button>
      <button 
        class="btn btn-sm btn-warning ml-1" 
        @click="confirmDeleteProfessional(professional.id)"
      >
        Reject
      </button>
    </template>
    
    <!-- Add Block/Unblock button -->
    <template v-if="professional.is_approved === 1">
      <button 
        class="btn btn-sm btn-secondary ml-1" 
        @click="blockUnblockProfessional(professional.id, 2)"
      >
        Block
      </button>
    </template>
    <template v-if="professional.is_approved === 2">
      <button 
        class="btn btn-sm btn-info ml-1" 
        @click="blockUnblockProfessional(professional.id, 1)"
      >
        Unblock
      </button>
    </template>
  </div>
</td>
          </tr>
        </tbody>
      </table>

      <!-- Professional Details Modal -->
      <div v-if="showProfessionalDetailsModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Professional Details</h3>
          <div v-if="currentProfessional" class="professional-details">
            <p><strong>ID:</strong> {{ currentProfessional.id }}</p>
            <p><strong>Full Name:</strong> {{ currentProfessional.full_name }}</p>
            <p><strong>Email:</strong> {{ currentProfessional.email }}</p>
            <p><strong>Phone:</strong> {{ currentProfessional.phone }}</p>
            <p><strong>Experience:</strong> {{ currentProfessional.experience }} years</p>
            <p><strong>Service:</strong> {{ currentProfessional.service_name }}</p>
            <p><strong>Status:</strong> 
              <span 
                :class="{
                  'text-warning': currentProfessional.is_approved === 0,
                  'text-success': currentProfessional.is_approved === 1,
                  'text-danger': currentProfessional.is_approved === -1
                }"
              >
                {{ getStatusText(currentProfessional.is_approved) }}
              </span>
            </p>
            <p><strong>Qualifications:</strong> {{ currentProfessional.qualifications }}</p>
          </div>
          <div class="modal-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeProfessionalDetailsModal"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <h2>Service Requests</h2>
      <table v-if="visibleServiceRequests.length" class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Customer</th>
          <th>Service</th>
          <th>Professional</th>
          <th>Date of request</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in visibleServiceRequests" :key="request.id">
          <td>{{ request.id }}</td>
          <td>{{ request.customer_name }}</td>    
          <td>{{ request.service_name }}</td>
          <td>{{ request.professional_name }}</td>
          <td>{{ request.date_of_request }}</td>
          <td>{{ request.service_status }}</td>
        </tr>
      </tbody>
    </table>
    <!-- Button to view all service requests -->
    <div  class="text-center mt-3">
    <router-link to="/all-service-requests" class="btn btn-secondary">
        View All Requests
    </router-link>
    </div>

      <h2>Customers</h2>
  <table v-if="customers.length" class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Full Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="customer in visibleCustomers" :key="customer.id">
        <td>{{ customer.id }}</td>
        <td>{{ customer.full_name }}</td>
        <td>{{ customer.email }}</td>
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
          <button 
            @click="toggleCustomerStatus(customer.id, !customer.is_active)" 
            class="btn btn-sm"
            :class="customer.is_active ? 'btn-danger' : 'btn-success'"
          >
            {{ customer.is_active ? 'Block' : 'Unblock' }}
          </button>
        </td>
      </tr>
    </tbody>
  </table>
  <!-- Button to view all customers -->
  <div class="text-center mt-3">
    <router-link to="/all-customers" class="btn btn-secondary">
      View All Customers
    </router-link>
  </div>

    </div>
    `,
    
    data() {
      return {
        services: [],
        serviceRequests: [],
        professionals: [],
        customers: [], // Add this line
        showServiceModal: false,
        showProfessionalDetailsModal: false,
        showServiceDetailsModal: false,
        professionalsForService: [],
        currentProfessional: null,
        isEditMode: false,
        currentService: {
            id: null,
            name: '',
            base_price: null,
            time_required: null,
            description: ''
        }
    };
    },
    
    computed: {
        visibleServiceRequests() {
          // Show only the top 2 entries
          return this.serviceRequests.slice(0, 2);
        },
        visibleCustomers() {
          // Show only the top 5 customers
          return this.customers.slice(0, 5);
        },
      },

    methods: {

      getStatusText(isApproved) {
        switch(isApproved) {
            case 0: return 'Pending';
            case 1: return 'Approved';
            case 2: return 'Blocked';
            case -1: return 'Rejected';
            default: return 'Unknown';
        }
    },

        getStatusText(isApproved) {
            switch(isApproved) {
                case 0: return 'Pending';
                case 1: return 'Approved';
                case -1: return 'Rejected';
                default: return 'Unknown';
            }
        },

        async blockUnblockProfessional(id, status) {
          try {
              const response = await fetch(`/api/blockprofessional/${id}`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': this.$store.state.auth_token,
                  },
                  body: JSON.stringify({ is_approved: status })
              });
      
              if (response.ok) {
                  // Update the local professionals list
                  const professional = this.professionals.find(p => p.id === id);
                  if (professional) {
                      professional.is_approved = status;
                  }
                  alert(`Professional ${status === 2 ? 'blocked' : 'unblocked'} successfully!`);
              } else {
                  const errorData = await response.json();
                  alert(`Error: ${errorData.message || 'Failed to update professional status'}`);
              }
          } catch (error) {
              console.error("Error updating professional status:", error);
              alert('An error occurred while updating professional status');
          }
      },

        async updateProfessionalStatus(id, status) {
            try {
                const response = await fetch(`/api/professionals/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({ is_approved: status })
                });

                if (response.ok) {
                    // Update the local professionals list
                    const professional = this.professionals.find(p => p.id === id);
                    if (professional) {
                        professional.is_approved = status;
                    }
                    alert('Professional status updated successfully!');
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message || 'Failed to update professional status'}`);
                }
            } catch (error) {
                console.error("Error updating professional status:", error);
                alert('An error occurred while updating professional status');
            }
        },


        openProfessionalDetailsModal(professional) {
            this.currentProfessional = professional;
            this.showProfessionalDetailsModal = true;
        },

        closeProfessionalDetailsModal() {
            this.showProfessionalDetailsModal = false;
            this.currentProfessional = null;
        },



        openServiceDetailsModal(service) {
            this.currentService = service;
            
            // Filter professionals for this specific service
            this.professionalsForService = this.professionals.filter(
                prof => prof.service_name === service.name
            );
            
            this.showServiceDetailsModal = true;
        },
        
        closeServiceDetailsModal() {
            this.showServiceDetailsModal = false;
            this.currentService = null;
            this.professionalsForService = [];
        },


        confirmDeleteProfessional(id) {
            if (confirm('Are you sure you want to delete this professional?')) {
                this.deleteProfessional(id);
            }
        },

        async deleteProfessional(id) {
          if (!confirm('Are you sure you want to delete this professional?')) return;
      
          try {
              const response = await fetch(`/api/professionals/${id}`, {
                  method: 'DELETE',
                  headers: {
                      'Authentication-Token': this.$store.state.auth_token,
                  }
              });
      
              const responseData = await response.json();
      
              if (response.ok) {
                  // Remove professional from the list
                  this.professionals = this.professionals.filter(p => p.id !== id);
                  alert('Professional deleted successfully!');
              } else {
                  alert(`Error: ${responseData.message || 'Failed to delete professional'}`);
              }
          } catch (error) {
              console.error("Error deleting professional:", error);
              alert('An error occurred while deleting the professional');
          }
      },

        async fetchData(endpoint) {
            try {
                const res = await fetch(endpoint, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    }
                });
                return await res.json();
            } catch (error) {
                console.error("Error fetching data:", error);
                return [];
            }
        },
        
        async loadAdminData() {
            this.services = await this.fetchData('/api/services');
            this.professionals = await this.fetchData('/api/professionals');
            this.serviceRequests = await this.fetchData('/api/service_requests');
        },
        
        openAddServiceModal() {
            this.isEditMode = false;
            this.currentService = {
                id: null,
                name: '',
                base_price: null,
                time_required: null,
                description: ''
            };
            this.showServiceModal = true;
        },
        
        openEditServiceModal(service) {
            this.isEditMode = true;
            this.currentService = { ...service };
            this.showServiceModal = true;
        },
        
        closeModal() {
            this.showServiceModal = false;
            this.isEditMode = false;
            this.currentService = {
                id: null,
                name: '',
                base_price: null,
                time_required: null,
                description: ''
            };
        },
        
        async submitService() {
            try {
                const url = this.isEditMode 
                    ? `/api/services/${this.currentService.id}` 
                    : '/api/services';
                
                const method = this.isEditMode ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify(this.currentService)
                });
                
                if (response.ok) {
                    const serviceData = await response.json();
                    
                    if (this.isEditMode) {
                        // Update existing service in the list
                        const index = this.services.findIndex(s => s.id === serviceData.id);
                        if (index !== -1) {
                            this.services.splice(index, 1, serviceData);
                        }
                    } else {
                        // Add new service to the list
                        this.services.push(serviceData);
                    }
                    
                    this.closeModal();
                    alert(`Service ${this.isEditMode ? 'updated' : 'added'} successfully!`);
                } else {
                    // Handle error response
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message || 'Failed to process service'}`);
                }
            } catch (error) {
                console.error("Error processing service:", error);
                alert('An error occurred while processing the service');
            }
        },
        
        async deleteService(serviceId) {
          if (!confirm('Are you sure you want to delete this service?')) return;
      
          try {
              const response = await fetch(`/api/services/${serviceId}`, {
                  method: 'DELETE',
                  headers: {
                      'Authentication-Token': this.$store.state.auth_token,
                  }
              });
      
              const data = await response.json(); // Ensure parsing works correctly
      
              if (response.ok) {
                  // Remove service from the list
                  this.services = this.services.filter(s => s.id !== serviceId);
                  alert('Service deleted successfully!');
              } else {
                  // Show error message
                  alert(`Error: ${data.message || 'Failed to delete service'}`);
              }
          } catch (error) {
              console.error("Error deleting service:", error);
              alert('An error occurred while deleting the service');
          }
      },
        
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        },
        async loadAdminData() {
          this.services = await this.fetchData('/api/services');
          this.professionals = await this.fetchData('/api/professionals');
          this.serviceRequests = await this.fetchData('/api/service_requests');
          this.customers = await this.fetchData('/api/customers'); // Add this line
      },
      
      async toggleCustomerStatus(customerId, newStatus) {
          try {
              const response = await fetch(`/api/customers/${customerId}/toggle-status`, {
                  method: 'PATCH',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authentication-Token': this.$store.state.auth_token,
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
      },
    },
    
    mounted() {
        this.loadAdminData();
        console.log("this is services", this.services);
    },
    style: `
        <style scoped>
    .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #eee;
    }

    .service-actions {
        display: flex;
        gap: 10px;
    }

    .btn-sm {
        padding: 5px 10px;
        font-size: 0.8em;
    }

    .btn-primary {
        background-color: #007bff;
        color: white;
    }

    .btn-danger {
        background-color: #dc3545;
        color: white;
    }

    .text-warning { color: orange; }
    .text-success { color: green; }
    .text-danger { color: red; }

    .btn-group {
        display: flex;
        gap: 0.5rem;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
  }
  
  .btn-info {
      background-color: #17a2b8;
      color: white;
  }
  
  .ml-1 {
      margin-left: 0.25rem;
  }



    </style>
    `
};