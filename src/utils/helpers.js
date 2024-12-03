// utils/helpers.js
export const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return 'NA'; // Default value for missing names
    const firstInitial = firstName ? firstName[0].toUpperCase() : '';
    const lastInitial = lastName ? lastName[0].toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };
  