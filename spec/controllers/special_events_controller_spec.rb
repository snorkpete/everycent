require 'rails_helper'

RSpec.describe SpecialEventsController, type: :controller do
  render_views false

  before do
    @household = create(:household)
    ActsAsTenant.current_tenant = @household
  end

  describe '#index' do
    before :each do
      create(:special_event, name: 'Birthday Party')
      create(:special_event, name: 'Wedding')
      create(:special_event, name: 'Holiday')
    end

    context "when not logged in" do
      it 'has an unauthorized response' do
        get :index
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'has a response of success' do
        get :index
        expect(response).to be_successful
      end

      it 'has 3 items in special_events assignment' do
        get :index
        expect(assigns(:special_events).size).to eq 3
      end
    end
  end

  describe '#show' do
    before :each do
      @special_event = create(:special_event, name: 'Birthday Party')
    end

    context "when not logged in" do
      it 'has an unauthorized response' do
        get :show, params: { id: @special_event.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'has a response of success' do
        get :show, params: { id: @special_event.id }
        expect(response).to be_successful
      end

      it 'assigns the correct special event' do
        get :show, params: { id: @special_event.id }
        expect(assigns(:special_event)).to eq @special_event
      end
    end
  end

  describe '#create' do
    context "when not logged in" do
      it 'has an unauthorized response' do
        post :create, params: { special_event: { name: 'New Event', budget_amount: 1000, actual_amount: 0 } }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'creates a new special event' do
        expect {
          post :create, params: { special_event: { name: 'New Event', budget_amount: 1000, actual_amount: 0 } }
        }.to change(SpecialEvent, :count).by(1)
      end

      it 'has a response of success' do
        post :create, params: { special_event: { name: 'New Event', budget_amount: 1000, actual_amount: 0 } }
        expect(response).to be_successful
      end
    end
  end

  describe '#update' do
    before :each do
      @special_event = create(:special_event, name: 'Birthday Party')
    end

    context "when not logged in" do
      it 'has an unauthorized response' do
        put :update, params: { id: @special_event.id, special_event: { name: 'Updated Event' } }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'updates the special event' do
        put :update, params: { id: @special_event.id, special_event: { name: 'Updated Event' } }
        @special_event.reload
        expect(@special_event.name).to eq 'Updated Event'
      end

      it 'has a response of success' do
        put :update, params: { id: @special_event.id, special_event: { name: 'Updated Event' } }
        expect(response).to be_successful
      end
    end
  end

  describe '#destroy' do
    before :each do
      @special_event = create(:special_event, name: 'Birthday Party')
    end

    context "when not logged in" do
      it 'has an unauthorized response' do
        delete :destroy, params: { id: @special_event.id }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "when logged in" do
      before :each do
        @user = create(:user, household: @household)
        auth_request(@user)
      end

      it 'destroys the special event' do
        expect {
          delete :destroy, params: { id: @special_event.id }
        }.to change(SpecialEvent, :count).by(-1)
      end

      it 'has a response of success' do
        delete :destroy, params: { id: @special_event.id }
        expect(response).to be_successful
      end
    end
  end
end
