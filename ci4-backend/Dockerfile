FROM php:8.2-cli

# Install system dependencies and required PHP extensions for CodeIgniter 4
RUN apt-get update && apt-get install -y libicu-dev \
    && docker-php-ext-install mysqli intl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy application source
COPY . .

EXPOSE 8000

# Start PHP built-in server on the CI4 public directory
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
