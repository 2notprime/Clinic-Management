function splitFullName(fullName) {
    const nameParts = fullName.trim().split(' ');

    if (nameParts.length === 1) {
        return {
            firstName: nameParts[0],
            lastName: ''
        };
    }

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    return {
        firstName,
        lastName
    };
}

function getNextSevenDays() {
    const result = {};
    const today = new Date();

    // Đảm bảo rằng ngày hôm nay bắt đầu từ 00:00:00 theo giờ địa phương (UTC +7)
    today.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây và mili giây về 0

    // Lấy múi giờ Việt Nam (UTC+7)
    const offset = 7 * 60; // Chuyển múi giờ thành phút (7 giờ * 60 phút)

    for (let i = 0; i < 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i); // Tăng số ngày

        // Điều chỉnh giờ cho múi giờ địa phương (UTC +7)
        nextDay.setMinutes(nextDay.getMinutes() + offset);

        const isoDate = nextDay.toISOString(); // Chuyển đổi thành chuỗi ISO
        result[isoDate] = []; // Gán mỗi ngày làm key và value là mảng rỗng
    }

    return result;
}


function doctorIdtoUserId(doctorId) {
    return parseInt(doctorId.replace('doc', ''));
}

function convertTimeType(time) {
    const timeSlotMapping = {
        "07:00 AM - 08:00 AM": "T1",
        "08:00 AM - 09:00 AM": "T2",
        "09:00 AM - 10:00 AM": "T3",
        "10:00 AM - 11:00 AM": "T4",
        "01:00 PM - 02:00 PM": "T5",
        "02:00 PM - 03:00 PM": "T6",
        "03:00 PM - 04:00 PM": "T7",
        "04:00 PM - 05:00 PM": "T8",
    };
    return timeSlotMapping[time];
}

module.exports = { splitFullName, getNextSevenDays, doctorIdtoUserId, convertTimeType }