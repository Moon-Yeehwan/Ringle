# ringle-backend/config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 프론트가 뜨는 두 가지 호스트 모두 허용
    origins 'http://localhost:5173', 'http://127.0.0.1:5173'

    resource '*',
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
