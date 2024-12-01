export default {
	template: `
	  <div class="container mt-5">
		<h1 class="display-4 fw-bold">Profile</h1>
		<div class="card mt-3">
		  <div class="card-body">
			<h5 class="card-title">Full Name: {{ fullName }}</h5>
			<p class="card-text">Role: {{ roleName }}</p>
		  </div>
		</div>
	  </div>
	`,
	computed: {
	  fullName() {
		return this.$store.state.name || 'Unknown'; // Assuming fullName is stored in Vuex
	  },
	  roleName() {
		const roleMap = {
		  0: 'Admin',
		  1: 'Customer',
		  2: 'Professional',
		};
		return roleMap[this.$store.state.role] || 'Unknown'; // Map role to a name
	  },
	},
  };
  