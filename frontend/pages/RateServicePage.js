export default {
	data() {
	  return {
		requestId: null,
		serviceRequest: {},
		loading: true,
		error: null,
		rating: 0,
		ratingRemark: "",
		hoveredRating: 0
	  };
	},
	created() {
	  this.requestId = this.$route.params.requestId; // Get request ID from route params
	  this.fetchServiceRequest();
	},
	methods: {
	  async fetchServiceRequest() {
		this.loading = true;
		try {
		  console.log("fetching service request");
		  
		  const response = await fetch(`/api/service-requests/${this.requestId}`,
			{
			  headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${this.$store.state.auth_token}`,
			  },
			}
		  );
		  const data = await response.json();
		  if (response.ok) {
			console.log("API Response:", data);
			// Store data directly
			this.serviceRequest = data;
			console.log("Service Request:", this.serviceRequest);
		  } else {
			this.error = data.message || "Failed to load service request";
		  }
		} catch (error) {
		  console.error("Error fetching service request:", error);
		  this.error = "An error occurred while fetching the service request";
		} finally {
		  this.loading = false;
		}
	  },
  
	  setRating(value) {
		this.rating = value;
	  },
	  
	  hoverStar(value) {
		this.hoveredRating = value;
	  },
	  
	  resetHover() {
		this.hoveredRating = 0;
	  },
	
	  formatDate(dateString) {
		if (!dateString) return "Not available";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
		  year: "numeric",
		  month: "long",
		  day: "numeric",
		});
	  },
	  
	  async submitRating() {
		if (this.rating < 1 || this.rating > 5) {
		  alert("Please select a valid rating (1-5).");
		  return;
		}
  
		try {
		  const response = await fetch(`/api/service-requests/${this.requestId}/rate`, {
			method: "PUT",
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': `Bearer ${this.$store.state.auth_token}`,
			},
			body: JSON.stringify({
			  rating: this.rating,
			  rating_remark: this.ratingRemark,
			}),
		  });
  
		  const data = await response.json();
		  if (response.ok) {
			alert("Thank you for your feedback!");
			this.$router.push("/home-customer"); // Redirect to home after rating
		  } else {
			alert(data.message || "Failed to submit rating");
		  }
		} catch (error) {
		  console.error("Error submitting rating:", error);
		  alert("An error occurred while submitting your rating");
		}
	  },
	},
	template: `
	  <div class="container mt-4">
		<div class="row justify-content-center">
		  <div class="col-md-8">
			<div class="card shadow">
			  <div class="card-header bg-primary text-white">
				<h3 class="mb-0">Rate Service Request</h3>
			  </div>
			  
			  <div class="card-body">
				<!-- Loading state -->
				<div v-if="loading" class="text-center py-4">
				  <div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				  </div>
				  <p class="mt-2">Loading service request details...</p>
				</div>
				
				<!-- Error state -->
				<div v-else-if="error" class="alert alert-danger">
				  <i class="bi bi-exclamation-triangle me-2"></i>
				  {{ error }}
				</div>
				
				<!-- Content when loaded -->
				<div v-else>
				  <div class="row mb-4">
					<div class="col-md-6">
					  <h5 class="card-title">Service Details</h5>
					  <p><strong>Service ID:</strong> #{{ serviceRequest.id || 'N/A' }}</p>
					  <p><strong>Service:</strong> {{ serviceRequest.service_name || 'Not specified' }}</p>
					  <p><strong>Status:</strong> 
						<span class="badge" 
						  :class="{
							'bg-success': serviceRequest.service_status === 'completed',
							'bg-warning text-dark': serviceRequest.service_status === 'pending',
							'bg-info text-dark': serviceRequest.service_status === 'in_progress',
							'bg-secondary': !['completed', 'pending', 'in_progress'].includes(serviceRequest.service_status)
						  }">
						  {{ serviceRequest.service_status || 'Unknown' }}
						</span>
					  </p>
					</div>
					<div class="col-md-6">
					  <h5 class="card-title">Timeline</h5>
					  <p><strong>Requested:</strong> {{ formatDate(serviceRequest.date_of_request) }}</p>
					  <p><strong>Completed:</strong> {{ formatDate(serviceRequest.date_of_completion) }}</p>
					</div>
				  </div>
				  
				  <div class="border-top pt-4">
					<h4 class="mb-3">Rate Your Experience</h4>
					
					<div class="mb-4">
					  <label class="form-label">Your Rating:</label>
					  <div class="d-flex">
						<div v-for="star in 5" :key="star" class="me-2">
						  <span 
							@click="setRating(star)"
							@mouseover="hoverStar(star)"
							@mouseleave="resetHover()"
							style="cursor: pointer; font-size: 2rem;">
							<i class="bi" 
							   :class="[
								 (star <= (hoveredRating || rating)) 
								   ? 'bi-star-fill text-warning' 
								   : 'bi-star text-secondary'
							   ]">
							</i>
						  </span>
						</div>
					  </div>
					  <small class="text-muted mt-2 d-block">
						Selected rating: <strong>{{ rating > 0 ? rating + ' stars' : 'None' }}</strong>
					  </small>
					</div>
					
					<div class="mb-3">
					  <label for="feedback" class="form-label">Your Feedback:</label>
					  <textarea 
						id="feedback"
						v-model="ratingRemark" 
						class="form-control" 
						rows="4" 
						placeholder="Share your experience with this service...">
					  </textarea>
					</div>
					
					<button 
					  @click="submitRating" 
					  class="btn btn-primary" 
					  :disabled="rating === 0">
					  Submit Rating
					</button>
				  </div>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	`,
  };