module Mcp
  class LlmUsageController < AppController
    def create
      llm_model = LlmModel.find_by(id: params[:llm_model_id])
      return render json: { error: 'LLM model not found' }, status: :not_found unless llm_model

      records = LlmUsageRecord.create_batch!(
        llm_model: llm_model,
        records: params.require(:records)
      )

      render json: { created: records.size }, status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { errors: [e.message] }, status: :unprocessable_entity
    end
  end
end
