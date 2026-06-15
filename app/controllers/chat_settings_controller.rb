class ChatSettingsController < ApplicationController
  set_current_tenant_through_filter
  before_action do
    set_current_tenant current_household
  end

  def index
    render json: ChatSetting.as_hash
  end

  def create
    ChatSetting.update_settings(chat_setting_params)
    render json: ChatSetting.as_hash
  end

  private

  def chat_setting_params
    params.permit(:chat_enabled, :llm_model_id, :max_tool_iterations, :extras)
  end
end
