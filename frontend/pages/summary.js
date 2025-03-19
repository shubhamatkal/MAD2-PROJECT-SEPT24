// Summary.js
import AdminSummary from './summary-admin.js';
import ProfessionalSummary from './summary-pro.js';
import CustomerSummary from './summary-cus.js';

export default {
  components: {
    AdminSummary,
    ProfessionalSummary,
    CustomerSummary
  },
  computed: {
    userRole() {
      return this.$store.state.role;
    },
    currentSummaryComponent() {
      switch(this.userRole) {
        case 0: return 'admin-summary';
        case 1: return 'customer-summary';
        case 2: return 'professional-summary';
        default: return 'customer-summary'; // fallback
      }
    }
  },
  template: `
    <component :is="currentSummaryComponent"></component>
  `
};