import LoginPage from "../pages/LoginPage.js";
import RegisterCustomer from "../pages/Register-Customer.js";
import AdminHome from "../pages/admin-home.js";
import HomeCustomer from "../pages/home-customer.js";
import Home from "../pages/home.js";
import ProfessionalRegister from "../pages/pro-reg.js";
import Profile from "../pages/profile.js";
import HomeProfessional from "../pages/pro-home.js";


const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register-customer', component : RegisterCustomer},
    {path : '/admin-home', component : AdminHome},
    {path : '/home-customer', component : HomeCustomer},
    {path : '/professional-register', component : ProfessionalRegister},
    {path : '/profile', component : Profile},
    {path : '/professional-home', component : HomeProfessional}
]

const router = new VueRouter({
    routes
})

export default router;