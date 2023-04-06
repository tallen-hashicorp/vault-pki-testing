import axios from 'axios';

axios.get('http://127.0.0.1:3000')
  .then(function (response) {
    // handle success
    console.log(response.status);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });