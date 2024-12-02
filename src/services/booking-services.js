const db = require('../models/index');
const { Error } = require('sequelize');



let insertBookings = async (doctorId, patientId, date, timeType) => {
    try {
        await db.Booking.create({
            statusId: "S1",
            doctorId: doctorId,
            patientID: patientId,
            date: date,
            timeType: timeType,
        });
    } catch (e) {
        throw new Error(e); // Thêm lỗi nếu có
    }
}

let insertSchedules = async (doctorId, date, timeType) => {
    try {
        await db.Schedule.create({
            doctorId: doctorId,
            date: date,
            timeType: timeType,
        });
    } catch (e) {
        throw new Error(e); // Thêm lỗi nếu có
    }
}

let getAllBookings = async () => {
    try {
        let bookings = await db.Booking.findAll({
            raw: true,
            where: {
                statusId: {
                    [db.Sequelize.Op.in]: ["S1", "S2"],
                },
            },
        });
        return bookings;
    } catch (e) {
        throw new Error(e);
    }
}

let getBookingsByPatientId = async (patientId) => {
    try {
        let bookings = await db.Booking.findAll({
            raw: true,
            where: {
                patientId: patientId,
            },
        });
        return bookings;
    } catch (e) {
        throw new Error(e);
    }
}

let checkPatientBooking = async (patientId, date, timeType) => {

    try {
        let bookings = await db.Booking.findAll({
            raw: true,
            where: {
                patientId: patientId,
                date: date,
                timeType: timeType,
            },
        });
        return bookings.length > 0;
    } catch (e) {
        throw new Error(e);
    }
}
module.exports = { insertBookings, insertSchedules, getAllBookings, getBookingsByPatientId, checkPatientBooking }