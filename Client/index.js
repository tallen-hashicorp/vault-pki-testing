import axios from 'axios';

async function loginToVault(){
    const login = await axios.post('http://127.0.0.1:8200/v1/auth/approle/login', {
        "role_id": process.env.ROLEID,
        "secret_id": process.env.SECRETID
      });
    return login.data.auth.client_token
}

async function getServer(){
    const token = await loginToVault();

    axios.get('http://127.0.0.1:3000')
        .then(function (response) {
            // handle success
            console.log(response.status);
        })
        .catch(function (error) {
            // handle error
            console.log("error");
        })
        .finally(function () {
            // always executed
        });
}

getServer();