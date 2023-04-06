# vault-pki-testing

## Configure Vault

### Configure Auth

```bash
vault policy write client client-policy.hcl

vault auth enable approle

vault write auth/approle/role/client \
    secret_id_ttl=10m \
    token_num_uses=10 \
    token_ttl=20m \
    policies=client
    token_max_ttl=30m \
    secret_id_num_uses=40

export ROLEID=$(vault read -field=role_id auth/approle/role/client/role-id)
export SECRETID=$(vault write -field=secret_id -f auth/approle/role/client/secret-id)
```


## Install
```bash
cd Server
npm install
cd ..
cd Client
npm install
cd ..
```

## Run Server
```bash
cd Server
node index.js
```

## Run Client
```bash
cd Client

## Ensure you habve rne ROLEID and SECRETID set
export ROLEID=$(vault read -field=role_id auth/approle/role/client/role-id)
export SECRETID=$(vault write -field=secret_id -f auth/approle/role/client/secret-id)

node index.js
```

