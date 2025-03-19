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
import rate from "../pages/rate.js";
import Services from "../pages/services.js";
import RateServicePage from "../pages/RateServicePage.js";
import AllCustomers from '../pages/AllCustomers.js'; // Update the path as needed
import Summary from '../pages/summary.js'; // Update the path as needed


import store from './store.js'


const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register-customer', component : RegisterCustomer},
    {path : '/admin-home', component : AdminHome,meta : {requiresLogin : true}},
    {path : '/home-customer', component : HomeCustomer ,meta : {requiresLogin : true}},
    {path : '/professional-register', component : ProfessionalRegister},
    {path : '/profile', component : Profile,meta : {requiresLogin : true}},
    {path : '/professional-home', component : HomeProfessional,meta : {requiresLogin : true}},
    {path : '/all-service-requests', component : AllServiceRequests,meta : {requiresLogin : true}},
    {path : '/pro_full_history', component : ProAllServiceRequests,meta : {requiresLogin : true}},
    {path : '/cus_full_history', component : CusAllServiceRequests,meta : {requiresLogin : true}},
    {path : '/rate/:requestId', component : rate,meta : {requiresLogin : true}},
    {path : '/services/:serviceId', component : Services,meta : {requiresLogin : true}},
    { path: "/rate/:requestId", component: RateServicePage },
      {
    path: '/all-customers',
    component: AllCustomers  },
    { path: '/summary', component: Summary },
]

const router = new VueRouter({
    routes
})


//  navigation guards
router.beforeEach((to, from, next) => {
    console.log('Navigation Guard Triggered');
    console.log('To Route:', to.path);
    console.log('Logged In:', store.state.loggedIn);
    console.log('Requires Login:', to.meta.role);
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            console.log('Not logged in, redirecting to login');
            next({path : '/login'})
        } else {
            console.log('Proceeding to route');
            next();
        }
    } else {
        console.log('No login required');
        next();
    }
})

export default router;