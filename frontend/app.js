import Navbar from "./components/Navbar.js"
import Footer from "./components/Footer.js"
import router from "./utils/router.js"
import store from "./utils/store.js"

const app = new Vue({
    el : '#app',
    template : `
        <div> 
            <Navbar />
            <router-view> </router-view>
            <Footer />
        </div>
    `,
    components : {
        Navbar,
        Footer
    },
    router,
    store,
})