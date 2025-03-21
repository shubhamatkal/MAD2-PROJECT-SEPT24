export default {
	template: `
	  <div class="container mt-5">
		<h1 class="display-4 fw-bold">Professional Summary</h1>
  
		<!-- Stats Row -->
		<div class="row mt-4 g-4">
		  <div class="col-md-3">
			<div class="card bg-primary text-white">
			  <div class="card-body text-center">
				<h5 class="card-title">Total Services</h5>
				<h2>{{ serviceHistory.length }}</h2>
			  </div>
			</div>
		  </div>
		  <div class="col-md-3">
			<div class="card bg-success text-white">
			  <div class="card-body text-center">
				<h5 class="card-title">Completed</h5>
				<h2>{{ completedCount }}</h2>
			  </div>
			</div>
		  </div>
		  <div class="col-md-3">
			<div class="card bg-warning text-dark">
			  <div class="card-body text-center">
				<h5 class="card-title">In Progress</h5>
				<h2>{{ inProgressCount }}</h2>
			  </div>
			</div>
		  </div>
		  <div class="col-md-3">
			<div class="card bg-info text-white">
			  <div class="card-body text-center">
				<h5 class="card-title">Avg. Completion</h5>
				<h2>{{ avgCompletionDays }} days</h2>
			  </div>
			</div>
		  </div>
		</div>
  
		<!-- Charts Row -->
		<div class="row mt-4 g-4">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Service Status</h5>
				<canvas id="statusChart" ref="statusChart"></canvas>
			  </div>
			</div>
		  </div>
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Monthly Requests</h5>
				<canvas id="monthlyChart" ref="monthlyChart"></canvas>
			  </div>
			</div>
		  </div>
		</div>
  
		<!-- Additional Charts Row -->
		<div class="row mt-4 g-4 mb-5">
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Service Types</h5>
				<canvas id="serviceTypeChart" ref="serviceTypeChart"></canvas>
			  </div>
			</div>
		  </div>
		  <div class="col-md-6">
			<div class="card">
			  <div class="card-body">
				<h5 class="card-title">Recent Performance</h5>
				<canvas id="performanceChart" ref="performanceChart"></canvas>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	`,
	data() {
	  return {
		serviceHistory: [],
		charts: {
		  statusChart: null,
		  monthlyChart: null,
		  serviceTypeChart: null,
		  performanceChart: null
		}
	  };
	},
	computed: {
	  completedCount() {
		return this.serviceHistory.filter(item => item.service_status === 'Completed').length;
	  },
	  inProgressCount() {
		return this.serviceHistory.filter(item => item.service_status === 'In Progress').length;
	  },
	  avgCompletionDays() {
		const completed = this.serviceHistory.filter(item => 
		  item.service_status === 'Completed' && item.date_of_request && item.date_of_completion
		);
		
		if (completed.length === 0) return 0;
		
		const totalDays = completed.reduce((sum, item) => {
		  const requestDate = new Date(item.date_of_request);
		  const completionDate = new Date(item.date_of_completion);
		  const days = Math.ceil((completionDate - requestDate) / (1000 * 60 * 60 * 24));
		  return sum + days;
		}, 0);
		
		return Math.round(totalDays / completed.length);
	  }
	},
	methods: {
	  async fetchServiceRequests() {
		try {
		  const professionalId = this.$store.state.user_id;
		  const response = await fetch(`/api/service-requests/professional/${professionalId}`,
			{
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.$store.state.auth_token}`,
				},
			}
		  );
		  
		  if (!response.ok) {
			throw new Error('Failed to fetch service requests');
		  }
		  
		  const allRequests = await response.json();
		  console.log(allRequests, 'allRequests');
		  
		  this.serviceHistory = allRequests
			.sort((a, b) => new Date(b.date_of_completion) - new Date(a.date_of_completion));
		  
		  console.log(this.serviceHistory, 'serviceHistory');
		  
		  this.$nextTick(() => {
			this.renderCharts();
		  });
		} catch (error) {
		  console.error('Error fetching service requests:', error);
		}
	  },
	  renderCharts() {
		this.renderStatusChart();
		this.renderMonthlyChart();
		this.renderServiceTypeChart();
		this.renderPerformanceChart();
	  },
	  renderStatusChart() {
		const ctx = this.$refs.statusChart.getContext('2d');
		
		// Count services by status
		const statusCounts = {
		  'Completed': this.completedCount,
		  'In Progress': this.inProgressCount,
		  'Requested': this.serviceHistory.filter(item => item.service_status === 'Requested').length,
		  'Cancelled': this.serviceHistory.filter(item => item.service_status === 'Cancelled').length
		};
		
		this.charts.statusChart = new Chart(ctx, {
		  type: 'pie',
		  data: {
			labels: Object.keys(statusCounts),
			datasets: [{
			  data: Object.values(statusCounts),
			  backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545']
			}]
		  },
		  options: {
			responsive: true,
			plugins: {
			  legend: {
				position: 'bottom'
			  }
			}
		  }
		});
	  },
	  renderMonthlyChart() {
		const ctx = this.$refs.monthlyChart.getContext('2d');
		
		// Group requests by month
		const monthlyData = {};
		const now = new Date();
		
		// Initialize for the last 6 months
		for (let i = 5; i >= 0; i--) {
		  const d = new Date(now);
		  d.setMonth(now.getMonth() - i);
		  const monthName = d.toLocaleString('default', { month: 'short' });
		  monthlyData[monthName] = 0;
		}
		
		// Count requests by month
		this.serviceHistory.forEach(item => {
		  if (item.date_of_request) {
			const requestDate = new Date(item.date_of_request);
			const monthName = requestDate.toLocaleString('default', { month: 'short' });
			
			// Only count if it's within the last 6 months
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(now.getMonth() - 5);
			
			if (requestDate >= sixMonthsAgo) {
			  monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;
			}
		  }
		});
		
		this.charts.monthlyChart = new Chart(ctx, {
		  type: 'bar',
		  data: {
			labels: Object.keys(monthlyData),
			datasets: [{
			  label: 'Service Requests',
			  data: Object.values(monthlyData),
			  backgroundColor: '#007bff'
			}]
		  },
		  options: {
			responsive: true,
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
	  renderServiceTypeChart() {
		const ctx = this.$refs.serviceTypeChart.getContext('2d');
		
		// Count services by type
		const serviceTypes = {};
		this.serviceHistory.forEach(item => {
		  serviceTypes[item.service_name] = (serviceTypes[item.service_name] || 0) + 1;
		});
		
		// Get top services (if more than 5, group the rest as "Other")
		let sortedServices = Object.entries(serviceTypes)
		  .sort((a, b) => b[1] - a[1]);
		
		let labels, data, backgroundColor;
		
		if (sortedServices.length > 5) {
		  const topServices = sortedServices.slice(0, 4);
		  const otherCount = sortedServices.slice(4).reduce((sum, item) => sum + item[1], 0);
		  
		  labels = [...topServices.map(item => item[0]), 'Other'];
		  data = [...topServices.map(item => item[1]), otherCount];
		  backgroundColor = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#858796'];
		} else {
		  labels = sortedServices.map(item => item[0]);
		  data = sortedServices.map(item => item[1]);
		  backgroundColor = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#858796'];
		}
		
		this.charts.serviceTypeChart = new Chart(ctx, {
		  type: 'doughnut',
		  data: {
			labels: labels,
			datasets: [{
			  data: data,
			  backgroundColor: backgroundColor
			}]
		  },
		  options: {
			responsive: true,
			plugins: {
			  legend: {
				position: 'bottom'
			  }
			}
		  }
		});
	  },
	  renderPerformanceChart() {
		const ctx = this.$refs.performanceChart.getContext('2d');
		
		// Get completion time for the last 10 completed services
		const completedServices = this.serviceHistory
		  .filter(item => 
			item.service_status === 'Completed' && 
			item.date_of_request && 
			item.date_of_completion
		  )
		  .slice(0, 10)
		  .reverse();
		
		const labels = completedServices.map((_, index) => `Service ${index + 1}`);
		const completionDays = completedServices.map(item => {
		  const requestDate = new Date(item.date_of_request);
		  const completionDate = new Date(item.date_of_completion);
		  return Math.ceil((completionDate - requestDate) / (1000 * 60 * 60 * 24));
		});
		
		this.charts.performanceChart = new Chart(ctx, {
		  type: 'line',
		  data: {
			labels: labels,
			datasets: [{
			  label: 'Completion Time (days)',
			  data: completionDays,
			  borderColor: '#e74a3b',
			  backgroundColor: 'rgba(231, 74, 59, 0.1)',
			  tension: 0.3,
			  fill: true
			}]
		  },
		  options: {
			responsive: true,
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
	  }
	},
	mounted() {
	  this.fetchServiceRequests();
	}
  };