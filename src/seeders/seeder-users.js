'use strict';

const { hashPassword } = require('../services/CRUDservices');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Sử dụng await đúng cách bên trong hàm async
    const hashedPassword = await hashPassword('123456');

    return queryInterface.bulkInsert('Users', [{
      email: 'admin@gmail.com',
      password: hashedPassword,
      firstName: 'Nguyen',
      lastName: 'Rin',
      address: 'HCM',
      gender: 1,
      image: null,
      roleId: 'R0',
      positionId: 'P0',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa dữ liệu đã thêm trong up
    await queryInterface.bulkDelete('Users', { email: 'admin@gmail.com' }, {});
  }
};
