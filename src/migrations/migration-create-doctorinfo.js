'use strict';

const { sequelize } = require("../models");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('doctorinfos', {

            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            doctorId:{
                allowNull:false,
                type: Sequelize.INTEGER
            },
            info:{
                allowNull:false,
                type: Sequelize.TEXT
            },
            appointmentFee:{
                allowNull:false,
                type: Sequelize.INTEGER
            }    
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('doctorinfos');
    }
};