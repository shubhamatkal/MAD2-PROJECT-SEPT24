import LoginPage from "../pages/LoginPage.js";
import RegisterCustomer from "../pages/Register-Customer.js";
import AdminHome from "../pages/admin-home.js";
import HomeCustomer from "../pages/home-customer.js";
import Home from "../pages/home.js";
import ProfessionalRegister from "../pages/pro-reg.js";
import Profile from "../pages/profile.js";
import HomeProfessional from "../pages/pro-home.js";
import AllServiceRequests from "../pages/all_ser_req.js";
import ProAllServiceRequests from "../pages/pro_all_ser_req.js";
import CusAllServiceRequests from "../pages/cus_full_history.js";
import Services from "../pages/services.js";
import RateServicePage from "../pages/RateServicePage.js";
import AllCustomers from '../pages/AllCustomers.js';
import Summary from '../pages/summary.js';

import store from './store.js'

// Changed role values to match the numeric values in your store
const routes = [
  {path: '/', component: Home},
  {path: '/login', component: LoginPage},
  {path: '/register-customer', component: RegisterCustomer},
  {path: '/admin-home', component: AdminHome, meta: {requiresLogin: true, role: 0}},
  {path: '/home-customer', component: HomeCustomer, meta: {requiresLogin: true, role: 1}},
  {path: '/professional-register', component: ProfessionalRegister},
  {path: '/profile', component: Profile, meta: {requiresLogin: true}},
  {path: '/professional-home', component: HomeProfessional, meta: {requiresLogin: true, role: 2}},
  {path: '/all-service-requests', component: AllServiceRequests, meta: {requiresLogin: true, role: 0}},
  {path: '/pro_full_history', component: ProAllServiceRequests, meta: {requiresLogin: true, role: 2}},
  {path: '/cus_full_history', component: CusAllServiceRequests, meta: {requiresLogin: true, role: 1}},
  {path: '/services/:serviceId', component: Services, meta: {requiresLogin: true, role: 1}},
  {path: "/rate/:requestId", component: RateServicePage, meta: {requiresLogin: true, role: 1}},
  {path: '/all-customers', component: AllCustomers, meta: {requiresLogin: true, role: 0}},
  {path: '/summary', component: Summary, meta: {requiresLogin: true}},
]

const router = new VueRouter({
  routes
})

// Navigation guards with role-based access control
router.beforeEach((to, from, next) => {
  console.log('Navigation Guard Triggered');
  console.log('To Route:', to.path);
  console.log('Logged In:', store.state.loggedIn);
  console.log('User Role:', store.state.role);
  console.log('Required Role:', to.meta.role);

  // Check if route requires login
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    // If not logged in, redirect to login
    if (!store.state.loggedIn) {
      console.log('Not logged in, redirecting to login');
      next({path: '/login'});
      return;
    }
    
    // Check if route requires specific role and user's role doesn't match
    const requiresRole = to.matched.some(record => record.meta.role !== undefined);
    const hasCorrectRole = to.matched.every(record => 
      record.meta.role === undefined || record.meta.role === store.state.role
    );
    
    if (requiresRole && !hasCorrectRole) {
      console.log('Unauthorized access attempt');
      
      // Redirect based on user role
      if (store.state.role === 1) {
        next({path: '/home-customer'});
      } else if (store.state.role === 2) {
        next({path: '/professional-home'});
      } else if (store.state.role === 0) {
        next({path: '/admin-home'});
      } else {
        next({path: '/login'});
      }
      return;
    }
    
    // User is logged in and has correct role
    console.log('Proceeding to route');
    next();
  } else {
    console.log('No login required');
    next();
  }
})

export default router;