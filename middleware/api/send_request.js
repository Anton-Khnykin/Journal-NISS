import 'isomorphic-unfetch';

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const ROOT_URL = dev ? `http://localhost:${port}` : 'https://journal-system.herokuapp.com';


const getFileName = contentDisposition => {
  const fileNameRegExp = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/ig;
  const matches = contentDisposition.match(fileNameRegExp);
  return matches[1] === undefined ?
    matches[0].substr(9).split('"').join('') :
    decodeURIComponent(matches[1].substr(17));
}

export default async function sendRequest(path, opts = {}) {
  const headers = Object.assign({}, opts.headers || {});
  const response = await fetch(
    `${ROOT_URL}${path}`,
    Object.assign({ credentials: 'same-origin' }, opts, { headers }),
  );

  let data = response;

  if (response.status === 200) {
    if (response.headers.get('Content-Type') !== null &&
        response.headers.get('Content-Type').includes('application/json')) {
      data = await response.json();
    }
    else if (response.headers.get('Content-Disposition') !== null &&
            response.headers.get('Content-Disposition').includes('attachment')) {
      data = {  
        data: await response.blob(),
        name: getFileName(response.headers.get('Content-Disposition')),
        type: response.headers.get('Content-Type'),
        status: response.status
      };
    }
  }
  else {
    let responseJSON;
    try {
      responseJSON = await response.json();
      data = {
        status: response.status,
        message: responseJSON.message
      };
    }
    catch (err) {
      data = {
        status: response.status,
        message: 'Ошибка на сервере'
      };
    }
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
