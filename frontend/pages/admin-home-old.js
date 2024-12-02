export default {
    template: `
    <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <h2>{{ $store.state.name }}</h2>
        <button class='btn btn-primary' @click="logout">Logout</button>
        
        <!-- Services Section -->
        <div class="section">
            <h2>
                Services 
                <button @click="openAddServiceModal" class="btn btn-success ml-2">Add Service</button>
            </h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Base Price</th>
                        <th>Time Required</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="service in services" :key="service.id">
                        <td @click="openServiceDetailModal(service)">
                            <a href="#" class="id-link">{{ service.id }}</a>
                        </td>
                        <td>{{ service.name }}</td>
                        <td>{{ service.base_price }}</td>
                        <td>{{ service.time_required }} hours</td>
                        <td>
                            <button 
                                @click="openEditServiceModal(service)" 
                                class="btn btn-primary btn-sm"
                            >
                                Edit
                            </button>
                            <button 
                                @click="deleteService(service.id)" 
                                class="btn btn-danger btn-sm ml-2"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Professionals Section -->
        <div class="section">
            <h2>Professionals</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Experience</th>
                        <th>Service Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="professional in professionals" :key="professional.id">
                        <td>{{ professional.id }}</td>
                        <td>{{ professional.full_name }}</td>
                        <td>{{ professional.experience }} years</td>
                        <td>{{ professional.service_name }}</td>
                        <td>
                            <button 
                                @click="deleteProfessional(professional.id)" 
                                class="btn btn-danger btn-sm"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Service Requests Section -->
        <div class="section">
            <h2>
                Service Requests 
                <button 
                    v-if="serviceRequests.length > 5" 
                    @click="viewAllServiceRequests" 
                    class="btn btn-info ml-2"
                >
                    View All
                </button>
            </h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Assigned Professional</th>
                        <th>Service Name</th>
                        <th>Request Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in displayedServiceRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.assigned_professional }}</td>
                        <td>{{ request.service_name }}</td>
                        <td>{{ formatDate(request.request_date) }}</td>
                        <td>{{ request.status }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Service Detail Modal -->
        <div v-if="selectedService" class="modal-overlay">
            <div class="modal-content">
                <h3>Service Details</h3>
                <div class="service-details">
                    <p><strong>ID:</strong> {{ selectedService.id }}</p>
                    <p><strong>Name:</strong> {{ selectedService.name }}</p>
                    <p><strong>Base Price:</strong> {{ selectedService.base_price }}</p>
                    <p><strong>Time Required:</strong> {{ selectedService.time_required }} hours</p>
                    <p><strong>Description:</strong> {{ selectedService.description }}</p>
                </div>
                <button 
                    @click="selectedService = null" 
                    class="btn btn-secondary"
                >
                    Close
                </button>
            </div>
        </div>

        <!-- Existing Service Modal (Add/Edit) from previous implementation -->
        <div v-if="showServiceModal" class="modal-overlay">
            <!-- (Keep the existing service modal implementation) -->
        </div>
    </div>
    `,
    
    data() {
        return {
            services: [],
            professionals: [],
            serviceRequests: [],
            showServiceModal: false,
            selectedService: null,
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
        displayedServiceRequests() {
            return this.serviceRequests.slice(0, 5);
        }
    },
    
    methods: {



        async fetchData() {
            try {
                const res = await fetch('/api/services', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    }
                });
                this.services = await res.json();
                console.log(this.services);
                const res2 = await fetch('/api/professionals', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    }
                });
                this.professionals = await res2.json();
                console.log(this.professionals);
                const res3 = await fetch('/api/service_requests', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    }
                });
                this.serviceRequests = await res3.json();
                console.log(this.serviceRequests);

                // Fetch all required data
        //         const [servicesRes, professionalsRes, requestsRes] = await Promise.all([
        //             fetch('/api/services', {
        //                 headers: {
        //                     'Authentication-Token': this.$store.state.auth_token,
        //                 }
        //             }),
        //             fetch('/api/professionals', {
        //                 headers: {
        //                     'Authentication-Token': this.$store.state.auth_token,
        //                 }
        //             }),
        //             fetch('/api/service-requests', {
        //                 headers: {
        //                     'Authentication-Token': this.$store.state.auth_token,
        //                 }
        //             })
        //         ]);

        // // Add error checking for the responses
        // if (!servicesRes.ok || !professionalsRes.ok || !requestsRes.ok) {
        //     throw new Error('One or more API requests failed');
        // }

        // console.log("done fetching");

        // // Use Promise.all to parse JSON responses concurrently
        // const [services, professionals, serviceRequests] = await [
        //     servicesRes.json(),
        //     professionalsRes.json(),
        //     requestsRes.json()
        // ];

        // this.services = services;
        // this.professionals = professionals;
        // this.serviceRequests = serviceRequests;

        console.log('Fetched data:', this.services, this.professionals, this.serviceRequests);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        
        openServiceDetailModal(service) {
            this.selectedService = service;
        },
        
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        },
        
        viewAllServiceRequests() {
            // Implement navigation to full service requests page
            this.$router.push('/service-requests');
        },
        
        async deleteProfessional(professionalId) {
            if (!confirm('Are you sure you want to delete this professional?')) return;
            
            try {
                const response = await fetch(`/api/professionals/${professionalId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    }
                });
                
                if (response.ok) {
                    this.professionals = this.professionals.filter(p => p.id !== professionalId);
                    alert('Professional deleted successfully!');
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message || 'Failed to delete professional'}`);
                }
            } catch (error) {
                console.error("Error deleting professional:", error);
                alert('An error occurred while deleting the professional');
            }
        },
        
        // Keep other existing methods like openAddServiceModal, submitService, etc.
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    },
    
    mounted() {
        this.fetchData();
        console.log("mounted");
        console.log("below is servces")
        console.log(this.services);
        console.log("below is professionals")
        console.log(this.professionals);
        console.log("below is serviceRequests")
        console.log(this.serviceRequests);

    },
    style: `
    <style scoped>
    .admin-dashboard {
        padding: 20px;
    }
    
    .section {
        margin-bottom: 30px;
    }
    
    .table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
    }
    
    .table th, .table td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
    }
    
    .table th {
        background-color: #f2f2f2;
        font-weight: bold;
    }
    
    .id-link {
        color: blue;
        text-decoration: underline;
        cursor: pointer;
    }
    
    .btn {
        padding: 8px 15px;
        margin: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .btn-primary {
        background-color: #007bff;
        color: white;
    }
    
    .btn-success {
        background-color: #28a745;
        color: white;
    }
    
    .btn-danger {
        background-color: #dc3545;
        color: white;
    }
    
    .btn-info {
        background-color: #17a2b8;
        color: white;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 0.8em;
    }
    
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
        border-radius: 8px;
        width: 50%;
        max-width: 500px;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .service-details p {
        margin: 10px 0;
    }
    </style>
    `
};