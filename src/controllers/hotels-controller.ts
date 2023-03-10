import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import { hotelService } from "@/services/hotels-service";

export async function getHotel(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {  
    const hotels = await hotelService.getHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if(error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  try {
    const hotel = await hotelService.getHotelById(userId, Number(hotelId));

    return res.status(httpStatus.OK).send(hotel);
  } catch (error) {
    if(error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    return res.status(httpStatus.NOT_FOUND).send(error.message);
  }
}

