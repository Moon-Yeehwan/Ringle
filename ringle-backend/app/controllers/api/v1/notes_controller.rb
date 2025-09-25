class Api::V1::NotesController < ApplicationController
  # CSRF 관련 필터 없음 (API 모드이므로 필요X)

  before_action :set_note, only: %i[show update destroy]
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  def index
    notes = Note.order(created_at: :desc)
    render json: notes.map { |n| serialize(n) }
  end

  def show
    render json: serialize(@note)
  end

  def create
    note = Note.new(note_params)
    if note.save
      render json: serialize(note), status: :created, location: api_v1_note_url(note)
    else
      render json: { errors: note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @note.update(note_params)
      render json: serialize(@note)
    else
      render json: { errors: @note.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @note.destroy
    head :no_content
  end

  private

  def set_note
    @note = Note.find(params[:id])
  end

  def note_params
    params.require(:note).permit(:title, :body)
  end

  def serialize(note)
    note.as_json(only: %i[id title body created_at updated_at])
  end

  def render_not_found
    render json: { error: "Note not found" }, status: :not_found
  end
end
