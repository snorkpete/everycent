class LlmModelsController < ApplicationController
  before_action :authenticate_user!

  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  before_action :set_llm_model, only: [:show, :update, :destroy]

  respond_to :json

  def index
    @llm_models = LlmModel.sorted
    respond_with(@llm_models, LlmModelSerializer)
  end

  def show
    respond_with(@llm_model, LlmModelSerializer)
  end

  def create
    @llm_model = LlmModel.new(llm_model_params)
    @llm_model.save
    respond_with(@llm_model, LlmModelSerializer)
  end

  def update
    @llm_model.update(llm_model_params)
    respond_with(@llm_model, LlmModelSerializer)
  end

  def destroy
    @llm_model.destroy
    respond_with(@llm_model, LlmModelSerializer)
  end

  private

  def set_llm_model
    @llm_model = LlmModel.find(params[:id])
  end

  def llm_model_params
    params.fetch(:llm_model, {}).permit(
      :provider, :name, :display_name, :url,
      :input_token_cost, :output_token_cost,
      :cache_read_token_cost, :cache_write_token_cost,
      :thinking_token_cost, :active
    )
  end
end
