// import Chart from 'chart.js/auto';  // Use 'chart.js/auto' for Chart.js v3+

export default {
	template: `
	  <div class="container mt-5">
		<h1 class="display-4 fw-bold">Admin Dashboard</h1>
		
		<div class="row mt-4">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Request Status</h5>
			  </div>
			  <div class="card-body">
				<canvas id="statusChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		  
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Requests Over Time</h5>
			  </div>
			  <div class="card-body">
				<canvas id="timelineChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		</div>
		
		<div class="row mt-4">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Top Services</h5>
			  </div>
			  <div class="card-body">
				<canvas id="servicesChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		  
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Professional Performance</h5>
			  </div>
			  <div class="card-body">
				<canvas id="professionalChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		</div>
		
		<div class="row mt-4">
		  <div class="col-12">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Recent Service Requests</h5>
			  </div>
			  <div class="card-body">
				<div class="table-responsive">
				  <table class="table table-striped">
					<thead>
					  <tr>
						<th>ID</th>
						<th>Service</th>
						<th>Customer</th>
						<th>Professional</th>
						<th>Request Date</th>
						<th>Status</th>
						<th>Actions</th>
					  </tr>
					</thead>
					<tbody>
					  <tr v-for="request in recentRequests" :key="request.id">
						<td>{{ request.id }}</td>
						<td>{{ request.service_name }}</td>
						<td>{{ request.customer_name }}</td>
						<td>{{ request.professional_name }}</td>
						<td>{{ formatDate(request.date_of_request) }}</td>
						<td>
						  <span :class="getStatusBadgeClass(request.service_status)">
							{{ request.service_status }}
						  </span>
						</td>
						<td>
						  <button class="btn btn-sm btn-info" @click="viewDetails(request.id)">
							<i class="fas fa-eye"></i>
						  </button>
						</td>
					  </tr>
					</tbody>
				  </table>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	`,
	data() {
	  return {
		serviceRequests: [],
		recentRequests: [],
		statusChart: null,
		timelineChart: null,
		servicesChart: null,
		professionalChart: null
	  };
	},
	computed: {
	  statusCounts() {
		const counts = {
		  Assigned: 0,
		  Completed: 0,
		  Rejected: 0,
		  Pending: 0,
		  Cancelled: 0
		};
		
		this.serviceRequests.forEach(request => {
		  if (counts.hasOwnProperty(request.service_status)) {
			counts[request.service_status]++;
		  } else {
			counts[request.service_status] = 1;
		  }
		});
		
		return counts;
	  },
	  
	  serviceTypeCounts() {
		const counts = {};
		
		this.serviceRequests.forEach(request => {
		  if (counts.hasOwnProperty(request.service_name)) {
			counts[request.service_name]++;
		  } else {
			counts[request.service_name] = 1;
		  }
		});
		
		// Sort by count and take top 5
		const sortedServices = Object.entries(counts)
		  .sort((a, b) => b[1] - a[1])
		  .slice(0, 5);
		
		return {
		  labels: sortedServices.map(entry => entry[0]),
		  data: sortedServices.map(entry => entry[1])
		};
	  },
	  
	  professionalPerformance() {
		const professionals = {};
		
		this.serviceRequests.forEach(request => {
		  if (!request.professional_name) return;
		  
		  if (!professionals[request.professional_name]) {
			professionals[request.professional_name] = {
			  total: 0,
			  completed: 0
			};
		  }
		  
		  professionals[request.professional_name].total++;
		  
		  if (request.service_status === 'Completed') {
			professionals[request.professional_name].completed++;
		  }
		});
		
		const sortedProfessionals = Object.entries(professionals)
		  .sort((a, b) => b[1].completed - a[1].completed)
		  .slice(0, 5);
		
		return {
		  labels: sortedProfessionals.map(entry => entry[0]),
		  completed: sortedProfessionals.map(entry => entry[1].completed),
		  total: sortedProfessionals.map(entry => entry[1].total)
		};
	  },
	  
	  monthlyData() {
		const months = {};
		const now = new Date();
		
		// Initialize last 6 months
		for (let i = 5; i >= 0; i--) {
		  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		  const monthLabel = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear();
		  months[monthLabel] = {
			Assigned: 0,
			Completed: 0,
			Rejected: 0,
			total: 0
		  };
		}
		
		// Populate data
		this.serviceRequests.forEach(request => {
		  const requestDate = new Date(request.date_of_request);
		  const monthLabel = requestDate.toLocaleString('default', { month: 'short' }) + ' ' + requestDate.getFullYear();
		  
		  if (months[monthLabel]) {
			months[monthLabel].total++;
			
			if (months[monthLabel][request.service_status]) {
			  months[monthLabel][request.service_status]++;
			}
		  }
		});
		
		return {
		  labels: Object.keys(months),
		  datasets: {
			total: Object.values(months).map(m => m.total),
			assigned: Object.values(months).map(m => m.Assigned),
			completed: Object.values(months).map(m => m.Completed),
			rejected: Object.values(months).map(m => m.Rejected)
		  }
		};
	  }
	},
	mounted() {
	  this.fetchServiceRequests();
	},
	methods: {
	  fetchServiceRequests() {
		// Fetch data from API
		fetch('/api/service_requests',
			{
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.$store.state.auth_token}`,
				},
			}
		)
		  .then(response => response.json())
		  .then(data => {
			this.serviceRequests = data;
			this.recentRequests = [...data].sort((a, b) => {
			  return new Date(b.date_of_request) - new Date(a.date_of_request);
			}).slice(0, 10);
			this.renderCharts();
		  })
		  .catch(error => {
			console.error('Error fetching service requests:', error);
		  });
	  },
	  
	  renderCharts() {
		this.$nextTick(() => {
		  this.renderStatusChart();
		  this.renderTimelineChart();
		  this.renderServicesChart();
		  this.renderProfessionalChart();
		});
	  },
	  
	  renderStatusChart() {
		const ctx = document.getElementById('statusChart').getContext('2d');
		
		if (this.statusChart) {
		  this.statusChart.destroy();
		}
		
		const statusLabels = Object.keys(this.statusCounts);
		const statusData = Object.values(this.statusCounts);
		
		this.statusChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: {
			labels: statusLabels,
			datasets: [{
			  data: statusData,
			  backgroundColor: [
				'#28a745', // Completed - Green
				'#007bff', // Assigned - Blue
				'#dc3545', // Rejected - Red
				'#ffc107', // Pending - Yellow
				'#6c757d'  // Cancelled - Gray
			  ],
			  borderWidth: 1
			}]
		  },
		  options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
			  legend: {
				position: 'right'
			  },
			  tooltip: {
				callbacks: {
				  label: function(context) {
					const label = context.label || '';
					const value = context.raw || 0;
					const total = context.dataset.data.reduce((a, b) => a + b, 0);
					const percentage = Math.round((value / total) * 100);
					return `${label}: ${value} (${percentage}%)`;
				  }
				}
			  }
			}
		  }
		});
	  },
	  
	  renderTimelineChart() {
		const ctx = document.getElementById('timelineChart').getContext('2d');
		
		if (this.timelineChart) {
		  this.timelineChart.destroy();
		}
		
		this.timelineChart = new Chart(ctx, {
		  type: 'line',
		  data: {
			labels: this.monthlyData.labels,
			datasets: [
			  {
				label: 'Total Requests',
				data: this.monthlyData.datasets.total,
				borderColor: '#17a2b8',
				backgroundColor: 'rgba(23, 162, 184, 0.1)',
				borderWidth: 2,
				fill: true
			  },
			  {
				label: 'Completed',
				data: this.monthlyData.datasets.completed,
				borderColor: '#28a745',
				backgroundColor: 'transparent',
				borderWidth: 2,
				fill: false
			  },
			  {
				label: 'Assigned',
				data: this.monthlyData.datasets.assigned,
				borderColor: '#007bff',
				backgroundColor: 'transparent',
				borderWidth: 2,
				fill: false
			  },
			  {
				label: 'Rejected',
				data: this.monthlyData.datasets.rejected,
				borderColor: '#dc3545',
				backgroundColor: 'transparent',
				borderWidth: 2,
				fill: false
			  }
			]
		  },
		  options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
			  y: {
				beginAtZero: true,
				ticks: {
				  precision: 0
				}
			  }
			}
		  }
		});
	  },
	  
	  renderServicesChart() {
		const ctx = document.getElementById('servicesChart').getContext('2d');
		
		if (this.servicesChart) {
		  this.servicesChart.destroy();
		}
		
		this.servicesChart = new Chart(ctx, {
		  type: 'bar',
		  data: {
			labels: this.serviceTypeCounts.labels,
			datasets: [{
			  label: 'Service Requests',
			  data: this.serviceTypeCounts.data,
			  backgroundColor: 'rgba(0, 123, 255, 0.7)',
			  borderColor: 'rgba(0, 123, 255, 1)',
			  borderWidth: 1
			}]
		  },
		  options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
			  y: {
				beginAtZero: true,
				ticks: {
				  precision: 0
				}
			  }
			},
			plugins: {
			  title: {
				display: true,
				text: 'Top 5 Most Requested Services'
			  }
			}
		  }
		});
	  },
	  
	  renderProfessionalChart() {
		const ctx = document.getElementById('professionalChart').getContext('2d');
		
		if (this.professionalChart) {
		  this.professionalChart.destroy();
		}
		
		this.professionalChart = new Chart(ctx, {
		  type: 'bar',
		  data: {
			labels: this.professionalPerformance.labels,
			datasets: [
			  {
				label: 'Total Assigned',
				data: this.professionalPerformance.total,
				backgroundColor: 'rgba(108, 117, 125, 0.7)',
				borderColor: 'rgba(108, 117, 125, 1)',
				borderWidth: 1
			  },
			  {
				label: 'Completed',
				data: this.professionalPerformance.completed,
				backgroundColor: 'rgba(40, 167, 69, 0.7)',
				borderColor: 'rgba(40, 167, 69, 1)',
				borderWidth: 1
			  }
			]
		  },
		  options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
			  y: {
				beginAtZero: true,
				ticks: {
				  precision: 0
				}
			  }
			},
			plugins: {
			  title: {
				display: true,
				text: 'Top 5 Professionals by Completion Rate'
			  }
			}
		  }
		});
	  },
	  
	  formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
		  year: 'numeric',
		  month: 'short',
		  day: 'numeric'
		});
	  },
	  
	  getStatusBadgeClass(status) {
		const statusClasses = {
		  'Assigned': 'badge bg-primary',
		  'Completed': 'badge bg-success',
		  'Rejected': 'badge bg-danger',
		  'Pending': 'badge bg-warning text-dark',
		  'Cancelled': 'badge bg-secondary'
		};
		
		return statusClasses[status] || 'badge bg-info';
	  },
	  
	  viewDetails(id) {
		// Implement navigation to view details of a specific service request
		this.$router.push(`/service-request/${id}`);
	  }
	}
  };