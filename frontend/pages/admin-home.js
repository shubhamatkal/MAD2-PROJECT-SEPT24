export default {
    template: `
    <div>
        <h1>Admin Home</h1>
        <h2> {{ $store.state.name }} </h2>
        <button class='btn btn-primary' @click="logout"> Logout </button>
        
        <h2>Services</h2>
        <ul v-if="services.length">
            <li v-for="service in services" :key="service.id">{{ service.name }} - {{ service.description }}</li>
        </ul>
    
        
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
            professionals: []
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
            }
        },
        
        async loadAdminData() {
            // Replace these URLs with your actual API endpoints
            this.services = await this.fetchData('/api/services');
            this.professionals = await this.fetchData('/api/professionals');
			console.log(this.services);
			console.log("this.professionals");
			console.log(this.professionals);
        },
        
        logout() {
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    },
    
    mounted() {
        this.loadAdminData(); // Load data when component is mounted
    }
};
