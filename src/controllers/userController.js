const { handleUserLogin, getMyAppointment,updateImage } = require('../services/user-services');
const { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById, getAllDoctor } = require('../services/CRUDservices')
const { splitFullName,doctorIdtoUserId } = require('../algorithm/algorithm')
const db = require('../models/index');
const bcrypt = require('bcrypt');

let checkLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    let userData = await handleUserLogin(email, password);
    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing inputs parameter!'
        })
    }

    console.log(userData);
    if (userData.errCode === 0) {
        return res.status(200).json({
            errCode: userData.errCode,
            message: userData.errMessage,
            user: userData.user ? userData.user : {}
        })
    }
    return res.status(500).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

let changePassWord = async (req, res) => {
    try {
        let userid = req.query.id;
        let oldPass = req.body.oldPass;
        let newPass = req.body.newPass;
        let checkNewPass = req.body.checkNewPass;

        if (newPass !== checkNewPass) {
            return res.status(400).json({
                errCode: 1,
                message: 'New password and check password do not match'
            });
        }

        // Lấy dữ liệu người dùng từ ID
        let userData = await getUserById(userid);
        if (!userData) {
            return res.status(404).json({
                errCode: 4,
                message: 'User not found'
            });
        }

        // Kiểm tra mật khẩu cũ
        let check = await bcrypt.compare(oldPass, userData.password);
        if (check) {
            // Băm mật khẩu mới
            let hashedNewPassword = await hashPassword(newPass);

            // Cập nhật mật khẩu trong cơ sở dữ liệu
            let updated = await db.User.update(
                { password: hashedNewPassword },
                { where: { id: userid } }
            );

            if (updated[0] > 0) {
                return res.status(200).json({
                    errCode: 0,
                    message: 'Password changed successfully'
                });
            } else {
                return res.status(500).json({
                    errCode: 2,
                    message: 'Unable to change password'
                });
            }
        } else {
            return res.status(400).json({
                errCode: 3,
                message: 'Old password is incorrect'
            });
        }
    } catch (error) {
        console.error('Error in changePassWord:', error);
        return res.status(500).json({
            errCode: 5,
            message: 'Internal server error'
        });
    }
}

let updateData = async (req, res) => {
    let data = {
        id: req.body.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address
    }

    let allUsers = await updateUserData(data);

    if (allUsers[0]) {
        return res.status(200).json({
            errCode: 0,
            message: 'update successful'
        })
    }
    else {
        return res.status(404).json({
            errCode: 1,
            message: 'cannot update'
        })
    }

}

let createUser = async (req, res) => {


    console.log(req.body.name);
    console.log(splitFullName(req.body.name).firstName);
    try {
        let data = {
            email: req.body.email,
            password: req.body.password,
            firstName: splitFullName(req.body.name).firstName,
            lastName: splitFullName(req.body.name).lastName,
            address: null,
            phonenumber: null,
            gender: null,
            roleId: 'R2',
        };

        let Exists = await db.User.findOne({
            where: { email: data.email }
        });

        if (Exists) {
            return res.status(500).json({
                errCode: 2,
                message: 'Email is existed'
            })
        }

        // Đợi kết quả từ createNewUser
        let message = await createNewUser(data);

        return res.status(200).json({
            errCode: 0,
            message: message,
        });
    } catch (e) {
        console.error('Error creating user:', e);
        return res.status(500).json({
            errCode: 1,
            message: 'Failed to create new user',
        });
    }
};

let getAppointment = async (req,res) => {
    userId = req.body.id;
    try{
        let myAppointment = await getMyAppointment(userId);
        if(myAppointment[0]){
            return res.status(200).json({
                errCode: 0,
                data: myAppointment
            })
        }
        else{
            return res.status(200).json({
                errCode: 0,
                data: {}
            })
        }
    }
    catch(error){
        return res.status(500).json({
            errCode: 1,
            message: 'Error to get your appointment'
        })
    }
}

let updateYourImage = async (req,res) => {
    let userId = req.body.id;
    let image = req.body.image;
    try {
        updateImage(userId,image);
        return res.status(200).json({
            errCode: 0,
            message: "OK"
        })

    } catch (error) {
        return res.status(500).json({
            errCode: 0,
            message:"Cannot change your image"
        })
    }
}

let getProfile = async (req,res) =>{
    let userId = req.body.id;
    try {
        let profile = await getUserById(userId);
        return res.status(200).json({
            errCode: 0,
            data: profile
        })
    } catch (error) {
        return res.status(404).json({
            errCode: 1,
            message: "Not found info"
        })
    }
    
}

let getDoctorProfile = async (req,res) => {
    let doctorId = doctorIdtoUserId(req.body.doctorId);
    try {
        let profile = await getUserById(doctorId);
        return res.status(200).json({
            errCode: 0,
            data: profile
        })
    } catch (error) {
        return res.status(404).json({
            errCode: 1,
            message: "Not found info"
        })
    }
}

let getDoctor = async (req,res)=>{
    try {
        let doctors = await getAllDoctor()
       console.log(doctors[15])
        return res.status(200).json({
            errCode: 0,
            data: doctors
        }) 
    } catch (error) {
        return res.status(404).json({
            errCode: 1,
            message: "Not found info"
        })
    }
    
}

module.exports = { checkLogin, changePassWord, createUser, updateData, getAppointment,updateYourImage,getProfile,getDoctorProfile,getDoctor };
