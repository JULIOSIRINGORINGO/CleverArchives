Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      'localhost:3000',
      '127.0.0.1:3000',
      /\Ahttp:\/\/.*\.localhost:3000\z/, # any subdomain of localhost:3000
      /\Ahttp:\/\/(.*?\.)?lvh\.me(:\d+)?\z/,  # root and subdomains of lvh.me
      /\Ahttps:\/\/(.*?\.)?cleverarchives\.com\z/ # root and subdomains of cleverarchives.com
    )
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization'],
      credentials: false
  end
end
