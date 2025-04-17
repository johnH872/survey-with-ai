#!/bin/bash

# Cấu hình domain
domains=(lhhrm.xyz www.lhhrm.xyz)
email="taduyhoang10@gmail.com" # Thay email của bạn vào đây
staging=0 # Đặt thành 1 nếu muốn test trước

# Tạo thư mục certbot nếu chưa có
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Tải các file cấu hình SSL
if [ ! -e "./certbot/conf/options-ssl-nginx.conf" ] || [ ! -e "./certbot/conf/ssl-dhparams.pem" ]; then
  echo "### Tải các tham số TLS ..."
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > ./certbot/conf/options-ssl-nginx.conf
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ./certbot/conf/ssl-dhparams.pem
fi

# Tạo chứng chỉ tạm thời
echo "### Tạo chứng chỉ tạm thời ..."
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:4096 -days 1\
    -keyout '/etc/letsencrypt/live/$domains/privkey.pem' \
    -out '/etc/letsencrypt/live/$domains/fullchain.pem' \
    -subj '/CN=localhost'" certbot

# Khởi động nginx tạm thời
echo "### Khởi động nginx ..."
docker-compose up --force-recreate -d frontend

# Xóa chứng chỉ tạm thời
echo "### Xóa chứng chỉ tạm thời ..."
docker-compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot

# Yêu cầu chứng chỉ Let's Encrypt
echo "### Yêu cầu chứng chỉ Let's Encrypt ..."
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Chọn chế độ staging nếu cần
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $email \
    $domain_args \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal" certbot

# Khởi động lại nginx
echo "### Khởi động lại nginx ..."
docker-compose exec frontend nginx -s reload 