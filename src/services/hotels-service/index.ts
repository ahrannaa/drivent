import { notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { paymentRequired } from "@/errors/payment-required-error";

async function rulesForListingHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError("Enrollment not found!!");
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError("Ticket not found!!");
  }

  if(ticket.status !== "PAID" || !ticket.TicketType.includesHotel) {
    throw paymentRequired();
  }
}

async function getHotels(userId: number) {
  await rulesForListingHotels(userId);
  const hotels = await hotelRepository.findHotels();

  return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
  await rulesForListingHotels(userId);
  const hotel = await hotelRepository.findHotelById(hotelId);

  if (!hotel) {
    throw notFoundError();
  }
  return hotel;
}

const hotelService = {
  rulesForListingHotels,
  getHotels,
  getHotelById
};

export { hotelService };
