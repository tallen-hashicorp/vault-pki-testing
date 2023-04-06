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

vault write auth/approle/login \
    role_id=$ROLEID \
    secret_id=$SECRETID
```

### Configure PKI

#### Configure root CA
```bash
vault secrets enable pki
vault secrets tune -max-lease-ttl=87600h pki

vault write -field=certificate pki/root/generate/internal \
     common_name="example.com" \
     issuer_name="root-2022" \
     ttl=87600h > root_2022_ca.crt

vault write pki/roles/2022-servers allow_any_name=true
vault write pki/config/urls \
     issuing_certificates="$VAULT_ADDR/v1/pki/ca" \
     crl_distribution_points="$VAULT_ADDR/v1/pki/crl"

```

#### Configure intermediate CA

```bash
vault secrets enable -path=pki_int pki
vault secrets tune -max-lease-ttl=43800h pki_int

vault write -format=json pki_int/intermediate/generate/internal \
     common_name="example.com Intermediate Authority" \
     issuer_name="example-dot-com-intermediate" \
     | jq -r '.data.csr' > pki_intermediate.csr

vault write -format=json pki/root/sign-intermediate \
     issuer_ref="root-2022" \
     csr=@pki_intermediate.csr \
     format=pem_bundle ttl="43800h" \
     | jq -r '.data.certificate' > intermediate.cert.pem

vault write pki_int/intermediate/set-signed certificate=@intermediate.cert.pem

vault write pki_int/roles/example-dot-com \
     issuer_ref="$(vault read -field=default pki_int/config/issuers)" \
     allowed_domains="localhost" \
     allow_subdomains=true \
     max_ttl="720h"

vault write pki_int/issue/example-dot-com common_name="localhost" ttl="24h"
```

---
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

## Ensure you habve rne ROLEID and SECRETID set
export ROLEID=$(vault read -field=role_id auth/approle/role/client/role-id)
export SECRETID=$(vault write -field=secret_id -f auth/approle/role/client/secret-id)

node index.js
```

## Run Client
```bash
cd Client
node index.js
```

