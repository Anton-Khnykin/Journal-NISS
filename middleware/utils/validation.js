const isEmptyOrNull = string => {
  return !string || !string.trim();
};

const isInvalidEmail = email => {
  if (email.length > 254) {
    return true;
  }
  const exp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return !exp.test(email);
};

const isEmpty = object => {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

const isInvalidDate = string => {
  return isNaN(Date.parse(string));
}

const removeAllButChars = string => {
  return string.replace(/[^0-9a-zA-Zа-яА-Я_]/g, '');
}

const cleanSearchQuery = (query, delimeter) => {
  let words = query.split(' ');

  for (let i = 0; i < words.length; i++) {
    words[i] = removeAllButChars(words[i]);
    if (words[i].length === 0) {
      delete words[i];
    }
  }
  
  words = words.filter((e, i) => i in words);

  return words.join(delimeter);
}

const replaceNull = str => str ? str : '';

const replaceChar = value => value.replace(/[^0-9]/g, '');

const isFieldEmpty = (prop, value, errors) => {
  if (isEmptyOrNull(value)) {
    Object.assign(errors, { [prop]: 'Поле не должно быть пустым' });
    return true;
  }
  Object.assign(errors, { [prop]: null });
  return false;
}

module.exports = {
  isEmptyOrNull,
  isInvalidEmail,
  isEmpty,
  isInvalidDate,
  removeAllButChars,
  cleanSearchQuery,
  replaceNull,
  replaceChar,
  isFieldEmpty
};
