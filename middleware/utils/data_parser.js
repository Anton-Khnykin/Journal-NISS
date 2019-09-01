import { isEmptyOrNull } from 'utils/validation'

// Parse name

export const getFullName = (credentials, lang) => {
  const middleName =
    isEmptyOrNull(credentials[`middle_name_${lang}`]) ?
      '' :
      (' ' + credentials[`middle_name_${lang}`].trim());
  return credentials[`last_name_${lang}`].trim() + ' ' + credentials[`first_name_${lang}`].trim() + middleName;
}

export const getShortName = (credentials, lang) => {
  const middleName =
    isEmptyOrNull(credentials[`middle_name_${lang}`]) ? 
      '' :
      ('\xa0' + credentials[`middle_name_${lang}`].charAt(0) + '.');
  return credentials[`last_name_${lang}`].trim() + '\xa0' + credentials[`first_name_${lang}`].charAt(0) + '.' + middleName;
}

export const getNames = (names, lang) => {
  let result = '';
  for (const name of names) {
    result += getFullName(name, lang) + ', ';
  }
  return result.substring(0, result.length - 2);
}

export const getShortNames = (names, lang) => {
  let result = '';
  for (const name of names) {
    result += getShortName(name, lang) + ', ';
  }
  return result.substring(0, result.length - 2);
}

// Parse timestamp

export const getDate = (date, withTime = false) => {
  const fullDate = new Date(date);
  
  const tempDay = fullDate.getDate();
  const day = tempDay/10 <= 1 ? ('0' + tempDay) : tempDay;
  
  const tempMonth = fullDate.getMonth();
  const month = tempMonth/10 <= 1 ? ('0' + (tempMonth + 1)) : (tempMonth + 1);

  const year = fullDate.getFullYear();

  if (withTime) {
    const year = fullDate.getFullYear();

    const tempHours = fullDate.getHours();
    const hours = tempHours/10 <= 1 ? ('0' + tempHours) : tempHours;

    const tempMinutes = fullDate.getMinutes();
    const minutes = tempMinutes/10 <= 1 ? ('0' + tempMinutes) : tempMinutes;
    
    return day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
  }

  return day + '/' + month + '/' + year;
};

export const getTimestamp = item => {
  const stringArr = item.split(/[-/.]/);
  const day = stringArr[0];
  const month = stringArr[1] - 1;
  const year = stringArr[2];
  return new Date(year, month, day).getTime();
}

// Parse sequelize data

export const getPlainData = data => {
  if (data instanceof Array) {
    return data = data.map(item => item.toJSON());
  }
  else if (data instanceof Object) {
    return data = data.toJSON();
  }
  else {
    return data;
  }
}

// Parse keywords

export const getKeywords = keywords => {
  return keywords.replace(/,/g, ', ');
}