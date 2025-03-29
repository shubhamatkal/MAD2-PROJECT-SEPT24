export default {
    template: `
      <footer class="footer mt-auto py-3 bg-light text-center">
        <div class="container">
          <span class="text-muted">
            © {{ currentYear }} A2Z HouseHold Services | Shubham Atkal
          </span>
        </div>
      </footer>
    `,
    computed: {
      currentYear() {
        return new Date().getFullYear();
      }
    }
  }