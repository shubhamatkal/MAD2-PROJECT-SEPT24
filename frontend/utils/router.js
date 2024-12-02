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


const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register-customer', component : RegisterCustomer},
    {path : '/admin-home', component : AdminHome},
    {path : '/home-customer', component : HomeCustomer},
    {path : '/professional-register', component : ProfessionalRegister},
    {path : '/profile', component : Profile},
    {path : '/professional-home', component : HomeProfessional},
    {path : '/all-service-requests', component : AllServiceRequests},
    {path : '/pro_full_history', component : ProAllServiceRequests},
    {path : '/cus_full_history', component : CusAllServiceRequests},
    {path : '/rate/:requestId', component : rate},
    {path : '/services/:serviceId', component : Services}
]

const router = new VueRouter({
    routes
})

export default router;