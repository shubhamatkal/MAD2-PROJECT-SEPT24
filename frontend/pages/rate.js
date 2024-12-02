export default {
	template: `
	  <div class="container mt-5">
		<div class="card">
		  <div class="card-header bg-primary text-white">
			<h2>Rate Your Service</h2>
		  </div>
		  <div class="card-body">
			<div class="service-details mb-4">
			  <h4>Service Details</h4>
			  <p><strong>Service Name:</strong> {{ serviceRequest.service_name }}</p>
			  <p><strong>Professional Name:</strong> {{ serviceRequest.professional_name }}</p>
			  <p><strong>Completion Date:</strong> {{ serviceRequest.date_of_completion }}</p>
			</div>
  
			<div class="rating-section">
			  <h4>Your Rating</h4>
			  <div class="star-rating mb-3">
				<span 
				  v-for="star in 5" 
				  :key="star" 
				  @click="setRating(star)"
				  :class="['star', star <= rating ? 'selected' : '']"
				>
				  ★
				</span>
			  </div>
  
			  <div class="form-group mb-3">
				<label for="remarks" class="form-label">Remarks</label>
				<textarea 
				  id="remarks" 
				  class="form-control" 
				  v-model="remarks" 
				  rows="3" 
				  placeholder="Share your experience (optional)"
				></textarea>
			  </div>
  
			  <div class="actions">
				<button 
				  @click="submitRating" 
				  class="btn btn-primary"
				  :disabled="!rating"
				>
				  Rate and Close
				</button>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	`,
	data() {
	  return {
		serviceRequest: null,
		rating: 0,
		remarks: ''
	  }
	},
	methods: {
	  setRating(star) {
		this.rating = star;
	  },
	  async fetchServiceRequestDetails() {
		try {
		  const requestId = this.$route.params.requestId;
		  const response = await fetch(`/api/service_request_details/${requestId}`, {
			headers: {
			  'Authentication-Token': this.$store.state.auth_token,
			}
		  });
		  this.serviceRequest = await response.json();
		} catch (error) {
		  console.error("Error fetching service request details:", error);
		  this.$toast.error("Unable to load service request details");
		}
	  },
	  async submitRating() {
		try {
		  const requestId = this.$route.params.requestId;
		  const response = await fetch('/api/rate_service_request', {
			method: 'POST',
			headers: {
			  'Authentication-Token': this.$store.state.auth_token,
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  request_id: requestId,
			  rating: this.rating,
			  remarks: this.remarks
			})
		  });
  
		  if (response.ok) {
			console.log("Rating submitted successfully");
			// this.$toast.success("Service rated successfully");
			this.$router.push('/cus_full_history');
		  } else {
			const errorData = await response.json();
			this.$toast.error(errorData.message || "Failed to submit rating");
		  }
		} catch (error) {
		  console.error("Error submitting rating:", error);
		  this.$toast.error("Unable to submit rating");
		}
	  }
	},
	mounted() {
	  this.fetchServiceRequestDetails();
	},
	styles: `
	  .star {
		color: #ddd;
		font-size: 2rem;
		cursor: pointer;
	  }
	  .star.selected {
		color: gold;
	  }
	`
  }