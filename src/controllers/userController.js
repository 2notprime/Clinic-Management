const { handleUserLogin } = require('../services/user-services');
const { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById } = require('../services/CRUDservices')
const { splitFullName } = require('../algorithm/algorithm')
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
        id: req.query.id,
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

module.exports = { checkLogin, changePassWord, createUser, updateData };
