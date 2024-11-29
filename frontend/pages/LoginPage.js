export default {
    template : `
    <div>
        <input placeholder="email"  v-model="email"/>  
        <input placeholder="password"  v-model="password"/>  
        <button class='btn btn-primary' @click="submitLogin"> Login </button>
    </div>
    `,
    data(){
        return {
            email : null,
            password : null,
        } 
    },
    methods : {
        async submitLogin(){
            const res = await fetch(location.origin+'/login', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'email': this.email,'password': this.password})
                })
                if (res.ok) {
                    console.log('We are logged in');
                    const data = await res.json();
                    console.log(data);
                    
                    // Save user data in Vuex store
                    this.$store.commit('setUser');
                    // Save user data in local storage
                    localStorage.setItem('user', JSON.stringify(data));
                
                    // Check the role and redirect accordingly
                    switch (data.role) {
                        case 0:
                            this.$router.push('/admin-home'); // Redirect for Admin
                            break;
                        case 1:
                            this.$router.push('/customer-home'); // Redirect for Customer
                            break;
                        case 2:
                            this.$router.push('/professional-home'); // Redirect for Professional
                            break;
                        default:
                            console.error('Unknown role'); // Handle unexpected role values
                            break;
                    }
                }
        }
    }
}