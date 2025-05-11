class SpecialEventsController < ApplicationController
  before_action :authenticate_user!

  # Find the current household to use for household scoping
  # This 3 lines should be present in every controller (except the User controller)
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  before_action :set_special_event, only: [:show, :update, :destroy]

  respond_to :json

  def index
    @special_events = SpecialEvent.all.order(:name)
    respond_with(@special_events, SpecialEventSerializer)
  end

  def show
    respond_with(@special_event, SpecialEventSerializer)
  end

  def create
    @special_event = SpecialEvent.new(special_event_params)
    @special_event.save
    respond_with(@special_event, SpecialEventSerializer)
  end

  def update
    @special_event.update(special_event_params)
    respond_with(@special_event, SpecialEventSerializer)
  end

  def destroy
    @special_event.destroy
    respond_with(@special_event, SpecialEventSerializer)
  end

  private

  def set_special_event
    @special_event = SpecialEvent.find(params[:id])
  end

  def special_event_params
    params.fetch(:special_event, {}).permit(:name, :budget_amount, :actual_amount)
  end
end
