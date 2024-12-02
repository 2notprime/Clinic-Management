const db = require('../models/index');

const { handleUserLogin } = require('../services/user-services');
const { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById } = require('../services/CRUDservices')
const { doctorIdtoUserId, splitFullName, convertTimeType } = require('../algorithm/algorithm')
const { insertBookings, insertSchedules, getAllBookings, getBookingsByPatientId, checkPatientBooking } = require('../services/booking-services')


let bookingAppointMent = async (req, res) => {
    let doctorId = req.body.doctorId
    doctorId = doctorIdtoUserId(doctorId)
    let patientId = req.body.patientId
    let date = req.body.date
    date = new Date(date);
    date.setHours(7, 0, 0, 0);

    let timeType = req.body.time
    timeType = convertTimeType(timeType)
    existAppointment = await checkPatientBooking(patientId, date, timeType)
    if (existAppointment) {
        return res.status(500).json({
            errCode: 1,
            message: 'Patient already has an appointment on this date and time!'
        })
    }
    else {
        await insertSchedules(doctorId, date, timeType)
        await insertBookings(doctorId, patientId, date, timeType)
    }

    return res.status(200).json({
        errCode: 0,
        message: 'Appointment successfully made!'
    })
}

module.exports = { bookingAppointMent }