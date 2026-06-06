module Mcp
  class CategoriesController < AppController
    def index
      render json: { categories: Mcp::CategoryList.new.results }
    end
  end
end
