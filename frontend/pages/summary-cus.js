export default {
	template: `
	  <div class="container mt-5">
		<h1 class="display-4 fw-bold">My Service Dashboard</h1>
		
		<div class="row mt-4">
		  <div class="col-md-4">
			<div class="card text-center bg-light mb-3">
			  <div class="card-body">
				<h5 class="card-title">Total Services</h5>
				<h2 class="display-4">{{ serviceRequests.length }}</h2>
			  </div>
			</div>
		  </div>
		  
		  <div class="col-md-4">
			<div class="card text-center bg-light mb-3">
			  <div class="card-body">
				<h5 class="card-title">Completed Services</h5>
				<h2 class="display-4">{{ completedServices }}</h2>
			  </div>
			</div>
		  </div>
		  
		  <div class="col-md-4">
			<div class="card text-center bg-light mb-3">
			  <div class="card-body">
				<h5 class="card-title">Active Services</h5>
				<h2 class="display-4">{{ activeServices }}</h2>
			  </div>
			</div>
		  </div>
		</div>
		
		<div class="row mt-4">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Status Distribution</h5>
			  </div>
			  <div class="card-body">
				<canvas id="statusDistributionChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		  
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Categories</h5>
			  </div>
			  <div class="card-body">
				<canvas id="serviceCategoryChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		</div>
		
		<div class="row mt-4">
		  <div class="col-md-12">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Request Timeline</h5>
			  </div>
			  <div class="card-body">
				<canvas id="serviceTimelineChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		</div>
		
		<div class="row mt-4">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Providers</h5>
			  </div>
			  <div class="card-body">
				<canvas id="serviceProvidersChart" height="250"></canvas>
			  </div>
			</div>
		  </div>
		  
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-header bg-primary text-white">
				<h5 class="card-title mb-0">Service Completion Time</h5>
			  </div>
			  <div class="card-body" v-if="serviceRequests.length > 0">
				<canvas id="completionTimeChart" height="250"></canvas>
			  </div>
			  <div class="card-body" v-else>
				<p class="text-center">No completed services yet.</p>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	`,
	data() {
	  return {
		serviceRequests: [],
		statusChart: null,
		categoryChart: null,
		timelineChart: null,
		providersChart: null,
		completionTimeChart: null
	  };
	},
	computed: {
	  completedServices() {
		return this.serviceRequests.filter(req => 
		  req.status === 'Completed' || req.status === 'Closed'
		).length;
	  },
	  activeServices() {
		return this.serviceRequests.filter(req => 
		  req.status === 'Assigned' || req.status === 'In Progress' || req.status === 'Pending'
		).length;
	  },
	  statusDistribution() {
		const statusCounts = {};
		
		this.serviceRequests.forEach(request => {
		  if (statusCounts[request.status]) {
			statusCounts[request.status]++;
		  } else {
			statusCounts[request.status] = 1;
		  }
		});
		
		return {
		  labels: Object.keys(statusCounts),
		  data: Object.values(statusCounts)
		};
	  },
	  serviceCategoryDistribution() {
		const categoryCounts = {};
		
		this.serviceRequests.forEach(request => {
		  if (categoryCounts[request.service_name]) {
			categoryCounts[request.service_name]++;
		  } else {
			categoryCounts[request.service_name] = 1;
		  }
		});
		
		return {
		  labels: Object.keys(categoryCounts),
		  data: Object.values(categoryCounts)
		};
	  },
	  serviceProviders() {
		const providerCounts = {};
		
		this.serviceRequests.forEach(request => {
		  if (!request.professional_name) return;
		  
		  if (providerCounts[request.professional_name]) {
			providerCounts[request.professional_name]++;
		  } else {
			providerCounts[request.professional_name] = 1;
		  }
		});
		
		// Sort by count and take top 5
		const sortedProviders = Object.entries(providerCounts)
		  .sort((a, b) => b[1] - a[1])
		  .slice(0, 5);
		
		return {
		  labels: sortedProviders.map(entry => entry[0]),
		  data: sortedProviders.map(entry => entry[1])
		};
	  },
	  monthlyDistribution() {
		const monthData = {};
		
		// Initialize with last 6 months
		const now = new Date();
		for (let i = 5; i >= 0; i--) {
		  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		  const monthYear = d.toLocaleString('default', { month: 'short', year: 'numeric' });
		  monthData[monthYear] = 0;
		}
		
		// Count requests by month
		this.serviceRequests.forEach(request => {
		  // Using completion date if available, otherwise assuming it's using current date
		  const date = request.date_of_completion ? new Date(request.date_of_completion) : new Date();
		  const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
		  
		  if (monthData[monthYear] !== undefined) {
			monthData[monthYear]++;
		  }
		});
		
		return {
		  labels: Object.keys(monthData),
		  data: Object.values(monthData)
		};
	  },
	  completionTimeData() {
		// Only consider completed services
		const completedServices = this.serviceRequests.filter(req => 
		  req.status === 'Completed' || req.status === 'Closed'
		);
		
		// Group by service name
		const serviceCompletionTimes = {};
		
		completedServices.forEach(service => {
		  if (!serviceCompletionTimes[service.service_name]) {
			serviceCompletionTimes[service.service_name] = [];
		  }
		  
		  // We don't have request date in the data, so we'll use a random number for demo
		  // In a real app, you would calculate actual completion time
		  // const completionTime = (new Date(service.date_of_completion) - new Date(service.date_of_request)) / (1000 * 60 * 60 * 24);
		  const completionTime = Math.floor(Math.random() * 5) + 1; // Random 1-5 days for demo
		  serviceCompletionTimes[service.service_name].push(completionTime);
		});
		
		// Calculate average completion time for each service
		const serviceNames = Object.keys(serviceCompletionTimes);
		const avgCompletionTimes = serviceNames.map(name => {
		  const times = serviceCompletionTimes[name];
		  const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
		  return Math.round(avg * 10) / 10; // Round to 1 decimal place
		});
		
		return {
		  labels: serviceNames,
		  data: avgCompletionTimes
		};
	  }
	},
	mounted() {
	  this.fetchCustomerServiceRequests();
	},
	methods: {
	  async fetchCustomerServiceRequests() {
		try {
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
		  
		  this.serviceRequests = await response.json();
		  this.renderCharts();
		} catch (error) {
		  console.error("Error fetching service requests:", error);
		  // Assume $toast is a notification library you're using
		  if (this.$toast) {
			this.$toast.error("Unable to load service history");
		  }
		}
	  },
	  
	  renderCharts() {
		this.$nextTick(() => {
		  if (typeof Chart === 'undefined') {
			console.error('Chart.js is not loaded. Please make sure to include Chart.js library.');
			return;
		  }
		  
		  this.renderStatusDistributionChart();
		  this.renderServiceCategoryChart();
		  this.renderServiceTimelineChart();
		  this.renderServiceProvidersChart();
		  this.renderCompletionTimeChart();
		});
	  },
	  
	  renderStatusDistributionChart() {
		const ctx = document.getElementById('statusDistributionChart').getContext('2d');
		
		if (this.statusChart) {
		  this.statusChart.destroy();
		}
		
		// Color mapping for different statuses
		const statusColors = {
		  'Completed': '#28a745',
		  'Closed': '#198754',
		  'Assigned': '#007bff',
		  'In Progress': '#17a2b8',
		  'Pending': '#ffc107',
		  'Rejected': '#dc3545',
		  'Cancelled': '#6c757d'
		};
		
		// Generate colors based on status
		const backgroundColors = this.statusDistribution.labels.map(
		  status => statusColors[status] || '#6c757d'
		);
		
		this.statusChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: {
			labels: this.statusDistribution.labels,
			datasets: [{
			  data: this.statusDistribution.data,
			  backgroundColor: backgroundColors,
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
	  
	  renderServiceCategoryChart() {
		const ctx = document.getElementById('serviceCategoryChart').getContext('2d');
		
		if (this.categoryChart) {
		  this.categoryChart.destroy();
		}
		
		this.categoryChart = new Chart(ctx, {
		  type: 'pie',
		  data: {
			labels: this.serviceCategoryDistribution.labels,
			datasets: [{
			  data: this.serviceCategoryDistribution.data,
			  backgroundColor: [
				'#ff6384',
				'#36a2eb',
				'#ffce56',
				'#4bc0c0',
				'#9966ff',
				'#ff9f40',
				'#c9cbcf'
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
	  
	  renderServiceTimelineChart() {
		const ctx = document.getElementById('serviceTimelineChart').getContext('2d');
		
		if (this.timelineChart) {
		  this.timelineChart.destroy();
		}
		
		this.timelineChart = new Chart(ctx, {
		  type: 'line',
		  data: {
			labels: this.monthlyDistribution.labels,
			datasets: [{
			  label: 'Service Requests',
			  data: this.monthlyDistribution.data,
			  borderColor: '#007bff',
			  backgroundColor: 'rgba(0, 123, 255, 0.1)',
			  borderWidth: 2,
			  fill: true,
			  tension: 0.3
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
				text: 'Service Requests Over Time'
			  }
			}
		  }
		});
	  },
	  
	  renderServiceProvidersChart() {
		const ctx = document.getElementById('serviceProvidersChart').getContext('2d');
		
		if (this.providersChart) {
		  this.providersChart.destroy();
		}
		
		this.providersChart = new Chart(ctx, {
		  type: 'bar',
		  data: {
			labels: this.serviceProviders.labels,
			datasets: [{
			  label: 'Services Provided',
			  data: this.serviceProviders.data,
			  backgroundColor: 'rgba(75, 192, 192, 0.7)',
			  borderColor: 'rgba(75, 192, 192, 1)',
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
				text: 'Most Used Service Providers'
			  }
			}
		  }
		});
	  },
	  
	  renderCompletionTimeChart() {
		const ctx = document.getElementById('completionTimeChart').getContext('2d');
		
		if (this.completionTimeChart) {
		  this.completionTimeChart.destroy();
		}
		
		this.completionTimeChart = new Chart(ctx, {
		  type: 'bar',
		  data: {
			labels: this.completionTimeData.labels,
			datasets: [{
			  label: 'Average Days to Complete',
			  data: this.completionTimeData.data,
			  backgroundColor: 'rgba(255, 159, 64, 0.7)',
			  borderColor: 'rgba(255, 159, 64, 1)',
			  borderWidth: 1
			}]
		  },
		  options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
			  y: {
				beginAtZero: true,
				title: {
				  display: true,
				  text: 'Days'
				}
			  }
			},
			plugins: {
			  title: {
				display: true,
				text: 'Average Service Completion Time'
			  }
			}
		  }
		});
	  }
	}
  };