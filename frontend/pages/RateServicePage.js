export default {
	data() {
	  return {
		requestId: null,
		serviceRequest: {},
		rating: 0,
		ratingRemark: "",
	  };
	},
	created() {
	  this.requestId = this.$route.params.requestId; // Get request ID from route params
	  this.fetchServiceRequest();
	},
	methods: {
	  async fetchServiceRequest() {
		try {
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
			this.serviceRequest = data.service_request;
		  } else {
			alert(data.message);
		  }
		} catch (error) {
		  console.error("Error fetching service request:", error);
		}
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
			},			body: JSON.stringify({
			  rating: this.rating,
			  rating_remark: this.ratingRemark,
			}),
		  });
  
		  const data = await response.json();
		  if (response.ok) {
			alert("Thank you for your feedback!");
			this.$router.push("/home"); // Redirect to home after rating
		  } else {
			alert(data.message);
		  }
		} catch (error) {
		  console.error("Error submitting rating:", error);
		}
	  },
	},
	template: `
    <div class="container">
      <h2>Rate Service Request</h2>
      <p><strong>Service ID:</strong> {{ serviceRequest.id }}</p>
      <p><strong>Status:</strong> {{ serviceRequest.service_status }}</p>

      <div class="rating">
        <span v-for="star in 5" :key="star" 
          @click="rating = star" 
          :class="{ 'selected': star <= rating }">
          ★
        </span>
      </div>

      <textarea v-model="ratingRemark" placeholder="Write your feedback..." class="feedback-box"></textarea>

      <button @click="submitRating" class="btn btn-primary">Submit Rating</button>
    </div>

    <style>
      .rating {
        font-size: 30px;
        color: gray;
        cursor: pointer;
      }

      .rating .selected {
        color: gold;
      }

      .feedback-box {
        width: 100%;
        height: 100px;
        margin-top: 10px;
        padding: 5px;
        font-size: 16px;
      }

      .btn {
        margin-top: 10px;
        padding: 8px 16px;
        font-size: 16px;
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
      }

      .btn:hover {
        background-color: #0056b3;
      }
    </style>
	`,
  };
  