const { handleUserLogin, getMyAppointment,updateImage } = require('../services/user-services');
const { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById, getAllDoctor } = require('../services/CRUDservices')
const { splitFullName,doctorIdtoUserId } = require('../algorithm/algorithm')
const db = require('../models/index');
const bcrypt = require('bcrypt');

const multer = require('multer');

// Cấu hình multer để lưu ảnh vào thư mục 'uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Chỉ định thư mục lưu ảnh
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Đặt tên file là thời gian hiện tại và tên file gốc
    }
});

// Khởi tạo multer với cấu hình đã tạo
const upload = multer({ storage: storage });


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
        console.log(req.body)
        let userid = req.body.userId;
        let oldPass = req.body.oldPassword;
        let newPass = req.body.newPassword;
        let checkNewPass = req.body.newPassword;
        

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
        await updateImage(userId,image);
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

let getProfile = async (req, res) => {
    let userId = req.body.id; // Lấy ID từ URL
    let avatarPath = req.file ? req.file.path : null; // Lấy đường dẫn đến file ảnh nếu có
    // In ra thông tin file ảnh tải lên (nếu có)

    try {
        let profile = await getUserById(userId); // Lấy thông tin người dùng từ DB

        
        return res.status(200).json({
            errCode: 0,
            data: profile,
            avatar: avatarPath ? avatarPath : null // Gửi đường dẫn ảnh nếu có
        });
    } catch (error) {
        return res.status(404).json({
            errCode: 1,
            message: "Not found info"
        });
    }
};


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

let getMyProfile = async (req, res) => {
    let userId = req.query.id;
    let user = await getUserById(userId);
    delete user.password;
    if (!user) {
        return res.status(404).json({
            errCode: 1,
            message: 'User not found',
        })
    }
    return res.status(200).json({
        errCode: 0,
        message: 'Get user profile successful',
        user: user ? user : {},
    })
}

let updateMyProfile = async (req, res) => {
    let userId = req.body.id;
    let userData = req.body.userData
    let nameParts = userData.name.split(" ");
    let image =req.body.image
    let firstName = nameParts[0];
    let lastName = nameParts.slice(1).join(" ");

    let data = {
        id: userId,
        firstName: firstName,
        lastName: lastName,
        address: userData.address,
        phonenumber: userData.phone,
        image: userData.image,
        gender: userData.gender === "Male" ? 1 : 2,
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


let getDoctor = async (req,res)=>{
    try {
        let doctors = await getAllDoctor()
       
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

module.exports = { checkLogin, changePassWord, createUser, updateData, getMyProfile, updateMyProfile,getAppointment,updateYourImage,getProfile,getDoctorProfile,getDoctor };

