import axios from 'axios';


axios.get('https://localhost:8443')
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