const store = new Vuex.Store({
    state: {
      // like data
      auth_token: null,
      role: null,
      loggedIn: false,
      name: null,
      user_id: null,
      email: null,
    },
    mutations: {
      // functions that change state
      setUser(state, userData = null) {
        if (userData) {
          // This handles direct login data from API
          state.auth_token = userData.token;
          state.role = userData.role;
          state.loggedIn = true;
          state.name = userData.fullname;
          state.user_id = userData.id;
          state.email = userData.email;
          // Store in localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('User stored in localStorage and state updated with API data');
        } else {
          // This loads from localStorage on page refresh/app init
          try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const user = JSON.parse(storedUser);
              state.auth_token = user.token;
              state.role = user.role;
              state.loggedIn = true;
              state.name = user.fullname;
              state.user_id = user.id;
              state.email = user.email;
              console.log('User loaded from localStorage to state');
            }
          } catch (error) {
            console.warn('Failed to load user from localStorage', error);
          }
        }
      },
      logout(state) {
        state.auth_token = null;
        state.role = null;
        state.loggedIn = false;
        state.user_id = null;
        state.name = null;
        state.email = null;
        localStorage.removeItem('user');
        console.log('Removed user from localStorage and state');
      }
    },
    actions: {
      // actions commit mutations can be async
    }
  });
  
  // Initial loading from localStorage
  store.commit('setUser');
  export default store;