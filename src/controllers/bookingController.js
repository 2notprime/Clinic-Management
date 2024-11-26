const db = require('../models/index');

const { handleUserLogin } = require('../services/user-services');
const { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById } = require('../services/CRUDservices')
const { splitFullName } = require('../algorithm/algorithm')
const { insertBookings, insertSchedules, getAllBookings, getBookingsByPatientId, checkPatientBooking } = require('../services/booking-services')


let bookingAppointMent = async (req, res) => {
    let doctorId = req.query.doctorId
    let patientId = req.query.patientId
    let date = req.body.date
    let timeType = req.body.timeType
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