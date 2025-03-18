export default {
	template: `
	  <div class="professionals-container p-4 max-w-6xl mx-auto">
		<h2 class="text-2xl font-bold mb-6 text-gray-800">Professionals for Service</h2>
		
		<!-- Search and Filter Controls -->
		<div class="mb-6 bg-gray-50 p-4 rounded-lg shadow-sm">
		  <div class="flex flex-wrap gap-4 mb-4">
			<!-- Search by name -->
			<div class="flex-grow min-w-64">
			  <label class="block text-sm font-medium mb-1 text-gray-700">Search by Name</label>
			  <input 
				v-model="filters.name" 
				type="text" 
				placeholder="Search professionals..." 
				class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
			  >
			</div>
			
			<!-- Pin Code Filter -->
			<div class="w-48">
			  <label class="block text-sm font-medium mb-1 text-gray-700">Pin Code</label>
			  <select 
				v-model="filters.pinCode" 
				class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
			  >
				<option value="">All Pin Codes</option>
				<option v-for="code in uniquePinCodes" :key="code" :value="code">{{ code }}</option>
			  </select>
			</div>
  
			<!-- Address Filter -->
			<div class="w-48">
			  <label class="block text-sm font-medium mb-1 text-gray-700">Address</label>
			  <select 
				v-model="filters.address" 
				class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
			  >
				<option value="">All Locations</option>
				<option v-for="address in uniqueAddresses" :key="address" :value="address">{{ address }}</option>
			  </select>
			</div>
		  </div>
		  
		  <!-- Sorting Controls -->
		  <div class="flex items-center">
			<span class="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
			<button 
			  @click="setSorting('rating')" 
			  class="px-3 py-1 mr-2 text-sm rounded-full"
			  :class="sortBy === 'rating' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
			>
			  Rating 
			  <span v-if="sortBy === 'rating'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
			</button>
			<button 
			  @click="setSorting('price')" 
			  class="px-3 py-1 mr-2 text-sm rounded-full"
			  :class="sortBy === 'price' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
			>
			  Price 
			  <span v-if="sortBy === 'price'">{{ sortDirection === 'asc' ? '↑' : '↓' }}</span>
			</button>
		  </div>
		</div>
		
		<!-- Professionals Table -->
		<div v-if="filteredProfessionals.length" class="bg-white rounded-lg shadow overflow-hidden">
		<table v-if="filteredProfessionals.length" class="table table-striped">
		<thead>
		  <tr>
			<th>ID</th>
			<th>Professional Name</th>
			<th>Base Price</th>
			<th>Avg Rating</th>
			<th>Pin Code</th>
			<th>Address</th>
			<th>Actions</th>
		  </tr>
		</thead>
		<tbody>
		  <tr v-for="professional in filteredProfessionals" :key="professional.id">
			<td>{{ professional.id }}</td>
			<td>{{ professional.name }}</td>
			<td>{{ formatPrice(professional.base_price) }}</td>
			<td>
			  <span>{{ professional.avg_rating }}</span>
			  <span class="text-yellow-400">
				<span v-for="i in 5" :key="i">
				  {{ i <= Math.round(professional.avg_rating) ? '★' : '☆' }}
				</span>
			  </span>
			</td>
			<td>{{ professional.pin_code }}</td>
			<td>{{ professional.address }}</td>
			<td>
			  <button 
				@click="bookProfessional(professional.id)"
				class="btn btn-primary"
			  >
				Book
			  </button>
			</td>
		  </tr>
		</tbody>
	  </table>
	  
		</div>
		
		<!-- No Results Message -->
		<div v-else class="bg-white p-8 text-center rounded-lg shadow">
		  <p class="text-gray-500 text-lg">No professionals found for this service.</p>
		  <p v-if="hasFilterApplied" class="mt-2 text-sm text-gray-500">
			Try adjusting your search filters to see more results.
		  </p>
		</div>
	  </div>
	`,
	data() {
	  return {
		professionals: [],
		serviceId: null,
		filters: {
		  name: '',
		  pinCode: '',
		  address: ''
		},
		sortBy: 'rating',
		sortDirection: 'desc'
	  }
	},
	created() {
	  this.serviceId = this.$route.params.serviceId;
	  this.fetchProfessionals();
	},
	computed: {
	  uniquePinCodes() {
		return [...new Set(this.professionals.map(pro => pro.pin_code))];
	  },
	  uniqueAddresses() {
		return [...new Set(this.professionals.map(pro => pro.address))];
	  },
	  filteredProfessionals() {
		let result = [...this.professionals];
		
		// Apply name filter
		if (this.filters.name) {
		  const searchTerm = this.filters.name.toLowerCase();
		  result = result.filter(pro => 
			pro.name.toLowerCase().includes(searchTerm)
		  );
		}
		
		// Apply pin code filter
		if (this.filters.pinCode) {
		  result = result.filter(pro => pro.pin_code === this.filters.pinCode);
		}
		
		// Apply address filter
		if (this.filters.address) {
		  result = result.filter(pro => pro.address === this.filters.address);
		}
		
		// Apply sorting
		result.sort((a, b) => {
		  let comparison = 0;
		  if (this.sortBy === 'rating') {
			comparison = a.avg_rating - b.avg_rating;
		  } else if (this.sortBy === 'price') {
			comparison = a.base_price - b.base_price;
		  }
		  
		  return this.sortDirection === 'asc' ? comparison : -comparison;
		});
		
		return result;
	  },
	  hasFilterApplied() {
		return this.filters.name || this.filters.pinCode || this.filters.address;
	  }
	},
	methods: {
	  async fetchProfessionals() {
		try {
		  const response = await fetch(`/api/professionals/service/${this.serviceId}`);
		  this.professionals = await response.json();
		  console.log('Professionals:', this.professionals);
		} catch (error) {
		  console.error('Error fetching professionals:', error);
		}
	  },
	  async bookProfessional(professionalId) {
		try {
		  const userId = this.getUserId();
		  console.log(userId, "this.getUserId()");
		  const response = await fetch('/api/book', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  professional_id: professionalId,
			  service_id: this.serviceId,
			  user_id: userId,
			})
		  });
		  
		  if (response.ok) {
			alert('Booking successful!');
		  } else {
			alert('Booking failed. Please try again.');
		  }
		} catch (error) {
		  console.error('Booking failed:', error);
		  alert('Booking failed. Please try again.');
		}
	  },
	  getUserId() {
		const userData = localStorage.getItem("user"); 
		if (userData) {
		  try {
			const userObj = JSON.parse(userData);
			return userObj.id || 1;  // Return actual ID or default to 1
		  } catch (error) {
			console.error("Error parsing user data:", error);
			return 1; 
		  }
		}
		return 1; // Default if no user data is found
	  },
	  setSorting(field) {
		// If clicking on the same field, toggle direction
		if (this.sortBy === field) {
		  this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
		  // If new field, set to that field with default direction
		  this.sortBy = field;
		  this.sortDirection = field === 'rating' ? 'desc' : 'asc'; // Default high rating, low price
		}
	  },
	  formatPrice(price) {
		// Format with currency symbol and 2 decimal places
		return '₹' + parseFloat(price).toFixed(2);
	  }
	}
  }