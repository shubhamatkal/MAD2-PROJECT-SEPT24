# A2Z Household Services

A2Z Household Services is a **web application** built for managing **service requests, professionals, and customers**. This project is part of **MAD2** and provides a platform for booking services, updating statuses, retrieving professionals, and handling customer interactions.

## Features
- **Service Requests:** Create, update, close, and rate requests.
- **Professionals:** List professionals, filter by service, block/unblock.
- **Customers:** Manage accounts and toggle status.
- **Authentication:** JWT-based security.
- **Performance:** Caching with Redis and rate-limiting.

## Installation & Setup
### **1. Clone the Repository**
```bash
git clone https://github.com/your-repo/a2z-household-services.git
cd a2z-household-services
```

### **2. Create a Virtual Environment & Install Dependencies**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

### **3. Set Up Environment Variables**
Create a `.env` file and configure your database, secret keys, and Redis settings.

### **4. Run the Application**
```bash
python app.py 
```
The web application will be available at `http://127.0.0.1:5000/`.

## Documentation
Refer to the `api.yaml` file for API endpoints and usage details.

## License
MIT License