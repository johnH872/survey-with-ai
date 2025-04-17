#!/bin/bash

# Cấu hình domain
domains=(lhhrm.xyz www.lhhrm.xyz)
email="taduyhoang10@gmail.com" # Thay email của bạn vào đây
staging=0 # Đặt thành 1 nếu muốn test trước

data_path="/app/survey-app/survey-with-ai/certbot"
rsa_key_size=4096

# Kiểm tra và dừng các container đang chạy
echo "### Stopping existing containers ..."
docker compose down -v

# Tạo các thư mục cần thiết
echo "### Creating necessary directories ..."
mkdir -p "$data_path/conf"
mkdir -p "$data_path/www"
mkdir -p "$data_path/conf/live/$domains"
mkdir -p "$data_path/conf/archive/$domains"
mkdir -p "$data_path/conf/renewal"
chmod -R 777 "$data_path"

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
docker compose run --rm --entrypoint "\
  mkdir -p /etc/letsencrypt/live/$domains && \
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Starting nginx ..."
docker compose up --force-recreate -d frontend
sleep 5 # Đợi nginx khởi động

echo "### Checking nginx status ..."
docker compose ps frontend

echo "### Deleting dummy certificate for $domains ..."
docker compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate for $domains ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker compose run --rm --entrypoint "\
  mkdir -p /etc/letsencrypt/live/$domains && \
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Checking certificate files ..."
ls -la "$data_path/conf/live/$domains"

echo "### Reloading nginx ..."
docker compose exec frontend nginx -s reload 