const bcrypt = require('bcrypt');
const db = require('../models/index');
const { sequelize } = db;
const { Error, Op, where } = require('sequelize');
const { raw } = require('express');
const salt = bcrypt.genSaltSync(10);

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject('Error hashing password');
        } else {
          resolve(hash);
        }
      });
    }, 2000); // Giả lập độ trễ 2 giây
  });
}

async function createNewUser(data) {
  try {
    // Gọi hàm hashPassword và chờ kết quả
    let hashPassWordFromBcrypt = await hashPassword(data.password);

    // Tạo người dùng mới
    await db.User.create({
      email: data.email,
      password: hashPassWordFromBcrypt,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      phonenumber: data.phonenumber,
      gender: data.gender === '1' ? true : false,
      roleId: data.roleId,
    });

    return 'Create new user succeed'; // Trả về thành công
  } catch (e) {
    throw new Error(e); // Thêm lỗi nếu có
  }
}

async function getAllUser() {
  try {
    let users = await db.User.findAll({
      raw: true,
    });
    return users;
  } catch (e) {
    throw new Error(e);
  }
}

async function getAllDoctor() {
  try {
    const query = `select * from Users JOIN doctorinfos ON Users.id = doctorinfos.doctorId   JOIN DoctorWithSpecialty ON doctorinfos.doctorId = DoctorWithSpecialty.doctorId`
    
    //`
    //   SELECT Users.id, Users.firstName ,Users.lastName,Users.image, Users.address,Users.phonenumber,Users.gender,Users.roleId,Users.positionId, doctorinfos.*, DoctorWithSpecialty.*, specialties.*
    // FROM Users
    // JOIN doctorinfos ON Users.id = doctorinfos.doctorId
    // JOIN DoctorWithSpecialty ON doctorinfos.doctorId = DoctorWithSpecialty.doctorId
    // JOIN specialties ON DoctorWithSpecialty.specialtyId = specialties.id
    // ORDER BY Users.id;
    // `;

    const [results, metadata] = await db.sequelize.query(query);

    
    
    let doctors = []
    for(let doc of results){
      let specialtyName = await db.Specialty.findOne({
        where: {
          id: doc.specialtyId
           },
           attributes: ['name'],
           raw: true
      })

  

      let doctor ={
        _id: 'doc' + doc.doctorId,
        name: 'Dr. ' + doc.firstName+' '+doc.lastName,
        image: doc.image,
        speciality: specialtyName.name,
        degree: doc.degree,
        experience: doc.experience===1?doc.experience + ' year':doc.experience + ' years',
        about: doc.info ,
        fees: doc.appointmentFee,
        address: {
            line1: doc.address,
            line2: ''
        }
      }

      doctors.push(doctor)
    }

    return doctors;
  } catch (error) {
    console.error("An error occurred while fetching doctor data:", error);
    throw error;
  }
}




async function getUserById(userId) {
  try {
    let user = await db.User.findOne({
      where: { id: userId },
      raw: true,

    });

    if (user) {
      return user
    } else {
      return {}
    }
  } catch (e) {
    throw new Error(e);
  }
}

async function getUserRole(userId) {
  try {
    let user = await db.User.findOne({
      where: { id: userId },
      raw: true,

    });

    let Role = await db.Allcode.findOne({
      where: { id: user.roleId }
    })

    return Role.value;
  } catch (e) {
    throw new Error(e);
  }
}

async function updateUserData(data) {
  try {
    let user = await db.User.findOne({
      where: { id: data.id },

    })
    if (user) {
      user.firstName = data.firstName;
      user.lastName = data.lastName;
      user.address = data.address;
      user.phonenumber = data.phonenumber;
      user.gender = data.gender;
      user.image = data.image


      await user.save();
      let allUsers = await db.User.findAll();
      return allUsers

    } else {
      return {}
    }

  } catch (e) {
    throw new Error(e);
  }
}

async function deleteUserById(userId) {
  try {
    let user = await db.User.findOne({
      where: { id: userId }
    })
    if (user) {
      await user.destroy();

    }

    return "delete successful";

  } catch (e) {
    throw new Error(e);
  }
}

module.exports = { hashPassword, createNewUser, getAllUser, getUserById, updateUserData, deleteUserById, getUserRole,getAllDoctor};
