import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotel, getHotelById } from "@/controllers/hotels-controller";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotel)
  .get("/:hotelId", getHotelById);

export { hotelsRouter };
