class Api::V1::PingController < ApplicationController
  def index
    render json: { ok: true, time: Time.zone.now }
  end
end
