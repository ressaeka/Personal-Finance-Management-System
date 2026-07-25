import cors from "cors";

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

export default cors(corsOptions);