const express = require('express')
const router = express.Router()

const { checkLogin, createUser, changePassWord, getMyProfile, updateMyProfile } = require("../controllers/userController")
const { bookingAppointMent } = require('../controllers/bookingController')
const { checkDoctorFree } = require('../controllers/doctorAllInfoController')

router.post('/api/login', checkLogin)
router.post('/api/register', createUser)
router.post('/api/changePassword', changePassWord)
router.post('/api/appointments', bookingAppointMent)
router.get('/api/doctor-calendar-free', checkDoctorFree)
router.get('/api/get-my-profile', getMyProfile)
router.put('/api/update-my-profile', updateMyProfile)


module.exports = router