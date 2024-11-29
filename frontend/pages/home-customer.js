
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
        <div v-if="services.length">
          <ul class="list-group">
            <li class="list-group-item" v-for="service in services" :key="service.id">
              {{ service.name }}
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No services available at the moment.</p>
        </div>
      </div>

      <!-- Service History Section -->
      <div class="mt-5">
        <h2 class="mb-3">Service History</h2>
        <table v-if="serviceRequests.length" class="table table-bordered">
          <thead>
            <tr>
              <th scope="col">Sr. No</th>
              <th scope="col">Service Name</th>
              <th scope="col">Professional Name</th>
              <th scope="col">Phone No.</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(request, index) in serviceRequests" :key="request.id">
              <td>{{ index + 1 }}</td>
              <td>{{ request.service_name }}</td>
              <td>{{ request.professional_name }}</td>
              <td>{{ request.phone }}</td>
              <td>{{ request.status }}</td>
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
      serviceRequests: [],
    };
  },
  computed: {
    firstName() {
      return store.state.name.split(' ')[0]; // Extract the first name
    },
  },
  methods: {
    async fetchServices() {
      try {
        const response = await fetch('/api/services', {
          method: 'GET',
          headers: {
            'Authentication-Token' : this.$store.state.auth_token
          },
        });
        if (!response.ok) {
          throw new Error('Error fetching services');
        }
        const data = await response.json();
        this.services = data;
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    },
    async fetchServiceRequests() {
      try {
        const response = await fetch('/api/service_requests', {
          method: 'GET',
          headers: {
            'Authentication-Token' : this.$store.state.auth_token
          },
        });
        if (!response.ok) {
          throw new Error('Error fetching service requests');
        }
        const data = await response.json();
        this.serviceRequests = data.map((request) => ({
          ...request,
          service_name: request.service.name,
          professional_name: request.professional.name,
          phone: request.professional.phone,
          status: request.service_status,
        }));
      } catch (error) {
        console.error('Error fetching service requests:', error);
      }
    },
  },
  mounted() {
    this.fetchServices();
    this.fetchServiceRequests();
  },
};
