module Api
  module V1
    class PingController < ApplicationController
      def show
        render json: { ok: true, time: Time.current.iso8601 }
      end
    end
  end
end
