## Patient Registration

### Stack

- **API**: Node.js, Express
- **ORM**: TypeORM
- **DB**: PostgreSQL
- **Infra**: Docker + docker-compose

### First Steps

1) Install dependencies:

```bash
npm install
```

2) Create `.env` by copying `env.example`

### Run seed (Optional)

**Steps:**

1. Make sure Docker Desktop is running.
2. In the terminal, run:

```bash
docker-compose exec api npm run seed
```

### Environment variables

The variables provided in `env.example` are fully functional for running the project locally.

⚠️ **Important:**  
To enable email functionality, you **must** provide your own Mailtrap credentials by replacing the following variables in your `.env` file:

- `MAILTRAP_USER`
- `MAILTRAP_PASS`

The placeholder values included in `env.example` (`USER_YOUR_USER_HERE`, `USER_YOUR_PASSWORD_HERE`) are **not valid** and are only meant as a reference.


### Run with Docker (recommended)

**Requirements:** Docker Desktop installed and running.

**Steps:**

1. Make sure Docker Desktop is running.
2. In the terminal, run:

```bash
docker compose up --build
```

3. Wait until you see the message: `API listening on http://localhost:3000`
4. Test the health check: `http://localhost:3000/api/health`

**To Stop:** Press `Ctrl + C` or run `docker compose down`

### Tests

**Run tests:**

```bash
npm run test
```

⚠️ **Important:**
To run tests properly, you need to create a **.env.test** file with your testing environment variables. You can use **.env.example** as a reference.

### Endpoints

- **GET** `/api/health`
- **CRUD Patients**:
  - **GET** `/api/patients` - List patients
  - **GET** `/api/patients/:id` - Get patient by ID
  - **POST** `/api/patients` - Create patient
  - **PUT** `/api/patients/:id` - Update patient
  - **DELETE** `/api/patients/:id` - Delete patient

#### Create patient (POST `/api/patients`)

Use **multipart/form-data** to include data & document image.

- `name` (required): Patient name
- `email` (required): Patient email
- `phoneNumber` (required): Patient phone number
- `documentPhoto` (required): Patient document photo

**Response:**
```json
{
  "id": "patient-uuid",
  "name": "Fake Patient",
  "email": "fake@example.com",
  "phoneNumber": "+54 11 1234-5678",
  "documentPhotoUrl": "/uploads/documents/documentPhoto.jpg",
  "createdAt": "",
  "updatedAt": ""
}
```

#### Update patient (PUT `/api/patients/:id`)

Use **multipart/form-data** to include data & document image.

- `name` (optional): Patient name
- `email` (optional): Patient email
- `phoneNumber` (optional): Patient phone number
- `documentPhoto` (optional): Patient document photo

**Response:**
```json
{
  "id": "patient-uuid",
  "name": "Fake Patient",
  "email": "fake@example.com",
  "phoneNumber": "+54 11 1234-5678",
  "documentPhotoUrl": "/uploads/documents/documentPhoto.jpg",
  "createdAt": "",
  "updatedAt": ""
}
```

#### Delete patient (DELETE `/api/patients/:id`)

**Response:** Empty response (204)

### Notes

- For convenience, the repository includes a sample image that can be used for **manual testing** of file uploads.
- The file is located at: `uploads/documents/document-example.jpg`
