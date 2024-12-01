export default {
    template: `
    <div>
        <h1>Admin Home</h1>
        <h2>{{ $store.state.name }}</h2>
        <button class='btn btn-primary' @click="logout">Logout</button>
        
        <h2>Services 
            <button @click="openAddServiceModal" class="btn btn-success ml-2">Add Service</button>
        </h2>
        <ul v-if="services.length">
            <li v-for="service in services" :key="service.id" class="service-item">
                {{ service.name }} - {{ service.description }}
                <div class="service-actions">
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
                </div>
            </li>
        </ul>
        
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
        <ul v-if="professionals.length">
            <li v-for="professional in professionals" :key="professional.id">
                {{ professional.full_name }} ({{ professional.user_id }})
            </li>
        </ul>
    </div>
    `,
    
    data() {
        return {
            services: [],
            professionals: [],
            showServiceModal: false,
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
    
    methods: {
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
                
                if (response.ok) {
                    // Remove service from the list
                    this.services = this.services.filter(s => s.id !== serviceId);
                    alert('Service deleted successfully!');
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message || 'Failed to delete service'}`);
                }
            } catch (error) {
                console.error("Error deleting service:", error);
                alert('An error occurred while deleting the service');
            }
        },
        
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    },
    
    mounted() {
        this.loadAdminData();
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
    </style>
    `
};