const requestHeaders = (cookie, withFiles = false) => {
  const headers = { 
    'Accept': 'application/json'
  };
  if (!withFiles) {
    headers['Content-Type'] = 'application/json; charset=UTF-8'
  }
  return cookie !== undefined ? Object.assign(headers, { 'Cookie': cookie }) : headers;
}

export default requestHeaders;
