export const isValidVietnamesePhone = (phone: string): boolean => {
    if (!phone) return false;

    // Chuẩn hóa: bỏ khoảng trắng, dấu gạch ngang
    const cleaned = phone.replace(/[\s\-\.]/g, '');

    // Regex: 0[3|5|7|8|9] + 8 chữ số tiếp theo
    const regex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6|7|8|9]|8[0-9]|9[0-9])[0-9]{7}$/;

    return regex.test(cleaned);
};

export const isValidDateOfBirth = (dob: string): boolean => {

    const regex = /^(\d{1,2})\/(\d{2})\/(\d{4})$/;
    const match = dob.match(regex);
    if (!match) return false;

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) return false;

    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) return false;

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) return false;

    return true;
};

// Convert d/MM/yyyy → yyyy-MM-dd để backend C# parse được
export const toIsoDate = (dob: string): string | null => {
    const regex = /^(\d{1,2})\/(\d{2})\/(\d{4})$/;
    const match = dob.match(regex);
    if (!match) return null;

    const day = match[1].padStart(2, '0');
    const month = match[2];
    const year = match[3];

    return `${year}-${month}-${day}`; // yyyy-MM-dd
};

