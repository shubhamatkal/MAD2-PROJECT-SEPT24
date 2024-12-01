
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
      return this.$store.state.name.split(' ')[0]; // Extract the first name
    },
  },
  methods: {
    async loadServicesAndRequests() {
        try {
            const servicesData = await this.fetchServices();
            this.services = servicesData; // Assign resolved data
            console.log(this.services);

            const serviceRequestsData = await this.fetchServiceRequests();
            this.serviceRequests = serviceRequestsData; // Assign resolved data
            console.log(this.serviceRequests);
        } catch (error) {
            console.error("Error loading services or requests:", error);
        }
    },
    async fetchServices() {
      console.log(this.$store.state.auth_token);
      try {
        console.log('fetchServices');
        const response = await fetch('/api/services', {
          headers: {
            'Authentication-Token' : this.$store.state.auth_token,
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error fetching data:", error);
    }
    },
    async fetchServiceRequests() {
      try {
        const response = await fetch('/api/service_requests', {
          headers: {
            'Authentication-Token' : this.$store.state.auth_token
          },
        });
        return await response.json();
      } catch (error) {
        console.error("Error fetching data:", error);
    }
    },
  },
  mounted() {
    console.log('HomeCustomer mounted');

    this.loadServicesAndRequests();
  },
};
