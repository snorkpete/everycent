module Mcp
  class CategoriesController < AppController
    def index
      categories = AllocationCategory
        .all
        .order(:name)
        .map do |c|
          {
            id: c.id,
            name: c.name,
            budget_role: c.budget_role
          }
        end

      render json: { categories: categories }
    end
  end
end
