const { query } = require('express');
const db = require('../models/index');
const { Error, where } = require('sequelize');



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
let deleteBookings = async (doctorId, patientId, date, timeType) => {
    let booking = await db.Booking.findOne({
        raw: true,
        where:{
            statusId: "S1",
            doctorId: doctorId,
            patientID: patientId,
            date: date,
            timeType: timeType,
        }
    })

    const result = await db.Booking.destroy({
        where: {
          id: booking.id, // Điều kiện xóa
        },
    });

    return result;
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
let deleteSchedules =  async (doctorId, date, timeType) => {
    try {
        let schedule = await db.Schedule.findOne({
           raw: true,
           where:{
            doctorId: doctorId,
            date: date,
            timeType: timeType,
           }
        });
        const result = await db.Schedule.destroy({
            where: {
              id: schedule.id, // Điều kiện xóa
            },
        });
    return result;
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

let getDoctorInvolve = async (userId) =>{
    const query = `SELECT u2.*,bookings.timeType,bookings.date from Users u1 join bookings on bookings.patientID =u1.id join Users u2 on u2.id =bookings.doctorId where u1.id=${userId}`;


    const [results, metadata] = await db.sequelize.query(query);

    let doctors = []
    for(let doc of results){
      
      let doctor ={
        _id: 'doc' + doc.id,
        name: 'Dr. ' + doc.firstName+' '+doc.lastName,
        image: doc.image,
        date: doc.date,
        timeType: doc.timeType,
        address: {
            line1: doc.address,
            line2: ''
        }
      }

      doctors.push(doctor)
    }

    return doctors;

}
module.exports = { insertBookings, insertSchedules, getAllBookings, getBookingsByPatientId, checkPatientBooking,getDoctorInvolve,deleteBookings,deleteSchedules }