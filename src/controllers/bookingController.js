const db = require('../models/index');

const { handleUserLogin } = require('../services/user-services');
const { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById } = require('../services/CRUDservices')
const { doctorIdtoUserId, splitFullName, convertTimeType } = require('../algorithm/algorithm')
const { insertBookings, insertSchedules, getAllBookings, getBookingsByPatientId, checkPatientBooking, getDoctorInvolve, deleteBookings, deleteSchedules } = require('../services/booking-services')


let bookingAppointMent = async (req, res) => {
    let doctorId = req.body.doctorId
    doctorId = doctorIdtoUserId(doctorId)
    let patientId = req.body.patientId
    let date = req.body.date

    console.log(req.body)
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

let deleteBookingsAppointment = async(req,res) => {
    

    let doctorId=doctorIdtoUserId(req.body.data.item._id);
    let patientID=parseInt(req.body.userId);
    let date=new Date(req.body.data.item.date);
    let timeType=req.body.data.item.timeType;

    console.log(doctorId, patientID,date,timeType)

    try {
        let result1 = await deleteBookings(doctorId,patientID,date,timeType);
        let result2 = await deleteSchedules(doctorId,date,timeType);
        console.log(result1,result2)
        if(result1&&result2){
            return res.status(200).json({
                errCode: 0
            }) 
        }
        else{
            return res.status(500).json({
                errCode: 1
            }) 
        }
    } catch (error) {
        return res.status(500).json({
            errCode: 3
        }) 
    }

}

let getMyAppointment = async (req,res) =>{
    let id = req.params.id
    
    let results = await getDoctorInvolve(id);
 
    return res.status(200).json({
        errCode: 0,
        data: results
    })
}

module.exports = { bookingAppointMent,getMyAppointment,deleteBookingsAppointment }