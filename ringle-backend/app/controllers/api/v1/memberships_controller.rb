class Api::V1::MembershipsController < Api::V1::ApplicationController
  def index = render json: Membership.all
  def show  = render json: Membership.find(params[:id])
  def create
    render json: Membership.create!(params.permit(:name,:days,:can_learn,:can_chat,:can_analyze)), status: :created
  end
  def destroy
    Membership.find(params[:id]).destroy!
    head :no_content
  end
end
