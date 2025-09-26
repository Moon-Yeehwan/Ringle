class Api::V1::ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: { error: { message: e.record.errors.full_messages.join(",") } }, status: :unprocessable_entity
  end
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: { message: "Not Found" } }, status: :not_found
  end
end
