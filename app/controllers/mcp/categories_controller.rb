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
            exclude_from_overspend_tracking: c.exclude_from_overspend_tracking
          }
        end

      render json: { categories: categories }
    end
  end
end
