import express from "express";

import cors from "cors";


import authRoutes from "./routes/auth";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});