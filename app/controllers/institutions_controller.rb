class InstitutionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_institution, only: [:show, :edit, :update, :destroy]

  respond_to :json

  def index
    @institutions = Institution.all.order(:name)
    respond_with(@institutions, InstitutionSerializer)
  end

  def show
    respond_with(@institution, InstitutionSerializer)
  end

  def new
    @institution = Institution.new
    respond_with(@institution, InstitutionSerializer)
  end

  def edit
  end

  def create
    @institution = Institution.new(institution_params)
    @institution.save
    respond_with(@institution, InstitutionSerializer)
  end

  def update
    @institution.update(institution_params)
    respond_with(@institution, InstitutionSerializer)
  end

  def destroy
    @institution.destroy
    respond_with(@institution, InstitutionSerializer)
  end

  private
    def set_institution
      @institution = Institution.find(params[:id])
    end

    def institution_params
      params.fetch(:institution, {}).permit(:name)
    end
end
