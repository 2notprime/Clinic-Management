const express = require('express')
const router = express.Router()

const { checkLogin, createUser, changePassWord, getAppointment, updateYourImage, getProfile,getDoctorProfile, updateData, getDoctor, getMyProfile, updateMyProfile } = require("../controllers/userController")

const { bookingAppointMent } = require('../controllers/bookingController')
const { checkDoctorFree } = require('../controllers/doctorAllInfoController')

router.post('/api/login', checkLogin)
router.post('/api/register', createUser)
router.post('/api/changePassword', changePassWord)
router.post('/api/appointments', bookingAppointMent)
router.get('/api/doctor-calendar-free', checkDoctorFree)

router.get('/api/get-my-appointment',getAppointment)
router.post('/api/updateImage',updateYourImage)
router.get('/api/user-profile',getProfile)
router.get('/api/doctor-profile',getDoctorProfile)
router.post('/api/user-profile-change',updateData)
router.get('/api/get-all-doctor',getDoctor)
// router.get('/api/specialties',getSpecialties)


router.get('/api/get-my-profile', getMyProfile)
router.put('/api/update-my-profile', updateMyProfile)



module.exports = router